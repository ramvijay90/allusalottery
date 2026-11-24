import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { revalidatePath } from 'next/cache';

export interface EuropeScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

export const ALL_EU_STATES = [
    'eu',
    'uk',
    'uk-eng',
    'uk-sct',
    'uk-wls',
    'uk-nir',
    'ie',
    'es',
    'es-cat',
    'it',
    'fr',
    'eu-de',
    'de-by'
];

interface ParsedGameItem {
    pattern: RegExp;
    targetSlug: string;
    stateSlugs: string[];
    name: string;
    drawDate: Date;
    numbers: string[];
    bonusBall?: string;
    powerBall?: string;
}

const FEED_CONFIGS = [
    {
        url: 'https://www.lotteryextreme.com/uk/',
        label: 'UK Feed'
    },
    {
        url: 'https://www.lotteryextreme.com/ireland/',
        label: 'Ireland Feed'
    },
    {
        url: 'https://www.lotteryextreme.com/euromillions/',
        label: 'EuroMillions Feed'
    },
    {
        url: 'https://www.lotteryextreme.com/eurojackpot/',
        label: 'EuroJackpot Feed'
    },
    {
        url: 'https://www.lotteryextreme.com/eurodreams/',
        label: 'EuroDreams Feed'
    },
    {
        url: 'https://www.lotteryextreme.com/la-primitiva/',
        label: 'Spain La Primitiva'
    },
    {
        url: 'https://www.lotteryextreme.com/bonoloto/',
        label: 'Spain Bonoloto'
    },
    {
        url: 'https://www.lotteryextreme.com/superenalotto/',
        label: 'Italy SuperEnalotto'
    },
    {
        url: 'https://www.lotteryextreme.com/lotto_de/',
        label: 'Germany Feed'
    }
];

// Map extracted titles to targets
const GAME_ROUTING: { pattern: RegExp; targetSlug: string; stateSlugs: string[] }[] = [
    // EuroMillions (Multi-country)
    {
        pattern: /euromillions\s*hotpicks/i,
        targetSlug: 'euromillions-hotpicks',
        stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir']
    },
    {
        pattern: /euromillions|euro\s*millions/i,
        targetSlug: 'euromillions',
        stateSlugs: ['eu', 'uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir', 'ie', 'es', 'es-cat', 'fr']
    },
    // EuroJackpot
    {
        pattern: /eurojackpot/i,
        targetSlug: 'eurojackpot',
        stateSlugs: ['eu', 'it', 'eu-de', 'de-by']
    },
    // EuroDreams
    {
        pattern: /eurodreams/i,
        targetSlug: 'eurodreams',
        stateSlugs: ['eu', 'ie', 'es', 'es-cat', 'fr']
    },
    // UK Games
    {
        pattern: /^lotto\s*hotpicks/i,
        targetSlug: 'lotto-hotpicks',
        stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir']
    },
    {
        pattern: /^lotto/i, // Will match UK Lotto from /uk/ or Irish Lotto from /ireland/
        targetSlug: 'uk-lotto',
        stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir']
    },
    {
        pattern: /thunderball/i,
        targetSlug: 'thunderball',
        stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir']
    },
    {
        pattern: /set\s*for\s*life/i,
        targetSlug: 'set-for-life',
        stateSlugs: ['uk', 'uk-eng', 'uk-sct', 'uk-wls', 'uk-nir']
    },
    // Ireland Games
    {
        pattern: /lotto\s*plus\s*1/i,
        targetSlug: 'lotto-plus-1',
        stateSlugs: ['ie']
    },
    {
        pattern: /lotto\s*plus\s*2/i,
        targetSlug: 'lotto-plus-2',
        stateSlugs: ['ie']
    },
    {
        pattern: /daily\s*million\s*plus/i,
        targetSlug: 'daily-million-plus',
        stateSlugs: ['ie']
    },
    {
        pattern: /daily\s*million/i,
        targetSlug: 'daily-million',
        stateSlugs: ['ie']
    },
    // Spain Games
    {
        pattern: /primitiva/i,
        targetSlug: 'la-primitiva',
        stateSlugs: ['es', 'es-cat']
    },
    {
        pattern: /bonoloto/i,
        targetSlug: 'bonoloto',
        stateSlugs: ['es', 'es-cat']
    },
    // Italy Games
    {
        pattern: /superenalotto/i,
        targetSlug: 'superenalotto',
        stateSlugs: ['it']
    },
    // Germany Games
    {
        pattern: /lotto\s*6aus49|samstag\s*lotto|mittwoch\s*lotto/i,
        targetSlug: 'lotto-6aus49',
        stateSlugs: ['eu-de', 'de-by']
    },
    {
        pattern: /germany\s*keno|keno\s*deutschland/i,
        targetSlug: 'keno-germany',
        stateSlugs: ['eu-de', 'de-by']
    }
];

