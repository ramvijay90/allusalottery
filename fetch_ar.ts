import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://www.lotterypost.com/results/ar', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 8000));
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    $('.resultsgame').each((i, element) => {
        const text = $(element).text();
        if (text.includes('Cash 3 Midday')) {
            console.log($(element).html());
        }
    });
})();
