import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface NewZealandScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

export const ALL_NZ_STATES = ['nz', 'nz-akl', 'nz-wlg', 'nz-can', 'nz-wko', 'nz-ota'];

interface ParsedNzItem {
    targetSlug: string;
    name: string;
    drawDate: Date;
    numbers: string[];
    bonusBall?: string;
    powerBall?: string;
    exactTimestamp?: boolean;
}

function extractUlNumbers($: cheerio.CheerioAPI, ul: any): string[] {
    const nums: string[] = [];
    $(ul).find('li').each((_, li) => {
        const val = $(li).text().replace(/\s+/g, '').trim();
        if (/^\d+$/.test(val)) {
            nums.push(val);
        }
    });
    return nums;
}

export async function scrapeNewZealandLotteries(): Promise<NewZealandScrapeResult> {
    const url = 'https://www.lotteryextreme.com/newzealand/';

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

        const parsedItems: ParsedNzItem[] = [];

        $('.xgm1').each((_, el) => {
            const titleText = $(el).text().replace(/\s+/g, ' ').trim();
            const xgm2 = $(el).next('.xgm2');
            const drawDate = parseDrawDateUtc(titleText);
            if (!drawDate) return;

            if (/^lotto\b/i.test(titleText)) {
                const uls = xgm2.find('ul.displayball').toArray();
                // ul[0]=LOTTO (6), ul[1]=Bonus (1), ul[2]=Power Ball (1), ul[3]=Strike! (4)
                const lottoNums = uls[0] ? extractUlNumbers($, uls[0]) : [];
                const bonusNums = uls[1] ? extractUlNumbers($, uls[1]) : [];
                const pbNums = uls[2] ? extractUlNumbers($, uls[2]) : [];
                const strikeNums = uls[3] ? extractUlNumbers($, uls[3]) : [];

                if (lottoNums.length >= 6) {
                    const bonusVal = bonusNums[0] || '';
                    parsedItems.push({
                        targetSlug: 'nz-lotto',
                        name: 'NZ Lotto',
                        drawDate,
                        numbers: lottoNums.slice(0, 6),
                        bonusBall: bonusVal
                    });

                    if (pbNums.length > 0) {
                        parsedItems.push({
                            targetSlug: 'nz-powerball',
                            name: 'NZ Powerball',
                            drawDate,
                            numbers: lottoNums.slice(0, 6),
                            bonusBall: pbNums[0],
                            powerBall: pbNums[0]
                        });
                    }
                }

                if (strikeNums.length >= 4) {
                    parsedItems.push({
                        targetSlug: 'nz-strike',
                        name: 'NZ Strike!',
                        drawDate,
                        numbers: strikeNums.slice(0, 4),
                        bonusBall: ''
                    });
                }
            } else if (/^keno\b/i.test(titleText)) {
                let hourUtc = 12;
                let exactTimestamp = false;
                if (/10\s*am/i.test(titleText)) { hourUtc = 10; exactTimestamp = true; }
                else if (/1\s*pm/i.test(titleText)) { hourUtc = 13; exactTimestamp = true; }
                else if (/3\s*pm/i.test(titleText)) { hourUtc = 15; exactTimestamp = true; }
                else if (/6\s*pm/i.test(titleText)) { hourUtc = 18; exactTimestamp = true; }

                const kenoDate = parseDrawDateUtc(titleText, hourUtc);
                if (!kenoDate) return;

                const nums: string[] = [];
                xgm2.find('ul.displayball').each((_, ul) => {
                    nums.push(...extractUlNumbers($, ul));
                });
                const multMatch = xgm2.text().match(/Multiplier:\s*([\d.]+)/i);
                if (nums.length > 0) {
                    parsedItems.push({
                        targetSlug: 'nz-keno',
                        name: 'NZ Keno',
                        drawDate: kenoDate,
                        numbers: nums,
                        bonusBall: multMatch ? `Multiplier: ${multMatch[1]}` : '',
                        exactTimestamp
                    });
                }
            } else if (/^bullseye\b/i.test(titleText)) {
                const ul = xgm2.find('ul.displayball').first();
                const nums = ul.length ? extractUlNumbers($, ul[0]) : [];
                if (nums.length > 0) {
                    parsedItems.push({
                        targetSlug: 'nz-bullseye',
                        name: 'Bullseye',
                        drawDate,
                        numbers: nums,
                        bonusBall: ''
                    });
                }
            }
        });

        await connectToDatabase();

        const targetSlugs = [...new Set(parsedItems.map(i => i.targetSlug))];
        const games = await Game.find({
            stateSlug: { $in: ALL_NZ_STATES },
            slug: { $in: targetSlugs }
        });

        let updatedCount = 0;
        const updatedGames: string[] = [];

        for (const item of parsedItems) {
            const matchingGames = games.filter(g => g.slug === item.targetSlug);
            for (const gameDoc of matchingGames) {
                const didUpdate = await upsertGameAndResult(gameDoc, {
                    drawDate: item.drawDate,
                    numbers: item.numbers,
                    bonusBall: item.bonusBall ?? '',
                    powerBall: item.powerBall ?? '',
                    exactTimestamp: item.exactTimestamp
                });
                if (didUpdate) {
                    updatedCount++;
                    updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
                }
            }
        }

        if (updatedCount > 0) {
            for (const st of ALL_NZ_STATES) {
                try { revalidatePath(`/results/${st}`); } catch (_) {}
            }
            try { revalidatePath('/live-results'); } catch (_) {}
        }

        return { totalScraped: parsedItems.length, updatedCount, updatedGames };
    } catch (err: any) {
        console.error('Error scraping New Zealand lotteries:', err.message);
        return { totalScraped: 0, updatedCount: 0, updatedGames: [], error: err.message };
    }
}
