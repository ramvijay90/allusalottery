import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { revalidatePath } from 'next/cache';

const STATE_SLUG_TO_LOTTERYUSA: Record<string, string> = {
    al: 'alabama', ak: 'alaska', az: 'arizona', ar: 'arkansas', ca: 'california',
    co: 'colorado', ct: 'connecticut', de: 'delaware', dc: 'district-of-columbia',
    fl: 'florida', ga: 'georgia', hi: 'hawaii', id: 'idaho', il: 'illinois',
    in: 'indiana', ia: 'iowa', ks: 'kansas', ky: 'kentucky', la: 'louisiana',
    me: 'maine', md: 'maryland', ma: 'massachusetts', mi: 'michigan', mn: 'minnesota',
    ms: 'mississippi', mo: 'missouri', mt: 'montana', ne: 'nebraska', nv: 'nevada',
    nh: 'new-hampshire', nj: 'new-jersey', nm: 'new-mexico', ny: 'new-york',
    nc: 'north-carolina', nd: 'north-dakota', oh: 'ohio', ok: 'oklahoma', or: 'oregon',
    pa: 'pennsylvania', ri: 'rhode-island', sc: 'south-carolina', sd: 'south-dakota',
    tn: 'tennessee', tx: 'texas', ut: 'utah', vt: 'vermont', va: 'virginia',
    wa: 'washington', wv: 'west-virginia', wi: 'wisconsin', wy: 'wyoming'
};

export interface ScrapedGameItem {
    name: string;
    slug: string;
    numbers: string[];
    specialBall?: string;
    drawDate: Date;
    jackpot?: string;
}

export interface StateScrapeResult {
    stateSlug: string;
    totalGamesFound: number;
    updatedCount: number;
    games: ScrapedGameItem[];
    error?: string;
}

/**
 * Scrape all local games for a single state from LotteryUSA (100% Free, no Cloudflare block)
 */
export async function scrapeStateFromLotteryUsa(stateSlug: string): Promise<StateScrapeResult> {
    const cleanSlug = stateSlug.toLowerCase().trim();
    const lusaState = STATE_SLUG_TO_LOTTERYUSA[cleanSlug] || cleanSlug;
    const url = `https://www.lotteryusa.com/${lusaState}/`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            return {
                stateSlug: cleanSlug,
                totalGamesFound: 0,
                updatedCount: 0,
                games: [],
                error: `HTTP ${response.status} from ${url}`
            };
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const parsedGames: ScrapedGameItem[] = [];

        // LotteryUSA uses cards or tables: article, .c-game-card, .c-result-card, or table rows
        // We query multiple selectors to reliably extract all games
        $('article, .c-game-card, .c-result-card, .game-card, tr.result-row').each((_, el) => {
            const card = $(el);

            // Game Name
            const nameEl = card.find('h2, h3, .c-game-card__title, .game-title, .title').first();
            const name = nameEl.text().trim();
            if (!name) return;

            // Numbers: Look for ball elements or numbers inside list items
            const numbers: string[] = [];
            let specialBall = '';

            // Check balls
            const ballEls = card.find('.c-ball, .ball, li, .num, .number');
            ballEls.each((_, b) => {
                const bEl = $(b);
                const txt = bEl.text().trim();
                // Check if purely numeric
                if (/^\d+$/.test(txt)) {
                    // Check if bonus/special ball
                    const isSpecial = bEl.hasClass('bonus') || bEl.hasClass('special') || bEl.hasClass('powerball') || bEl.hasClass('megaball');
                    if (isSpecial) {
                        specialBall = txt;
                    } else {
                        numbers.push(txt);
                    }
                }
            });

            if (numbers.length === 0) return;

            // Draw Date: Look for date string or time tag
            const dateText = card.find('time, .c-game-card__date, .date, .draw-date').first().text().trim();
            let drawDate = new Date();
            if (dateText) {
                const parsed = new Date(dateText);
                if (!isNaN(parsed.getTime())) {
                    drawDate = parsed;
                }
            }

            // Jackpot
            const jackpot = card.find('.c-game-card__jackpot, .jackpot, .prize').first().text().trim() || undefined;

            const computedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            parsedGames.push({
                name,
                slug: computedSlug,
                numbers,
                specialBall: specialBall || undefined,
                drawDate,
                jackpot
            });
        });

        await connectToDatabase();

        let updatedCount = 0;

        for (const pg of parsedGames) {
            // Find game in MongoDB by stateSlug and matching slug/name
            const gameDoc = await Game.findOne({
                stateSlug: cleanSlug,
                $or: [
                    { slug: pg.slug },
                    { name: { $regex: new RegExp(`^${pg.name}$`, 'i') } }
                ]
            });

            if (gameDoc) {
                // Check if incoming draw is newer than current lastDrawDate
                const existingDateStr = gameDoc.lastDrawDate ? new Date(gameDoc.lastDrawDate).toISOString().split('T')[0] : '';
                const incomingDateStr = pg.drawDate.toISOString().split('T')[0];

                if (!existingDateStr || incomingDateStr >= existingDateStr) {
                    gameDoc.numbers = pg.numbers;
                    if (pg.specialBall) gameDoc.powerBall = pg.specialBall;
                    if (pg.jackpot) gameDoc.jackpot = pg.jackpot;
                    gameDoc.lastDrawDate = pg.drawDate;
                    await gameDoc.save();

                    // Upsert into Result history collection
                    await Result.findOneAndUpdate(
                        { gameId: gameDoc._id, date: pg.drawDate },
                        {
                            $set: {
                                gameId: gameDoc._id,
                                date: pg.drawDate,
                                numbers: pg.numbers,
                                powerBall: pg.specialBall || '',
                                jackpot: pg.jackpot || ''
                            }
                        },
                        { upsert: true }
                    );

                    updatedCount++;
                }
            }
        }

        // Revalidate state page cache
        try {
            revalidatePath(`/results/${cleanSlug}`);
        } catch (_) {}

        return {
            stateSlug: cleanSlug,
            totalGamesFound: parsedGames.length,
            updatedCount,
            games: parsedGames
        };

    } catch (err: any) {
        console.error(`Error scraping state ${cleanSlug}:`, err.message);
        return {
            stateSlug: cleanSlug,
            totalGamesFound: 0,
            updatedCount: 0,
            games: [],
            error: err.message
        };
    }
}
