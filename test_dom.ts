import * as cheerio from 'cheerio';
async function test() {
    const res = await fetch('https://www.lotterypost.com/results/az', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
    });
    if (!res.ok) {
        console.log('Fetch failed', res.status);
        return;
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    $('.resultsgame').each((_, el) => {
        const name = $(el).find('h2').text().trim();
        if (name === 'Fantasy 5') {
            const times: string[] = [];
            $(el).find('time').each((i, t) => {
                const dt = $(t).attr('datetime');
                if (dt) times.push(dt);
            });
            console.log('Fantasy 5 Times:', times);
        }
    });
}
test();
