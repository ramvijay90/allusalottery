import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import connectToDatabase from '../lib/db';
import Game from '../models/Game';
import State from '../models/State';
import Result from '../models/Result';

async function fetchStatePage(url: string) {
    console.log(`Launching browser for ${url}...`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`Navigating to https://www.lotterypost.com${url}...`);
        // Wait for DOM content (faster than networkidle2)
        await page.goto(`https://www.lotterypost.com${url}`, { waitUntil: 'domcontentloaded', timeout: 90000 });

        // Explicit wait to ensure Cloudflare challenge clears
        await new Promise(r => setTimeout(r, 10000));

        const content = await page.content();
        await browser.close();
        return content;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        await browser.close();
        return null;
    }
}

async function parseAndSaveGames(html: string, stateSlug: string) {
    const $ = cheerio.load(html);
    const gamesToSave: any[] = [];

    $('.resultsgame').each((_, element) => {
        const gameBlock = $(element);

        // Elements Shared Across Drawings
        const link = gameBlock.find('.resultslogo a').attr('href');
        const sourceUrl = link || '';
        
        let historyUrl = '';
        const pastLink = gameBlock.find('a[href*="/past"]').attr('href');
        if (pastLink) {
            historyUrl = pastLink;
        } else if (sourceUrl) {
            historyUrl = `${sourceUrl}/past`;
        }

        const imgPath = gameBlock.find('.resultslogo img').attr('src');
        const imageUrl = imgPath ? `https://www.lotterypost.com${imgPath}` : '';

        // Multiple draws can exist inside a single .resultsgame
        gameBlock.find('.resultsdrawing').each((_, drawElement) => {
            const drawBlock = $(drawElement);

            // Game Name
            const name = drawBlock.find('h2').text().trim();
            if (!name) return;

            // Compute Slug explicitly from the precise name (since link slug might conflict on multiple draws)
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // Date
            // LotteryPost often puts the "Next Draw Date" as the first <time> tag. We want the latest past draw date.
            const timeTags = drawBlock.find('time');
            let dateStr = timeTags.first().attr('datetime');
            if (timeTags.length > 1) {
                // Usually the second time tag (or the last one before numbers) is the actual past drawing date
                dateStr = timeTags.last().attr('datetime'); 
            }
            // Strip the timezone offset and forcefully set it to 12:00 PM UTC to heavily prevent timezone shifting rendering issues globally.
            const safeDateStr = dateStr ? `${dateStr.substring(0, 10)}T12:00:00Z` : null;
            const lastDrawDate = safeDateStr ? new Date(safeDateStr) : new Date();

            // Numbers
            const numbers: string[] = [];
            drawBlock.find('.resultsnumsrow').first().find('li').each((_, li) => {
                numbers.push($(li).text().trim());
            });

            // Special Balls (Powerball, Mega Ball)
            let powerBall = '';
            const pbRow = drawBlock.find('.resultsnumsrow').filter((_, row) => $(row).text().includes('Powerball') || $(row).text().includes('Mega Ball'));
            if (pbRow.length > 0) {
                powerBall = pbRow.find('li').text().trim();
            }

            // Jackpot
            const jackpot = drawBlock.find('.resultsJackpotAmount span span').text().trim();
            const nextDrawText = drawBlock.find('.resultsNextDrawInfo .resultsnextdate').text().trim();

            // Parse Next Draw Date
            let nextDrawDate = new Date(); 
            if (nextDrawText) {
                const parsed = new Date(nextDrawText);
                if (!isNaN(parsed.getTime())) {
                    nextDrawDate = parsed;
                }
            }

            gamesToSave.push({
                name,
                slug,
                stateSlug,
                sourceUrl,
                historyUrl,
                lastDrawDate,
                numbers,
                powerBall,
                jackpot,
                nextDrawDate, // Todo: parse accurately
                imageUrl
            });
        });
    });

    console.log(`Found ${gamesToSave.length} games for ${stateSlug}.`);

    await connectToDatabase();

    for (const game of gamesToSave) {
        const updatedGame = await Game.findOneAndUpdate(
            { stateSlug: game.stateSlug, slug: game.slug },
            game,
            { upsert: true, returnDocument: 'after' }
        );

        // SYNC result to Results History Collection
        if (updatedGame && game.numbers.length > 0) {
            await Result.findOneAndUpdate(
                { gameId: updatedGame._id, date: game.lastDrawDate },
                {
                    gameId: updatedGame._id,
                    date: game.lastDrawDate,
                    numbers: game.numbers,
                    jackpot: game.jackpot,
                    powerBall: game.powerBall
                },
                { upsert: true, returnDocument: 'after' }
            );
        }
    }
}

async function run() {
    // 1. Connect to DB
    const conn = await connectToDatabase();
    // Wait for connection to be ready
    if (conn.connection.readyState !== 1) {
        console.log('Waiting for database connection...');
        await new Promise(resolve => conn.connection.once('open', resolve));
    }
    console.log('Database connected.');

    // 2. Determine State Slug
    const args = process.argv.slice(2);
    const stateSlug = args[0];

    if (!stateSlug) {
        console.error('Please provide a state slug. Usage: npm run scrape:state [slug]');
        process.exit(1);
    }

    const state = await State.findOne({ slug: stateSlug });
    let url = `/results/${stateSlug}`;

    if (state) {
        url = state.url;
    }

    const html = await fetchStatePage(url);
    if (html) {
        await parseAndSaveGames(html, stateSlug);
    }

    try {
        console.log(`\n🧹 Automatic Cache Clear Triggered for /results/${stateSlug}`);
        const secret = process.env.REVALIDATE_SECRET || 'master_cache_key_2026';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        await fetch(`${baseUrl}/api/revalidate?path=/results/${stateSlug}&secret=${secret}`).catch(() => {});
        await fetch(`${baseUrl}/api/revalidate?path=/&secret=${secret}`).catch(() => {});
        console.log('✅ Cache refreshed successfully.');
    } catch (err) {
        console.error('⚠️ Failed to clear Next.js Cache. Ensure the server is running.', err);
    }

    // Explicitly close connection to exit script
    process.exit(0);
}

run();
