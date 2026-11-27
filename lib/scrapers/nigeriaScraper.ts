import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface NigeriaScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

export const ALL_NG_STATES = ['ng'];

interface ParsedNgItem {
    targetSlug: string;
    name: string;
    drawDate: Date;
    numbers: string[];
    bonusBall?: string;
}

export async function scrapeNigeriaLotteries(): Promise<NigeriaScrapeResult> {
    const url = 'https://www.lotteryextreme.com/nigeria/';

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
        const parsedItems: ParsedNgItem[] = [];

        $('.xgm1').each((_, el) => {
            const titleText = $(el).text().replace(/\s+/g, ' ').trim();
            const xgm2 = $(el).next('.xgm2');
            const drawDate = parseDrawDateUtc(titleText);
            if (!drawDate) return;

            const main: string[] = [];
            const bonus: string[] = [];
            let isBonus = false;

            xgm2.find('ul.displayball li').each((_, li) => {
                const liEl = $(li);
                if (liEl.hasClass('dbx')) { isBonus = true; return; }
                const v = liEl.text().replace(/\s+/g, '').trim();
                if (/^\d+$/.test(v)) {
                    if (isBonus) bonus.push(v);
                    else main.push(v);
                }
            });

            if (main.length === 0) return;

            if (/mega\s*jackpot/i.test(titleText)) {
                parsedItems.push({
                    targetSlug: 'ng-mega-jackpot',
                    name: 'Nigeria Mega Jackpot',
                    drawDate,
                    numbers: main,
                    bonusBall: bonus.join(', ')
                });
            } else if (/lotto\s*6\/49/i.test(titleText)) {
                parsedItems.push({
                    targetSlug: 'ng-lotto-6-49',
                    name: 'Nigeria Lotto 6/49',
                    drawDate,
                    numbers: main,
                    bonusBall: bonus.join(', ')
                });
            }
        });

        await connectToDatabase();

        const games = await Game.find({
            stateSlug: { $in: ALL_NG_STATES },
            slug: { $in: parsedItems.map(i => i.targetSlug) }
        });

        let updatedCount = 0;
        const updatedGames: string[] = [];

        for (const item of parsedItems) {
            const matching = games.filter(g => g.slug === item.targetSlug);
            for (const gameDoc of matching) {
                const didUpdate = await upsertGameAndResult(gameDoc, {
                    drawDate: item.drawDate,
                    numbers: item.numbers,
                    bonusBall: item.bonusBall ?? '',
                    powerBall: ''
                });
                if (didUpdate) {
                    updatedCount++;
                    updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
                }
            }
        }

        if (updatedCount > 0) {
            for (const st of ALL_NG_STATES) {
                try { revalidatePath(`/results/${st}`); } catch (_) {}
            }
            try { revalidatePath('/live-results'); } catch (_) {}
        }

        return { totalScraped: parsedItems.length, updatedCount, updatedGames };
    } catch (err: any) {
        console.error('Error scraping Nigeria lotteries:', err.message);
        return { totalScraped: 0, updatedCount: 0, updatedGames: [], error: err.message };
    }
}
