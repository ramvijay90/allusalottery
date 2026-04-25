import puppeteer from 'puppeteer';
import connectToDatabase from '../lib/db';
import State from '../models/State';

async function fetchHubPage() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to LotteryPost Results Hub...');
        // Wait for DOM content (faster than networkidle2)
        await page.goto('https://www.lotterypost.com/results', { waitUntil: 'domcontentloaded', timeout: 90000 });

        // Explicit wait to ensure Cloudflare challenge clears
        await new Promise(r => setTimeout(r, 10000));

        const content = await page.content();
        await browser.close();
        return content;
    } catch (error) {
        console.error('Error fetching hub page:', error);
        await browser.close();
        return null;
    }
}

async function parseAndSaveStates(html: string) {
    // Puppeteer returns full HTML, we can still use Cheerio to parse it efficiently
    // OR just use Puppeteer's evaluation. Let's stick to Cheerio for existing logic compatibility if imports allow,
    // but better to import cheerio here again or just use simple regex/cheerio if already installed.
    // simpler: re-import cheerio.
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    const statesToSave: any[] = [];

    // 1. United States
    $('.section-us').next('.linkgrid').find('a').each((_, element) => {
        const name = $(element).text().trim();
        const href = $(element).attr('href');
        if (name && href) {
            statesToSave.push({
                name,
                slug: href.split('/').pop(),
                url: href,
                country: 'US'
            });
        }
    });

    // 2. Canada
    $('.section-ca').next('.linkgrid').find('a').each((_, element) => {
        const name = $(element).text().trim();
        const href = $(element).attr('href');
        if (name && href) {
            statesToSave.push({
                name,
                slug: href.split('/').pop(),
                url: href,
                country: 'Canada'
            });
        }
    });

    console.log(`Found ${statesToSave.length} states/regions.`);

    // Save to DB
    await connectToDatabase();

    for (const state of statesToSave) {
        await State.findOneAndUpdate(
            { slug: state.slug },
            state,
            { upsert: true, new: true }
        );
    }

    console.log('Database updated with states.');
}

async function run() {
    const html = await fetchHubPage();
    if (html) {
        await parseAndSaveStates(html);
    }
    process.exit(0);
}

run();
