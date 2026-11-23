import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import connectToDatabase from '../lib/db';
import Game from '../models/Game';
import Result from '../models/Result';

async function createBrowserSession(): Promise<{ browser: Browser; page: Page }> {
    const launchArgs = [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage'
    ];

    const proxy = process.env.SCRAPER_PROXY;
    if (proxy) {
        console.log(`Using Proxy: ${proxy}`);
        launchArgs.push(`--proxy-server=${proxy}`);
    }

    const cliArgs = process.argv.slice(2);
    const showBrowser = cliArgs.includes('--show');

    const browser = await puppeteer.launch({
        headless: !showBrowser,
        args: launchArgs
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    if (proxy && process.env.SCRAPER_PROXY_USERNAME && process.env.SCRAPER_PROXY_PASSWORD) {
        console.log('Authenticating Proxy...');
        await page.authenticate({
            username: process.env.SCRAPER_PROXY_USERNAME,
            password: process.env.SCRAPER_PROXY_PASSWORD
        });
    }

    return { browser, page };
}

async function fetchPageWithSession(page: Page, url: string): Promise<string | null> {
    const targetUrl = `https://www.lotterypost.com${url}`;
    console.log(`Navigating to ${targetUrl}...`);

    try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
        const hasResults = await page.waitForSelector('.resultsgame', { timeout: 10000 }).catch(() => null);

        if (!hasResults) {
            const pageText = await page.evaluate(() => document.body ? document.body.innerText : '').catch(() => '');
            if (pageText.includes('No results found') || pageText.includes('Page Not Found') || pageText.includes('There were no drawings')) {
                console.log(`ℹ️ No drawings held for this period on ${url}`);
                return null;
            }
            return null;
        }

        // Brief wait for any dynamic hydration
        await new Promise(r => setTimeout(r, 1000));
        return await page.content();
    } catch (error: any) {
        console.error(`Error loading ${url}:`, error.message);
        return null;
    }
}

async function parseAndSaveHistory(html: string, gameId: string): Promise<number> {
    const $ = cheerio.load(html);
    const resultsToSave: any[] = [];

    $('.resultsgame').each((_, element) => {
        const row = $(element);
        const dateStr = row.find('time').attr('datetime');

        // 1. Detect Powerball / Bonus Ball (.red, .resultsbonus, or dedicated row)
        let powerBall: string | null = null;
        const bonusLi = row.find('li.red, li.resultsbonus, li.bonus').first();
        if (bonusLi.length > 0) {
            const bVal = bonusLi.text().trim();
            if (/^\d+$/.test(bVal)) {
                powerBall = bVal;
            }
        }

        if (!powerBall) {
            row.find('.resultsnumsrow').each((_, r) => {
                const label = $(r).text();
                if (/powerball|mega ball|bonus|cash ball/i.test(label)) {
                    const val = $(r).find('li').first().text().trim();
                    if (/^\d+$/.test(val)) {
                        powerBall = val;
                    }
                }
            });
        }

        // 2. Detect Main / White Balls (Exclude .multiplier and bonus ball)
        const numbers: string[] = [];
        const firstRow = row.find('.resultsnumsrow').first();
        const mainUl = firstRow.length > 0 ? firstRow.find('ul.resultsnums li') : row.find('ul.resultsnums li');

        mainUl.each((_, li) => {
            const el = $(li);
            if (el.hasClass('multiplier') || el.hasClass('red') || el.hasClass('resultsbonus') || el.hasClass('bonus')) {
                return;
            }
            const val = el.text().trim();
            if (/^\d+$/.test(val)) {
                numbers.push(val);
            }
        });

        // Jackpot
        const jackpot = row.find('.resultsJackpotAmount').text().trim() || null;

        if (dateStr && numbers.length > 0) {
            const safeDateStr = `${dateStr.substring(0, 10)}T12:00:00Z`;
            resultsToSave.push({
                gameId,
                date: new Date(safeDateStr),
                numbers,
                jackpot,
                powerBall
            });
        }
    });

    if (resultsToSave.length === 0) {
        return 0;
    }

    await connectToDatabase();

    try {
        const bulkOps = resultsToSave.map(item => ({
            updateOne: {
                filter: { gameId: item.gameId, date: item.date },
                update: {
                    $set: {
                        gameId: item.gameId,
                        date: item.date,
                        numbers: item.numbers,
                        powerBall: item.powerBall,
                        jackpot: item.jackpot
                    }
                },
                upsert: true
            }
        }));

        await Result.bulkWrite(bulkOps, { ordered: false });
        console.log(`💾 Saved/Updated ${resultsToSave.length} clean draws in database.`);

        // Also update Game document with latest draw info
        const sorted = [...resultsToSave].sort((a, b) => b.date.getTime() - a.date.getTime());
        const latest = sorted[0];
        if (latest) {
            const currentGame = await Game.findById(gameId);
            if (currentGame && (!currentGame.lastDrawDate || new Date(latest.date) >= new Date(currentGame.lastDrawDate))) {
                await Game.findByIdAndUpdate(gameId, {
                    lastDrawDate: latest.date,
                    numbers: latest.numbers,
                    powerBall: latest.powerBall,
                    ...(latest.jackpot ? { jackpot: latest.jackpot } : {})
                });
                console.log(`🔄 Updated ${currentGame.name} latest draw: ${latest.date.toISOString().split('T')[0]} -> ${latest.numbers.join('-')}${latest.powerBall ? ' ['+latest.powerBall+']' : ''}`);
            }
        }
    } catch (e: any) {
        console.error('Error saving history batch:', e.message);
    }

    return resultsToSave.length;
}

async function run() {
    await connectToDatabase();

    const args = process.argv.slice(2);
    const yearArg = args.find(a => a.startsWith('--year='));
    const targetYear = yearArg ? parseInt(yearArg.split('=')[1]) : null;

    const cleanArgs = args.filter(a => !a.startsWith('--'));

    let query: any = { historyUrl: { $exists: true, $ne: '' } };

    if (cleanArgs.length >= 2) {
        const stateSlug = cleanArgs[0];
        const gameSlug = cleanArgs[1];
        query = { stateSlug, slug: gameSlug };
    }

    const game = await Game.findOne(query);

    if (!game) {
        console.log('No games matching query found. Run state crawler first.');
        process.exit(0);
    }

    const baseUrl = game.historyUrl!;
    console.log(`\n🎯 Target Game: ${game.name} (${game.stateSlug}) - Base: ${baseUrl}`);

    const { browser, page } = await createBrowserSession();

    try {
        if (targetYear) {
            console.log(`📅 Scraping FULL YEAR ${targetYear} for ${game.name} (Using Persistent Browser Session)...`);
            let totalYearDraws = 0;

            const now = new Date();
            const currentYear = now.getFullYear();
            const maxMonth = targetYear === currentYear ? (now.getMonth() + 1) : 12;

            // Loop through months maxMonth down to 1
            for (let month = maxMonth; month >= 1; month--) {
                const monthUrl = `${baseUrl}/${targetYear}/${month}`;
                console.log(`\n⏳ Fetching Month ${month}/${targetYear}...`);
                let html = await fetchPageWithSession(page, monthUrl);

                if (!html) {
                    console.log(`⚠️ Retry for Month ${month}/${targetYear}...`);
                    await new Promise(r => setTimeout(r, 2000));
                    html = await fetchPageWithSession(page, monthUrl);
                }

                if (html) {
                    const saved = await parseAndSaveHistory(html, game._id.toString());
                    totalYearDraws += saved;
                } else {
                    console.log(`ℹ️ Month ${month}/${targetYear} had no entries or reached game inception boundary.`);
                }

                // Brief cooldown between months
                await new Promise(r => setTimeout(r, 1000));
            }

            console.log(`\n🎉 Completed Year ${targetYear} for ${game.name}: ~${totalYearDraws} draws processed.`);
        } else {
            console.log(`Scraping recent history for ${game.name} (${game.stateSlug})...`);
            const html = await fetchPageWithSession(page, baseUrl);
            if (html) {
                await parseAndSaveHistory(html, game._id.toString());
            }
        }
    } finally {
        await browser.close();
    }

    try {
        const secret = process.env.REVALIDATE_SECRET || 'master_cache_key_2026';
        const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${siteUrl}/api/revalidate?path=/results/${game.stateSlug}/${game.slug}&secret=${secret}`).catch(() => {});
        console.log('✅ Next.js cache revalidated for game page.');
    } catch (err) {
        // Safe to ignore if local server not running
    }

    process.exit(0);
}

run().catch((err) => {
    console.error('Crawler error:', err);
    process.exit(1);
});
