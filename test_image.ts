import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function fetchStatePage(url: string) {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 8000));
    const content = await page.content();
    await browser.close();
    return content;
}

(async () => {
    const html = await fetchStatePage('https://www.lotterypost.com/results/az');
    const $ = cheerio.load(html);
    $('.resultsgame').first().each((i, element) => {
        const gameBlock = $(element);
        console.log(gameBlock.find('.resultslogo').html());
    });
})();
