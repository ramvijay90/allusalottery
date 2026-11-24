import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { revalidatePath } from 'next/cache';

export interface AustraliaScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

const ALL_AU_STATES = ['au-nsw', 'au-vic', 'au-qld', 'au-wa', 'au-sa', 'au-tas'];

const AU_GAME_MAPPINGS: { pattern: RegExp; targetSlug: string; stateSlugs: string[] }[] = [
    {
        // Powerball Australia
        pattern: /^powerball/i,
        targetSlug: 'powerball-australia',
        stateSlugs: ALL_AU_STATES
    },
    {
        // OZ Lotto
        pattern: /^oz\s*lotto/i,
        targetSlug: 'oz-lotto',
        stateSlugs: ALL_AU_STATES
    },
    {
        // Saturday Lotto / TattsLotto
        pattern: /^saturday\s*lotto|^tatts/i,
        targetSlug: 'saturday-lotto',
        stateSlugs: ALL_AU_STATES
    },
    {
        // Weekday Windfall
        pattern: /^weekday\s*windfall/i,
        targetSlug: 'weekday-windfall',
        stateSlugs: ALL_AU_STATES
    },
    {
        // Set for Life
        pattern: /^set\s*for\s*life/i,
        targetSlug: 'set-for-life',
        stateSlugs: ALL_AU_STATES
    },
    {
        // Super66
        pattern: /^super\s*66/i,
        targetSlug: 'super-66',
        stateSlugs: ALL_AU_STATES
    },
    {
        // Cash 3 (Western Australia)
        pattern: /^cash\s*3/i,
        targetSlug: 'cash-3',
        stateSlugs: ['au-wa']
    },
    {
        // Millionaire Medley
        pattern: /^millionaire\s*medley/i,
        targetSlug: 'millionaire-medley',
        stateSlugs: ['au-nsw', 'au-vic', 'au-qld', 'au-tas', 'au-sa']
    }
];

export async function scrapeAustraliaLotteries(): Promise<AustraliaScrapeResult> {
    const url = 'https://www.lotteryextreme.com/australia/';

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            return {
                totalScraped: 0,
                updatedCount: 0,
                updatedGames: [],
                error: `HTTP ${response.status} from ${url}`
            };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        interface ParsedAuItem {
            name: string;
            drawDate: Date;
            numbers: string[];
            bonusBall?: string;
        }

        const parsedItems: ParsedAuItem[] = [];

        $('.xgm1').each((_, el) => {
            const titleText = $(el).text().trim();
            const xgm2 = $(el).next('.xgm2');

            // Extract Date (YYYY-MM-DD) or (DD Month YYYY)
            let drawDate = new Date();
            const dateMatchIso = titleText.match(/(\d{4}-\d{2}-\d{2})/);
            if (dateMatchIso) {
                const parsed = new Date(dateMatchIso[1]);
                if (!isNaN(parsed.getTime())) drawDate = parsed;
            } else {
                const dateMatchText = titleText.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
                if (dateMatchText) {
                    const parsed = new Date(dateMatchText[1]);
                    if (!isNaN(parsed.getTime())) drawDate = parsed;
                }
            }

            // Clean Name: remove draw numbers like "Powerball 1592" -> "Powerball"
            const rawName = titleText.split(/[-–\n(]/)[0].trim();
            const cleanName = rawName.replace(/\s+\d+$/, '').trim();

            // Extract Numbers and Bonus/Supps
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
            // Find mapping rule
            const mapping = AU_GAME_MAPPINGS.find(m => m.pattern.test(item.name));
            if (!mapping) continue;

            const matchingGames = await Game.find({
                stateSlug: { $in: mapping.stateSlugs },
                slug: mapping.targetSlug
            });

            for (const gameDoc of matchingGames) {
                const existingDateStr = gameDoc.lastDrawDate ? new Date(gameDoc.lastDrawDate).toISOString().split('T')[0] : '';
                const incomingDateStr = item.drawDate.toISOString().split('T')[0];

                if (!existingDateStr || incomingDateStr >= existingDateStr) {
                    gameDoc.numbers = item.numbers;
                    if (item.bonusBall) {
                        if (mapping.targetSlug === 'powerball-australia') {
                            gameDoc.powerBall = item.bonusBall;
                        } else {
                            gameDoc.bonusBall = item.bonusBall;
                        }
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
                                powerBall: mapping.targetSlug === 'powerball-australia' ? (item.bonusBall || '') : ''
                            }
                        },
                        { upsert: true }
                    );

                    updatedCount++;
                    updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
                }
            }
        }

        // Revalidate Australian state pages
        for (const st of ALL_AU_STATES) {
            try {
                revalidatePath(`/results/${st}`);
            } catch (_) {}
        }

        return {
            totalScraped: parsedItems.length,
            updatedCount,
            updatedGames
        };

    } catch (err: any) {
        console.error('Error scraping Australian lotteries:', err.message);
        return {
            totalScraped: 0,
            updatedCount: 0,
            updatedGames: [],
            error: err.message
        };
    }
}
