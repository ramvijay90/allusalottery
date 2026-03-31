import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function testAz() {
    const url = "https://www.lotterypost.com/results/az";
    console.log(`Launching browser for ${url}...`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await new Promise(r => setTimeout(r, 10000));

        const html = await page.content();
        const $ = cheerio.load(html);
        
        console.log(`\nAnalyzing Games on Page:`);
        $('.resultsgame').each((i, element) => {
            const gameBlock = $(element);
            const name = gameBlock.find('h2').text().trim();
            console.log(`[${i}] Block Name (h2): "${name}"`);
            
            gameBlock.find('.resultsdrawing').each((j, drawElement) => {
                const drawBlock = $(drawElement);
                const drawName = drawBlock.find('h2').text().trim();
                const date = drawBlock.find('time').text().trim();
                const numbers: string[] = [];
                drawBlock.find('.resultsnumsrow li').each((_, li) => {
                    numbers.push($(li).text().trim());
                });
                console.log(`   - Draw Name: "${drawName}", Date: "${date}", Numbers: ${numbers.join(', ')}`);
            });
        });

        await browser.close();
    } catch (error) {
        console.error(`Error:`, error);
        await browser.close();
    }
}

testAz();
