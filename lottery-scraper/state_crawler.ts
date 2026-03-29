import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import connectToDatabase from '../lib/db';
import Game from '../models/Game';
import State from '../models/State';

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
            const dateStr = drawBlock.find('time').attr('datetime');
            const lastDrawDate = dateStr ? new Date(dateStr) : new Date();

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

            // Parse Next Draw Date (simplistic)
            let nextDrawDate = new Date(); 

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
        await Game.findOneAndUpdate(
            { stateSlug: game.stateSlug, slug: game.slug },
            game,
            { upsert: true, new: true }
        );
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

    // Explicitly close connection to exit script
    process.exit(0);
}

run();
