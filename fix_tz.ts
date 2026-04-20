import connectToDatabase from './lib/db';
import Game from './models/Game';
import Result from './models/Result';

connectToDatabase().then(async () => {
    // 1. Fix Games Collection
    const games = await Game.find({});
    let gCount = 0;
    for (const g of games) {
        if (g.lastDrawDate instanceof Date) {
            // Get YYYY-MM-DD from the local time of the datestring
            // Since the bug is that 2026-04-11T03:00Z should have been 2026-04-10
            // The cleanest way is to use getFullYear, getMonth, getDate which resolves to the local Day context in which it was parsed.
            // Actually, if Node parsed it as '2026-04-10T19:00-08:00', the string representation of that date object might be UTC.
            // Let's just forcibly extract the string to 'YYYY-MM-DDT12:00:00Z' using a localized formatter if needed.
            
            // To be purely mathematical: the target was "America/New_York".
            const localStr = g.lastDrawDate.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
            // localStr is YYYY-MM-DD (en-CA is strictly ISO formatting for dates)
            if (localStr) {
                const newDate = new Date(`${localStr}T12:00:00Z`);
                // Only save if it's actually different
                if (g.lastDrawDate.getTime() !== newDate.getTime()) {
                    g.lastDrawDate = newDate;
                    await g.save();
                    gCount++;
                }
            }
        }
    }
    console.log(`Fixed ${gCount} Games.`);

    // 2. Fix Results Collection
    const results = await Result.find({});
    let rCount = 0;
    for (const r of results) {
        if (r.date instanceof Date) {
            const localStr = r.date.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
            if (localStr) {
                const newDate = new Date(`${localStr}T12:00:00Z`);
                if (r.date.getTime() !== newDate.getTime()) {
                    r.date = newDate;
                    await r.save();
                    rCount++;
                }
            }
        }
    }
    console.log(`Fixed ${rCount} Results.`);
    
    process.exit();
});
