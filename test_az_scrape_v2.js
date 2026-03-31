const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

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
        const gameBlocks = $('.resultsgame');
        console.log(`Found ${gameBlocks.length} total .resultsgame blocks.`);

        gameBlocks.each((i, element) => {
            const gameBlock = $(element);
            const name = gameBlock.find('h2').text().trim();
            console.log(`\n[${i}] Block Name (h2): "${name}"`);
            
            const drawings = gameBlock.find('.resultsdrawing');
            console.log(`   - Found ${drawings.length} .resultsdrawing sub-blocks.`);

            drawings.each((j, drawElement) => {
                const drawBlock = $(drawElement);
                const drawName = drawBlock.find('h2').text().trim();
                const timeTag = drawBlock.find('time');
                const date = timeTag.text().trim();
                const datetime = timeTag.attr('datetime');

                const numbers = [];
                drawBlock.find('.resultsnumsrow li').each((_, li) => {
                    numbers.push($(li).text().trim());
                });
                
                console.log(`   - [${j}] Draw Name: "${drawName}", Date: "${date}", DateTime: "${datetime}", Numbers: [${numbers.join(', ')}]`);
            });
        });

        await browser.close();
    } catch (error) {
        console.error(`Error:`, error);
        await browser.close();
    }
}

testAz();
