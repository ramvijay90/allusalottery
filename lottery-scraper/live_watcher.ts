import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
import path from 'path';
import connectToDatabase from '../lib/db';
import Game from '../models/Game';
import Result from '../models/Result';
import { exec } from 'child_process';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

const WATCH_TARGETS: Record<string, { name: string; url: string; stateSlug: string; slug: string }> = {
    powerball: {
        name: 'Powerball',
        url: 'https://www.lotterypost.com/game/powerball',
        stateSlug: 'az',
        slug: 'powerball',
    },
    'mega-millions': {
        name: 'Mega Millions',
        url: 'https://www.lotterypost.com/game/mega-millions',
        stateSlug: 'az',
        slug: 'mega-millions',
    },
    'lotto-america': {
        name: 'Lotto America',
        url: 'https://www.lotterypost.com/game/lotto-america',
        stateSlug: 'de',
        slug: 'lotto-america',
    },
    'lotto-max': {
        name: 'Canada Lotto Max',
        url: 'https://www.lotterypost.com/game/lotto-max',
        stateSlug: 'ac',
        slug: 'lotto-max',
    },
    'canada-lotto-6-49': {
        name: 'Canada Lotto 6/49',
        url: 'https://www.lotterypost.com/game/canada-lotto-6-49',
        stateSlug: 'ac',
        slug: 'canada-lotto-6-49',
    },
};

function getAutoTarget(): string {
    const day = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    if (day === 1 || day === 3 || day === 6) return 'powerball';
    if (day === 2 || day === 5) return 'mega-millions';
    return 'powerball';
}

async function scrapeGameLatest(url: string) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        await page.waitForSelector('.resultsgame, .results-grid, .drawnumbers', { timeout: 15000 }).catch(() => {});

        const html = await page.content();
        await browser.close();

        const $ = cheerio.load(html);

        // Find primary winning numbers
        const numbers: string[] = [];
        let powerBall = '';

        $('.drawnumbers li, .resultsgame li.ball, .results-grid li').each((_, el) => {
            const ball = $(el);
            if (ball.hasClass('multiplier')) return;

            const text = ball.text().trim();
            if (!text || !/^\d+$/.test(text)) return;

            if (ball.hasClass('red') || ball.hasClass('resultsbonus') || ball.hasClass('megaball') || ball.hasClass('starball') || ball.hasClass('bonus')) {
                powerBall = text;
            } else {
                numbers.push(text);
            }
        });

        // Find draw date
        let rawDateStr = $('.resultsdate, .draw-date, time').first().text().trim();
        const dateMatch = rawDateStr.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}/i);

        let parsedDate: Date | null = null;
        if (dateMatch) {
            parsedDate = new Date(`${dateMatch[0]} 12:00:00 UTC`);
        }

        return {
            numbers,
            powerBall,
            date: parsedDate,
            rawDate: dateMatch ? dateMatch[0] : rawDateStr,
        };
    } catch (err: any) {
        await browser.close();
        console.error(`Error scraping ${url}:`, err.message);
        return null;
    }
}

async function main() {
    const args = process.argv.slice(2);
    let targetKey = getAutoTarget();

    for (const arg of args) {
        if (arg.startsWith('--game=')) {
            targetKey = arg.replace('--game=', '').toLowerCase().trim();
        }
    }

    const target = WATCH_TARGETS[targetKey] || WATCH_TARGETS['powerball'];
    console.log(`⚡ ========================================================`);
    console.log(`⚡ Instant Live Watcher: ${target.name}`);
    console.log(`⚡ Target URL: ${target.url}`);
    console.log(`⚡ Checking source every 60s for newly published numbers...`);
    console.log(`⚡ ========================================================`);

    await connectToDatabase();
    const currentDbGame = await Game.findOne({ stateSlug: target.stateSlug, slug: target.slug });
    const lastDbDate = currentDbGame?.lastDrawDate ? new Date(currentDbGame.lastDrawDate) : new Date(0);

    console.log(`📊 Current DB Latest Draw: ${lastDbDate.toISOString().split('T')[0]} | Numbers: ${JSON.stringify(currentDbGame?.numbers)}`);

    const maxMinutes = 35; // Maximum poll window (e.g. 11:00 PM to 11:35 PM)
    const startTime = Date.now();
    let pollCount = 0;

    while (Date.now() - startTime < maxMinutes * 60 * 1000) {
        pollCount++;
        const elapsedMins = ((Date.now() - startTime) / 60000).toFixed(1);
        console.log(`\n🔍 [Poll #${pollCount} - +${elapsedMins}m] Checking ${target.name} source...`);

        const liveData = await scrapeGameLatest(target.url);

        if (liveData && liveData.date && liveData.numbers.length >= 3) {
            const isNewDraw = liveData.date.getTime() > lastDbDate.getTime();
            const isDifferentNumbers = JSON.stringify(liveData.numbers) !== JSON.stringify(currentDbGame?.numbers);

            console.log(`   Source Date: ${liveData.date.toISOString().split('T')[0]} | Numbers: ${liveData.numbers.join('-')} [${liveData.powerBall}]`);

            if (isNewDraw || (isDifferentNumbers && liveData.date.getTime() >= lastDbDate.getTime())) {
                console.log(`\n🎉 NEW WINNING NUMBERS DETECTED INSTANTLY!`);
                console.log(`📅 Draw Date: ${liveData.date.toISOString().split('T')[0]}`);
                console.log(`🔢 Numbers: ${liveData.numbers.join(', ')} (Bonus: ${liveData.powerBall})`);
                console.log(`🚀 Triggering high-speed national propagation across all 50 states...`);

                const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
                const currentYear = liveData.date.getFullYear();

                await new Promise<void>((resolve) => {
                    exec(`${npxCmd} tsx lottery-scraper/national_sync.ts --year=${currentYear} --force`, (err, stdout) => {
                        if (stdout) console.log(stdout);
                        resolve();
                    });
                });

                console.log(`✨ Instant Live Sync Complete! Exiting watcher.`);
                process.exit(0);
            } else {
                console.log(`   ⏳ Latest published numbers on source are still from ${liveData.date.toISOString().split('T')[0]}.`);
            }
        } else {
            console.log(`   ⚠️ Could not parse valid numbers from source page.`);
        }

        console.log(`💤 Sleeping 60 seconds before next check...`);
        await new Promise(r => setTimeout(r, 60000));
    }

    console.log(`\n⏱️ Watch window of ${maxMinutes} minutes expired without new draw. Exiting.`);
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal live watcher error:', err);
    process.exit(1);
});
