import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface EuropeScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

export const ALL_EU_STATES = [
    'eu', 'uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir',
    'ie', 'es', 'es-cat', 'it', 'fr', 'eu-de', 'de-by'
];

interface ParsedGameItem {
    targetSlug: string;
    stateSlugs: string[];
    name: string;
    drawDate: Date;
    exactTimestamp?: boolean;
    numbers: string[];
    bonusBall?: string;
}

const FEED_CONFIGS = [
    { url: 'https://www.lotteryextreme.com/uk/', label: 'UK Feed' },
    { url: 'https://www.lotteryextreme.com/ireland/', label: 'Ireland Feed' },
    { url: 'https://www.lotteryextreme.com/euromillions/', label: 'EuroMillions Feed' },
    { url: 'https://www.lotteryextreme.com/eurojackpot/', label: 'EuroJackpot Feed' },
    { url: 'https://www.lotteryextreme.com/eurodreams/', label: 'EuroDreams Feed' },
    { url: 'https://www.lotteryextreme.com/la-primitiva/', label: 'Spain La Primitiva' },
    { url: 'https://www.lotteryextreme.com/bonoloto/', label: 'Spain Bonoloto' },
    { url: 'https://www.lotteryextreme.com/superenalotto/', label: 'Italy SuperEnalotto' },
    { url: 'https://www.lotteryextreme.com/lotto_de/', label: 'Germany Feed' },
    { url: 'https://www.lotteryextreme.com/el-gordo-de-la-primitiva/', label: 'Spain El Gordo' },
    { url: 'https://www.lotteryextreme.com/lototurf/', label: 'Spain Lototurf' }
];

