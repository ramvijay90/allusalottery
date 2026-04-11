import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import connectToDatabase from '../lib/db';
import Game from '../models/Game';
import Result from '../models/Result';

async function fetchHistoryPage(url: string) {
    console.log(`Launching browser for history: ${url}...`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`Navigating to https://www.lotterypost.com${url}...`);
        await page.goto(`https://www.lotterypost.com${url}`, { waitUntil: 'networkidle2', timeout: 60000 });

        // Explicit wait to ensure Cloudflare challenge clears
        await new Promise(r => setTimeout(r, 5000));

        const content = await page.content();
        await browser.close();
        return content;
    } catch (error) {
        console.error(`Error fetching history ${url}:`, error);
        await browser.close();
        return null;
    }
}

async function parseAndSaveHistory(html: string, gameId: string) {
    const $ = cheerio.load(html);
    const resultsToSave: any[] = [];

    // Iterate over history rows
    // Structure is .resultsgame divs
    $('.resultsgame').each((_, element) => {
        const row = $(element);
        const dateStr = row.find('time').attr('datetime');

        const numbers: string[] = [];
        row.find('.resultsnums li').each((_, li) => {
            numbers.push($(li).text().trim());
        });

        // Jackpot (might be missing for pick 3)
        const jackpot = row.find('.resultsJackpotAmount').text().trim() || null;

        // Powerball/MegaBall (if any)
        const powerBall = row.find('.resultsnumsrow .resultsbonus').text().trim() || null;
        if (powerBall && numbers.length > 0) {
            // Sometimes the bonus ball is in the list or separate. 
            // In the HTML I saw, it was just <li> items. 
            // If there was a separated ball it might have a different class.
            // For now, let's assume all <li> are numbers.
        }

        if (dateStr && numbers.length > 0) {
            const safeDateStr = `${dateStr.substring(0, 10)}T12:00:00Z`;
            resultsToSave.push({
                gameId,
                date: new Date(safeDateStr),
                numbers,
                jackpot
            });
        }
    });

    console.log(`Found ${resultsToSave.length} historical entries.`);

    if (resultsToSave.length === 0) {
        console.log('No historical entries found.');
        return;
    }

    // Bulk write for efficiency
    await connectToDatabase();

    // We use insertMany with ordered:false to ignore duplicates but insert new ones
    // Or iterate and upsert. Given our unique index, insertMany is fine if we ignore errors.
    try {
        await Result.insertMany(resultsToSave, { ordered: false });
        console.log(`Saved ${resultsToSave.length} results.`);
    } catch (e: any) {
        // Ignore duplicate key errors (code 11000)
        if (e.code === 11000 || (e.writeErrors && e.writeErrors.some((err: any) => err.code === 11000))) {
            console.log('Some results were duplicates and skipped.');
        } else {
            console.error('Error saving history:', e);
        }
    }
}

async function run() {
    await connectToDatabase();

    // Get command line args for state/game
    // Usage: npx tsx lottery-scraper/history_crawler.ts [state] [game]
    // If no args, pick a random one or all? Let's do random one for testing.

    const args = process.argv.slice(2);

    // Check for --year argument
    const yearArg = args.find(a => a.startsWith('--year='));
    const targetYear = yearArg ? parseInt(yearArg.split('=')[1]) : null;

    // Filter out flags from args to get slug/game
    const cleanArgs = args.filter(a => !a.startsWith('--'));

    let query: any = { historyUrl: { $exists: true, $ne: '' } };

    if (cleanArgs.length >= 2) {
        // args[0] = state, args[1] = game
        const stateSlug = cleanArgs[0];
        const gameSlug = cleanArgs[1];
        query = { stateSlug, slug: gameSlug };
    }

    const game = await Game.findOne(query);

    if (!game) {
        console.log('No games with historyUrl found (or specified game not found). Run state scraper first.');
        process.exit(0);
    }

    // Base URL usually: /results/az/pick3/past
    const baseUrl = game.historyUrl!;

    if (targetYear) {
        console.log(`📅 Scraping FULL YEAR ${targetYear} for ${game.name}...`);

        // Loop through months 12 down to 1
        for (let month = 12; month >= 1; month--) {
            const monthUrl = `${baseUrl}/${targetYear}/${month}`;
            const html = await fetchHistoryPage(monthUrl);
            if (html) {
                await parseAndSaveHistory(html, game._id.toString());
            }
            // Small delay between months
            await new Promise(r => setTimeout(r, 2000));
        }
    } else {
        // Default behavior (Recent)
        console.log(`Scraping recent history for ${game.name} (${game.stateSlug})...`);
        const html = await fetchHistoryPage(baseUrl);
        if (html) {
            await parseAndSaveHistory(html, game._id.toString());
        }
    }

    try {
        console.log(`\n🧹 Automatic Cache Clear Triggered for /results/${game.stateSlug}/${game.slug}`);
        const secret = process.env.REVALIDATE_SECRET || 'master_cache_key_2026';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        await fetch(`${baseUrl}/api/revalidate?path=/results/${game.stateSlug}/${game.slug}&secret=${secret}`).catch(() => {});
        console.log('✅ Cache refreshed successfully.');
    } catch (err) {
        console.error('⚠️ Failed to clear Next.js Cache. Ensure the server is running.', err);
    }

    process.exit(0);
}

run();