export async function scrapeEuropeLotteries(): Promise<EuropeScrapeResult> {
    const parsedItems: ParsedGameItem[] = [];

    // Helper to fetch and parse with 5s timeout per feed
    const fetchPromises = FEED_CONFIGS.map(async (feed) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

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

                // Extract Date
                let drawDate = new Date();
                const dateMatchIso = titleText.match(/(\d{4}-\d{2}-\d{2})/);
                if (dateMatchIso) {
                    const parsed = new Date(dateMatchIso[1]);
                    if (!isNaN(parsed.getTime())) drawDate = parsed;
                } else {
                    const dateMatchDmy = titleText.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
                    if (dateMatchDmy) {
                        const parsed = new Date(dateMatchDmy[1]);
                        if (!isNaN(parsed.getTime())) drawDate = parsed;
                    }
                }

                // Numbers & Bonus extraction
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
                    // Match to route
                    for (const route of GAME_ROUTING) {
                        if (route.pattern.test(titleText)) {
                            // If it's Ireland feed and title is "Lotto", route to irish-lotto
                            let targetSlug = route.targetSlug;
                            let stateSlugs = route.stateSlugs;
                            if (feed.url.includes('/ireland/') && targetSlug === 'uk-lotto') {
                                targetSlug = 'irish-lotto';
                                stateSlugs = ['ie', 'uk-nir'];
                            }

                            // Specific bonus/ball formatting
                            let mainNumbers = numbers;
                            let bonusBall = bonusParts.join(', ');

                            // Format SuperEnalotto: 6 main, 7th is Jolly, 8th is SuperStar
                            if (targetSlug === 'superenalotto' && mainNumbers.length >= 8) {
                                const main = mainNumbers.slice(0, 6);
                                bonusBall = `Jolly: ${mainNumbers[6]}, SuperStar: ${mainNumbers[7]}`;
                                mainNumbers = main;
                            } else if (targetSlug === 'la-primitiva' && mainNumbers.length >= 8) {
                                // 6 main, Complementario, Reintegro
                                const main = mainNumbers.slice(0, 6);
                                bonusBall = `Compl: ${mainNumbers[6]}, Reintegro: ${mainNumbers[7]}`;
                                mainNumbers = main;
                            } else if (targetSlug === 'bonoloto' && mainNumbers.length >= 8) {
                                const main = mainNumbers.slice(0, 6);
                                bonusBall = `Compl: ${mainNumbers[6]}, Reintegro: ${mainNumbers[7]}`;
                                mainNumbers = main;
                            } else if (targetSlug === 'lotto-6aus49' && mainNumbers.length >= 7) {
                                const main = mainNumbers.slice(0, 6);
                                bonusBall = `Superzahl: ${mainNumbers[6]}`;
                                mainNumbers = main;
                            } else if (targetSlug === 'uk-lotto' && bonusParts.length > 1) {
                                // Only keep the single bonus ball (last one)
                                bonusBall = bonusParts[bonusParts.length - 1];
                            }

                            parsedItems.push({
                                pattern: route.pattern,
                                targetSlug,
                                stateSlugs,
                                name: titleText.split(/[-–\n(]/)[0].trim(),
                                drawDate,
                                numbers: mainNumbers,
                                bonusBall: bonusBall || undefined
                            });
                            break;
                        }
                    }
                }
            });

        } catch (feedErr: any) {
            // Soft fail individual feed to keep scraping resilient
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
            const existingDateStr = gameDoc.lastDrawDate ? new Date(gameDoc.lastDrawDate).toISOString().split('T')[0] : '';
            const incomingDateStr = item.drawDate.toISOString().split('T')[0];

            if (!existingDateStr || incomingDateStr >= existingDateStr) {
                gameDoc.numbers = item.numbers;
                if (item.bonusBall) {
                    gameDoc.bonusBall = item.bonusBall;
                }
                gameDoc.lastDrawDate = item.drawDate;
                await gameDoc.save();

                // Upsert into Result history collection
                await Result.findOneAndUpdate(
                    { gameId: gameDoc._id, date: item.drawDate },
                    {
                        $set: {
                            gameId: gameDoc._id,
                            date: item.drawDate,
                            numbers: item.numbers,
                            bonusBall: item.bonusBall || '',
                            powerBall: '',
                            jackpot: gameDoc.jackpot || ''
                        }
                    },
                    { upsert: true }
                );

                updatedCount++;
                updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
            }
        }
    }

    // Revalidate European state pages
    for (const st of ALL_EU_STATES) {
        try {
            revalidatePath(`/results/${st}`);
        } catch (_) {}
    }

    return {
        totalScraped: parsedItems.length,
        updatedCount,
        updatedGames
    };
}