const GAME_ROUTING: { pattern: RegExp; targetSlug: string; stateSlugs: string[] }[] = [
    { pattern: /euromillions\s*hotpicks/i, targetSlug: 'euromillions-hotpicks', stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir'] },
    { pattern: /euromillions|euro\s*millions/i, targetSlug: 'euromillions', stateSlugs: ['eu', 'uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir', 'ie', 'es', 'es-cat', 'fr'] },
    { pattern: /euro\s*jackpot/i, targetSlug: 'eurojackpot', stateSlugs: ['eu', 'it', 'eu-de', 'de-by'] },
    { pattern: /euro\s*dreams/i, targetSlug: 'eurodreams', stateSlugs: ['eu', 'ie', 'es', 'es-cat', 'fr'] },
    { pattern: /^lotto\s*hotpicks/i, targetSlug: 'lotto-hotpicks', stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir'] },
    { pattern: /^lotto\s*plus\s*1/i, targetSlug: 'lotto-plus-1', stateSlugs: ['ie'] },
    { pattern: /^lotto\s*plus\s*2/i, targetSlug: 'lotto-plus-2', stateSlugs: ['ie'] },
    { pattern: /lotto\s*6aus49|samstag\s*lotto|mittwoch\s*lotto|^lotto\s+(?:mittwoch|samstag)/i, targetSlug: 'lotto-6aus49', stateSlugs: ['eu-de', 'de-by'] },
    { pattern: /^lotto(?:\s|$)/i, targetSlug: 'uk-lotto', stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir'] },
    { pattern: /thunderball/i, targetSlug: 'thunderball', stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir'] },
    { pattern: /set\s*for\s*life/i, targetSlug: 'set-for-life', stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir'] },
    { pattern: /daily\s*million\s*plus/i, targetSlug: 'daily-million-plus', stateSlugs: ['ie'] },
    { pattern: /daily\s*million/i, targetSlug: 'daily-million', stateSlugs: ['ie'] },
    { pattern: /gordo/i, targetSlug: 'el-gordo', stateSlugs: ['es', 'es-cat'] },
    { pattern: /primitiva/i, targetSlug: 'la-primitiva', stateSlugs: ['es', 'es-cat'] },
    { pattern: /bonoloto/i, targetSlug: 'bonoloto', stateSlugs: ['es', 'es-cat'] },
    { pattern: /lototurf/i, targetSlug: 'lototurf', stateSlugs: ['es', 'es-cat'] },
    { pattern: /superenalotto/i, targetSlug: 'superenalotto', stateSlugs: ['it'] },
    { pattern: /germany\s*keno|keno\s*deutschland/i, targetSlug: 'keno-germany', stateSlugs: ['eu-de', 'de-by'] }
];

export async function scrapeEuropeLotteries(): Promise<EuropeScrapeResult> {
    const parsedItems: ParsedGameItem[] = [];

    const fetchPromises = FEED_CONFIGS.map(async (feed) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            const res = await fetch(feed.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                signal: controller.signal,
                next: { revalidate: 0 }
            });
            clearTimeout(timeoutId);

            if (!res.ok) return;

            const html = await res.text();
            const $ = cheerio.load(html);

            $('.xgm1').each((_, el) => {
                const titleText = $(el).text().replace(/\s+/g, ' ').trim();
                const xgm2 = $(el).next('.xgm2');

                // Distinguish 2:00pm vs 9:00pm for Ireland Daily Million
                let hourUtc = 12;
                let exactTimestamp = false;
                if (/2:00\s*pm/i.test(titleText)) {
                    hourUtc = 14;
                    exactTimestamp = true;
                } else if (/9:00\s*pm/i.test(titleText)) {
                    hourUtc = 21;
                    exactTimestamp = true;
                }

                const drawDate = parseDrawDateUtc(titleText, hourUtc);
                if (!drawDate) return;

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

                if (numbers.length === 0) return;

                for (const route of GAME_ROUTING) {
                    if (route.pattern.test(titleText)) {
                        let targetSlug = route.targetSlug;
                        let stateSlugs = route.stateSlugs;

                        if (feed.url.includes('/ireland/') && targetSlug === 'uk-lotto') {
                            targetSlug = 'irish-lotto';
                            stateSlugs = ['ie', 'uk-nir'];
                        } else if (feed.url.includes('/lotto_de/') && targetSlug === 'uk-lotto') {
                            targetSlug = 'lotto-6aus49';
                            stateSlugs = ['eu-de', 'de-by'];
                        } else if (feed.url.includes('/el-gordo-de-la-primitiva/') && /^\d/.test(titleText)) {
                            // Dedicated El Gordo feed title omits game name ("22 noviembre 2026 ...")
                            targetSlug = 'el-gordo';
                            stateSlugs = ['es', 'es-cat'];
                        }

                        let mainNumbers = numbers;
                        let bonusBall = bonusParts.join(', ');

                        if (targetSlug === 'superenalotto' && mainNumbers.length >= 8) {
                            bonusBall = `Jolly: ${mainNumbers[6]}, SuperStar: ${mainNumbers[7]}`;
                            mainNumbers = mainNumbers.slice(0, 6);
                        } else if ((targetSlug === 'la-primitiva' || targetSlug === 'bonoloto') && mainNumbers.length >= 8) {
                            bonusBall = `Compl: ${mainNumbers[6]}, Reintegro: ${mainNumbers[7]}`;
                            mainNumbers = mainNumbers.slice(0, 6);
                        } else if (targetSlug === 'lotto-6aus49' && mainNumbers.length >= 7) {
                            bonusBall = `Superzahl: ${mainNumbers[6]}`;
                            mainNumbers = mainNumbers.slice(0, 6);
                        } else if (targetSlug === 'uk-lotto' && bonusParts.length > 1) {
                            bonusBall = bonusParts[bonusParts.length - 1];
                        }

                        parsedItems.push({
                            targetSlug,
                            stateSlugs,
                            name: titleText.split(/[-–\n(]/)[0].trim(),
                            drawDate,
                            exactTimestamp,
                            numbers: mainNumbers,
                            bonusBall: bonusBall || undefined
                        });
                        break;
                    }
                }
            });
        } catch (feedErr: any) {
            console.warn(`[EuropeScraper] Feed warning for ${feed.label}:`, feedErr.message);
        }
    });

    await Promise.allSettled(fetchPromises);

    if (parsedItems.length === 0) {
        return {
            totalScraped: 0,
            updatedCount: 0,
            updatedGames: [],
            error: 'No European game items could be parsed from feeds'
        };
    }

    await connectToDatabase();

    let updatedCount = 0;
    const updatedGames: string[] = [];

    for (const item of parsedItems) {
        const matchingGames = await Game.find({
            stateSlug: { $in: item.stateSlugs },
            slug: item.targetSlug
        });

        for (const gameDoc of matchingGames) {
            const didUpdate = await upsertGameAndResult(gameDoc, {
                drawDate: item.drawDate,
                numbers: item.numbers,
                bonusBall: item.bonusBall || '',
                powerBall: '',
                exactTimestamp: item.exactTimestamp
            });
            if (didUpdate) {
                updatedCount++;
                updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
            }
        }
    }

    for (const st of ALL_EU_STATES) {
        try { revalidatePath(`/results/${st}`); } catch (_) {}
    }
    try { revalidatePath('/live-results'); } catch (_) {}

    return {
        totalScraped: parsedItems.length,
        updatedCount,
        updatedGames
    };
}
