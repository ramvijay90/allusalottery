import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface SouthAfricaScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

export const ALL_ZA_STATES = ['za'];

interface ParsedZaItem {
    targetSlug: string;
    name: string;
    drawDate: Date;
    numbers: string[];
    bonusBall?: string;
    powerBall?: string;
    jackpot?: string;
}

function parseDisplayBallUl($: cheerio.CheerioAPI, ul: any): { main: string[]; bonus: string } {
    const main: string[] = [];
    const bonusParts: string[] = [];
    let isBonus = false;

    $(ul).find('li').each((_, li) => {
        const liEl = $(li);
        if (liEl.hasClass('dbx')) {
            isBonus = true;
            return;
        }
        const val = liEl.text().replace(/\s+/g, '').trim();
        if (/^\d+$/.test(val)) {
            if (isBonus) bonusParts.push(val);
            else main.push(val);
        }
    });

    return { main, bonus: bonusParts.join(', ') };
}

async function fetchTextWithTimeout(url: string, timeoutMs = 8000): Promise<string | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: controller.signal,
            next: { revalidate: 0 }
        });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

export async function scrapeSouthAfricaLotteries(): Promise<SouthAfricaScrapeResult> {
    const parsedItems: ParsedZaItem[] = [];

    try {
        // Fetch primary LotteryExtreme South Africa hub + za.national-lottery.com for Lotto Plus 2 (Lotto 5 Max) concurrently
        const [leHtml, zaPlus2Html] = await Promise.all([
            fetchTextWithTimeout('https://www.lotteryextreme.com/south-africa/'),
            fetchTextWithTimeout('https://za.national-lottery.com/lotto-plus-2/results')
        ]);

        if (leHtml) {
            const $ = cheerio.load(leHtml);

            $('.xgm1').each((_, el) => {
                const titleText = $(el).text().replace(/\s+/g, ' ').trim();
                const xgm2 = $(el).next('.xgm2');
                const drawDate = parseDrawDateUtc(titleText);
                if (!drawDate) return;

                const uls = xgm2.find('ul.displayball').toArray();

                if (/^daily\s*lotto/i.test(titleText)) {
                    if (uls[0]) {
                        const p = parseDisplayBallUl($, uls[0]);
                        if (p.main.length > 0) {
                            parsedItems.push({
                                targetSlug: 'sa-daily-lotto',
                                name: 'SA Daily Lotto',
                                drawDate,
                                numbers: p.main,
                                bonusBall: p.bonus || ''
                            });
                        }
                    }
                    if (uls[1]) {
                        const p = parseDisplayBallUl($, uls[1]);
                        if (p.main.length > 0) {
                            parsedItems.push({
                                targetSlug: 'sa-daily-lotto-plus',
                                name: 'SA Daily Lotto Plus',
                                drawDate,
                                numbers: p.main,
                                bonusBall: p.bonus || ''
                            });
                        }
                    }
                } else if (/^powerball/i.test(titleText)) {
                    if (uls[0]) {
                        const p = parseDisplayBallUl($, uls[0]);
                        if (p.main.length > 0) {
                            parsedItems.push({
                                targetSlug: 'sa-powerball',
                                name: 'SA PowerBall',
                                drawDate,
                                numbers: p.main,
                                bonusBall: p.bonus,
                                powerBall: p.bonus
                            });
                        }
                    }
                    if (uls[1]) {
                        const p = parseDisplayBallUl($, uls[1]);
                        if (p.main.length > 0) {
                            parsedItems.push({
                                targetSlug: 'sa-powerball-plus',
                                name: 'SA PowerBall Plus',
                                drawDate,
                                numbers: p.main,
                                bonusBall: p.bonus,
                                powerBall: p.bonus
                            });
                        }
                    }
                } else if (/^lotto/i.test(titleText)) {
                    if (uls[0]) {
                        const p = parseDisplayBallUl($, uls[0]);
                        if (p.main.length > 0) {
                            parsedItems.push({
                                targetSlug: 'sa-lotto',
                                name: 'SA Lotto',
                                drawDate,
                                numbers: p.main,
                                bonusBall: p.bonus
                            });
                        }
                    }
                    if (uls[1]) {
                        const p = parseDisplayBallUl($, uls[1]);
                        if (p.main.length > 0) {
                            parsedItems.push({
                                targetSlug: 'sa-lotto-plus-1',
                                name: 'SA Lotto Plus 1',
                                drawDate,
                                numbers: p.main,
                                bonusBall: p.bonus
                            });
                        }
                    }
                }
            });
        }

        if (zaPlus2Html) {
            const $z = cheerio.load(zaPlus2Html);
            const dateStr = $z('.elem1 span.h2.fluid').first().text().replace(/\s+/g, ' ').trim();
            const drawDate = parseDrawDateUtc(dateStr);
            if (drawDate) {
                const mainNums: string[] = [];
                const bonusNums: string[] = [];
                $z('ul.balls li.ball').each((_, li) => {
                    const el = $z(li);
                    const val = el.text().trim();
                    if (!/^\d+$/.test(val)) return;
                    if (el.hasClass('bonus-ball')) bonusNums.push(val);
                    else mainNums.push(val);
                });
                const jpMatch = $z('.elem1').first().text().match(/Jackpot:\s*(R[\d,]+)/i);
                if (mainNums.length >= 6) {
                    parsedItems.push({
                        targetSlug: 'sa-lotto-plus-2',
                        name: 'SA Lotto Plus 2',
                        drawDate,
                        numbers: mainNums.slice(0, 6),
                        bonusBall: bonusNums[0] || '',
                        jackpot: jpMatch ? jpMatch[1] : undefined
                    });
                }
            }
        }

        if (parsedItems.length === 0) {
            return { totalScraped: 0, updatedCount: 0, updatedGames: [], error: 'No South Africa results parsed from feeds' };
        }

        await connectToDatabase();

        const targetSlugs = [...new Set(parsedItems.map(i => i.targetSlug))];
        const games = await Game.find({
            stateSlug: { $in: ALL_ZA_STATES },
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
                    jackpot: item.jackpot
                });
                if (didUpdate) {
                    updatedCount++;
                    updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
                }
            }
        }

        if (updatedCount > 0) {
            for (const st of ALL_ZA_STATES) {
                try { revalidatePath(`/results/${st}`); } catch (_) {}
            }
            try { revalidatePath('/live-results'); } catch (_) {}
        }

        return { totalScraped: parsedItems.length, updatedCount, updatedGames };
    } catch (err: any) {
        console.error('Error scraping South Africa lotteries:', err.message);
        return { totalScraped: 0, updatedCount: 0, updatedGames: [], error: err.message };
    }
}
