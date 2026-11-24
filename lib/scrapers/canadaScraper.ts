import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { revalidatePath } from 'next/cache';

export interface CanadaScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    error?: string;
}

// Map scraped game name patterns to target game slugs & regional stateSlugs
const CANADA_GAME_MAPPINGS: { pattern: RegExp; targetSlugs: string[]; stateSlugs?: string[] }[] = [
    {
        // Canada Lotto Max (Multi-Province)
        pattern: /^lotto\s*max/i,
        targetSlugs: ['lotto-max'],
        stateSlugs: ['ac', 'bc', 'on', 'qc', 'wc']
    },
    {
        // Canada Lotto 6/49 (Multi-Province)
        pattern: /^lotto\s*6[\/-]?49/i,
        targetSlugs: ['canada-lotto-6-49', 'lotto-6-49'],
        stateSlugs: ['ac', 'bc', 'on', 'qc', 'wc']
    },
    {
        // Daily Grand (Multi-Province)
        pattern: /^daily\s*grand/i,
        targetSlugs: ['daily-grand'],
        stateSlugs: ['ac', 'bc', 'on', 'qc', 'wc']
    },
    {
        // Ontario Games
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
        pattern: /^daily\s*keno/i,
        targetSlugs: ['daily-keno-evening', 'daily-keno-midday'],
        stateSlugs: ['on']
    },
    // Atlantic Canada Games
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
    // British Columbia Games
    {
        pattern: /^bc\s*49|bc\/49/i,
        targetSlugs: ['bc-49'],
        stateSlugs: ['bc']
    },
    // Quebec Games
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
    // Western Canada Games
    {
        pattern: /^western\s*(?:max|49|649)/i,
        targetSlugs: ['western-max', 'western-49'],
        stateSlugs: ['wc']
    }
];

export async function scrapeCanadaLotteries(): Promise<CanadaScrapeResult> {
    const url = 'https://www.lotteryextreme.com/canada/';

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

        interface ParsedCanadaItem {
            name: string;
            drawDate: Date;
            numbers: string[];
            bonusBall?: string;
        }

        const parsedItems: ParsedCanadaItem[] = [];

        $('.xgm1').each((_, el) => {
            const titleText = $(el).text().trim();
            const xgm2 = $(el).next('.xgm2');

            // Extract Date (YYYY-MM-DD)
            const dateMatch = titleText.match(/(\d{4}-\d{2}-\d{2})/);
            let drawDate = new Date();
            if (dateMatch) {
                const parsed = new Date(dateMatch[1]);
                if (!isNaN(parsed.getTime())) {
                    drawDate = parsed;
                }
            }

            // Clean Game Name
            const cleanName = titleText.split(/\s{2,}|\n|\(/)[0].trim();

            // Extract Numbers & Bonus
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
            // Find mapping rule
            const mapping = CANADA_GAME_MAPPINGS.find(m => m.pattern.test(item.name));
            if (!mapping) continue;

            const stateFilter = mapping.stateSlugs ? { $in: mapping.stateSlugs } : { $in: ['ac', 'bc', 'on', 'qc', 'wc'] };
            const slugFilter = { $in: mapping.targetSlugs };

            // Find all matching Canadian Game documents
            const matchingGames = await Game.find({
                stateSlug: stateFilter,
                slug: slugFilter
            });

            for (const gameDoc of matchingGames) {
                const existingDateStr = gameDoc.lastDrawDate ? new Date(gameDoc.lastDrawDate).toISOString().split('T')[0] : '';
                const incomingDateStr = item.drawDate.toISOString().split('T')[0];

                if (!existingDateStr || incomingDateStr >= existingDateStr) {
                    gameDoc.numbers = item.numbers;
                    if (item.bonusBall) {
                        gameDoc.powerBall = item.bonusBall;
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
                                powerBall: item.bonusBall || ''
                            }
                        },
                        { upsert: true }
                    );

                    updatedCount++;
                    updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
                }
            }
        }

        // Revalidate Canada provincial pages
        const provinces = ['ac', 'bc', 'on', 'qc', 'wc'];
        for (const prov of provinces) {
            try {
                revalidatePath(`/results/${prov}`);
            } catch (_) {}
        }

        return {
            totalScraped: parsedItems.length,
            updatedCount,
            updatedGames
        };

    } catch (err: any) {
        console.error('Error scraping Canadian lotteries:', err.message);
        return {
            totalScraped: 0,
            updatedCount: 0,
            updatedGames: [],
            error: err.message
        };
    }
}
