import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface AustraliaScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

const ALL_AU_STATES = ['au-nsw', 'au-vic', 'au-qld', 'au-wa', 'au-sa', 'au-tas'];

const AU_GAME_MAPPINGS: { pattern: RegExp; targetSlug: string; stateSlugs: string[] }[] = [
    { pattern: /^powerball/i, targetSlug: 'powerball-australia', stateSlugs: ALL_AU_STATES },
    { pattern: /^oz\s*lotto/i, targetSlug: 'oz-lotto', stateSlugs: ALL_AU_STATES },
    { pattern: /^saturday\s*lotto|^tatts/i, targetSlug: 'saturday-lotto', stateSlugs: ALL_AU_STATES },
    { pattern: /^weekday\s*windfall/i, targetSlug: 'weekday-windfall', stateSlugs: ALL_AU_STATES },
    { pattern: /^set\s*for\s*life/i, targetSlug: 'set-for-life', stateSlugs: ALL_AU_STATES },
    { pattern: /^super\s*66/i, targetSlug: 'super-66', stateSlugs: ALL_AU_STATES },
    { pattern: /^cash\s*3/i, targetSlug: 'cash-3', stateSlugs: ['au-wa'] },
    { pattern: /^millionaire\s*medley/i, targetSlug: 'millionaire-medley', stateSlugs: ['au-nsw', 'au-vic', 'au-qld', 'au-tas', 'au-sa'] }
];

export async function scrapeAustraliaLotteries(): Promise<AustraliaScrapeResult> {
    const url = 'https://www.lotteryextreme.com/australia/';

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

            const rawName = titleText.split(/[-–\n(]/)[0].trim();
            const cleanName = rawName.replace(/\s+\d+$/, '').trim();

            const numbers: string[] = [];
            const bonusParts: string[] = [];
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
                        bonusParts.push(val);
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
                    bonusBall: bonusParts.join(', ') || undefined
                });
            }
        });

        await connectToDatabase();

        let updatedCount = 0;
        const updatedGames: string[] = [];

        for (const item of parsedItems) {
            const mapping = AU_GAME_MAPPINGS.find(m => m.pattern.test(item.name));
            if (!mapping) continue;

            const matchingGames = await Game.find({
                stateSlug: { $in: mapping.stateSlugs },
                slug: mapping.targetSlug
            });

            for (const gameDoc of matchingGames) {
                const isPowerball = mapping.targetSlug === 'powerball-australia';
                const didUpdate = await upsertGameAndResult(gameDoc, {
                    drawDate: item.drawDate,
                    numbers: item.numbers,
                    bonusBall: item.bonusBall || '',
                    powerBall: isPowerball ? (item.bonusBall || '') : ''
                });
                if (didUpdate) {
                    updatedCount++;
                    updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
                }
            }
        }

        for (const st of ALL_AU_STATES) {
            try { revalidatePath(`/results/${st}`); } catch (_) {}
        }
        try { revalidatePath('/live-results'); } catch (_) {}

        return { totalScraped: parsedItems.length, updatedCount, updatedGames };
    } catch (err: any) {
        console.error('Error scraping Australian lotteries:', err.message);
        return { totalScraped: 0, updatedCount: 0, updatedGames: [], error: err.message };
    }
}
