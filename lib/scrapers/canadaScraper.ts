import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface CanadaScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

const CANADA_GAME_MAPPINGS: { pattern: RegExp; targetSlugs: string[]; stateSlugs?: string[] }[] = [
    {
        pattern: /^lotto\s*max/i,
        targetSlugs: ['lotto-max'],
        stateSlugs: ['ac', 'bc', 'on', 'qc', 'wc']
    },
    {
        pattern: /^lotto\s*6[\/-]?49/i,
        targetSlugs: ['canada-lotto-6-49', 'lotto-6-49'],
        stateSlugs: ['ac', 'bc', 'on', 'qc', 'wc']
    },
    {
        pattern: /^daily\s*grand/i,
        targetSlugs: ['daily-grand'],
        stateSlugs: ['ac', 'bc', 'on', 'qc', 'wc']
    },
    {
        pattern: /^ontario\s*49/i,
        targetSlugs: ['ontario-49'],
        stateSlugs: ['on']
    },
    {
        pattern: /^lottario/i,
        targetSlugs: ['lottario'],
        stateSlugs: ['on']
    },
    {
        pattern: /^megadice/i,
        targetSlugs: ['megadice-lotto'],
        stateSlugs: ['on']
    },
    {
        pattern: /^daily\s*keno.*evening/i,
        targetSlugs: ['daily-keno-evening'],
        stateSlugs: ['on']
    },
    {
        pattern: /^daily\s*keno.*midday/i,
        targetSlugs: ['daily-keno-midday'],
        stateSlugs: ['on']
    },
    {
        pattern: /^daily\s*keno/i,
        targetSlugs: ['daily-keno-evening', 'daily-keno-midday'],
        stateSlugs: ['on']
    },
    {
        pattern: /^atlantic\s*49/i,
        targetSlugs: ['atlantic-49'],
        stateSlugs: ['ac']
    },
    {
        pattern: /^bucko/i,
        targetSlugs: ['bucko'],
        stateSlugs: ['ac']
    },
    {
        pattern: /^keno\s*atlantic/i,
        targetSlugs: ['keno-atlantic'],
        stateSlugs: ['ac']
    },
    {
        pattern: /^bc\s*49|bc\/49/i,
        targetSlugs: ['bc-49'],
        stateSlugs: ['bc']
    },
    {
        pattern: /^quebec\s*49|qu[eé]bec\s*49/i,
        targetSlugs: ['qu-bec-49', 'quebec-49'],
        stateSlugs: ['qc']
    },
    {
        pattern: /^banco/i,
        targetSlugs: ['banco'],
        stateSlugs: ['qc']
    },
    {
        pattern: /^western\s*max/i,
        targetSlugs: ['western-max'],
        stateSlugs: ['wc']
    },
    {
        pattern: /^western\s*(?:49|649)/i,
        targetSlugs: ['western-49'],
        stateSlugs: ['wc']
    }
];

export async function scrapeCanadaLotteries(): Promise<CanadaScrapeResult> {
    const url = 'https://www.lotteryextreme.com/canada/';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: controller.signal,
            next: { revalidate: 0 }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return { totalScraped: 0, updatedCount: 0, updatedGames: [], error: `HTTP ${response.status} from ${url}` };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const parsedItems: { name: string; drawDate: Date; numbers: string[]; bonusBall?: string }[] = [];

        $('.xgm1').each((_, el) => {
            const titleText = $(el).text().replace(/\s+/g, ' ').trim();
            const xgm2 = $(el).next('.xgm2');

            const drawDate = parseDrawDateUtc(titleText);
            if (!drawDate) return;

            const cleanName = titleText.split(/\s{2,}|\n|\(/)[0].trim();

            const numbers: string[] = [];
            let bonusBall = '';
            let isBonus = false;

            xgm2.find('ul.displayball li').each((_, b) => {
                const bEl = $(b);
                if (bEl.hasClass('dbx')) {
                    isBonus = true;
                    return;
                }
                const val = bEl.text().trim();
                if (/^\d+$/.test(val)) {
                    if (isBonus) {
                        bonusBall = val;
                    } else {
                        numbers.push(val);
                    }
                }
            });

            if (numbers.length > 0) {
                parsedItems.push({
                    name: cleanName,
                    drawDate,
                    numbers,
                    bonusBall: bonusBall || undefined
                });
            }
        });

        await connectToDatabase();

        let updatedCount = 0;
        const updatedGames: string[] = [];

        for (const item of parsedItems) {
            const mapping = CANADA_GAME_MAPPINGS.find(m => m.pattern.test(item.name));
            if (!mapping) continue;

            const stateFilter = mapping.stateSlugs ? { $in: mapping.stateSlugs } : { $in: ['ac', 'bc', 'on', 'qc', 'wc'] };
            const matchingGames = await Game.find({
                stateSlug: stateFilter,
                slug: { $in: mapping.targetSlugs }
            });

            for (const gameDoc of matchingGames) {
                const didUpdate = await upsertGameAndResult(gameDoc, {
                    drawDate: item.drawDate,
                    numbers: item.numbers,
                    powerBall: item.bonusBall
                });
                if (didUpdate) {
                    updatedCount++;
                    updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
                }
            }
        }

        for (const prov of ['ac', 'bc', 'on', 'qc', 'wc']) {
            try { revalidatePath(`/results/${prov}`); } catch (_) {}
        }
        try { revalidatePath('/live-results'); } catch (_) {}

        return { totalScraped: parsedItems.length, updatedCount, updatedGames };
    } catch (err: any) {
        console.error('Error scraping Canadian lotteries:', err.message);
        return { totalScraped: 0, updatedCount: 0, updatedGames: [], error: err.message };
    }
}
