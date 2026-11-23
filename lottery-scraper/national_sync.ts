import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';
import Game from '../models/Game';
import Result from '../models/Result';
import connectToDatabase from '../lib/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

interface NationalMaster {
    key: string;
    name: string;
    stateSlug: string;
    slug: string;
    matchRegex: RegExp;
}

const NATIONAL_MASTERS: NationalMaster[] = [
    {
        key: 'powerball',
        name: 'Powerball',
        stateSlug: 'az',
        slug: 'powerball',
        matchRegex: /powerball/i
    },
    {
        key: 'mega-millions',
        name: 'Mega Millions',
        stateSlug: 'az',
        slug: 'mega-millions',
        matchRegex: /mega millions/i
    },
    {
        key: 'lotto-america',
        name: 'Lotto America',
        stateSlug: 'de',
        slug: 'lotto-america',
        matchRegex: /lotto america/i
    },
    {
        key: 'lotto-max',
        name: 'Canada Lotto Max',
        stateSlug: 'ac',
        slug: 'lotto-max',
        matchRegex: /lotto max/i
    },
    {
        key: 'canada-lotto-6-49',
        name: 'Canada Lotto 6/49',
        stateSlug: 'ac',
        slug: 'canada-lotto-6-49',
        matchRegex: /lotto 6[\/-]?49/i
    }
];

function runCrawler(stateSlug: string, gameSlug: string, year: number): Promise<void> {
    return new Promise((resolve) => {
        // Use npx.cmd on Windows, npx on Linux/macOS
        const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        const cmd = `${npxCmd} tsx lottery-scraper/history_crawler.ts ${stateSlug} ${gameSlug} --year=${year}`;
        console.log(`\n🚀 Crawling Master Source: ${cmd}`);

        exec(cmd, { cwd: process.cwd(), timeout: 240000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Crawler warning for ${stateSlug}/${gameSlug}:`, error.message);
            }
            if (stdout) console.log(stdout);
            resolve();
        });
    });
}

async function runNationalSync() {
    console.log('⚡ ========================================================');
    console.log('⚡ High-Speed National Lottery Sync Engine (2005 - 2026)');
    console.log('⚡ ========================================================');

    await connectToDatabase();

    const args = process.argv.slice(2);
    const fromArg = args.find(a => a.startsWith('--from='));
    const toArg = args.find(a => a.startsWith('--to='));
    const yearArg = args.find(a => a.startsWith('--year='));
    const forceCrawl = args.includes('--force');

    let targetYears: number[] = [];
    if (fromArg && toArg) {
        const from = parseInt(fromArg.split('=')[1]);
        const to = parseInt(toArg.split('=')[1]);
        for (let y = to; y >= from; y--) {
            targetYears.push(y);
        }
    } else if (yearArg) {
        targetYears = [parseInt(yearArg.split('=')[1])];
    } else {
        targetYears = [2026];
    }

    console.log(`📅 Target Years: ${targetYears.join(', ')}`);
    console.log(`🎯 Master Games: ${NATIONAL_MASTERS.map(m => m.name).join(', ')}\n`);

    for (const targetYear of targetYears) {
        console.log(`\n============================================================`);
        console.log(`⚡ SYNCING NATIONAL ARCHIVE FOR YEAR: ${targetYear}`);
        console.log(`============================================================`);

        const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
        const endDate = new Date(`${targetYear}-12-31T23:59:59Z`);

        let totalSyncedGames = 0;
        let totalSyncedDraws = 0;

        for (const master of NATIONAL_MASTERS) {
            console.log(`\n------------------------------------------------------------`);
            console.log(`🏆 Processing Master: ${master.name} (${master.stateSlug.toUpperCase()}) - ${targetYear}`);
            console.log(`------------------------------------------------------------`);

            const masterGame = await Game.findOne({ stateSlug: master.stateSlug, slug: master.slug });

            if (!masterGame) {
                console.error(`❌ Master game not found in database: ${master.stateSlug}/${master.slug}`);
                continue;
            }

            // Check if master already has data for this year
            const existingCount = await Result.countDocuments({
                gameId: masterGame._id,
                date: { $gte: startDate, $lte: endDate }
            });

            const latestDrawInDb = await Result.findOne({
                gameId: masterGame._id,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: -1 });

            const daysSinceLastDraw = latestDrawInDb 
                ? (Date.now() - new Date(latestDrawInDb.date).getTime()) / (1000 * 60 * 60 * 24) 
                : 999;
            
            // Needs crawling if we don't have enough draws or forced
            const isCurrentYear = targetYear === new Date().getFullYear();
            const minExpectedDraws = isCurrentYear ? 50 : 90;
            const needsCrawl = existingCount < minExpectedDraws || (isCurrentYear && daysSinceLastDraw >= 0.8) || forceCrawl;

            console.log(`📊 Current master draws in DB for ${targetYear}: ${existingCount} (Latest: ${latestDrawInDb ? latestDrawInDb.date.toISOString().split('T')[0] : 'None'})`);

            if (needsCrawl) {
                console.log(`⏳ Crawling complete ${targetYear} history for ${master.name}...`);
                await runCrawler(master.stateSlug, master.slug, targetYear);
            } else {
                console.log(`✅ Master already has complete data (${existingCount} draws). Skipping web crawl.`);
            }

            // Fetch all draws for the master game for this year
            const masterDraws = await Result.find({
                gameId: masterGame._id,
                date: { $gte: startDate, $lte: endDate }
            }).lean();

            if (masterDraws.length === 0) {
                console.log(`⚠️ No draws found for master ${master.name} in ${targetYear}. Skipping sync.`);
                continue;
            }

            // Identify latest draw for Game model updates
            const sortedDraws = [...masterDraws].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const latestDraw = sortedDraws[0];

            if (latestDraw && isCurrentYear) {
                await Game.findByIdAndUpdate(masterGame._id, {
                    lastDrawDate: latestDraw.date,
                    numbers: latestDraw.numbers,
                    powerBall: latestDraw.powerBall,
                    ...(latestDraw.jackpot ? { jackpot: latestDraw.jackpot } : {})
                });
                console.log(`🔄 Updated master ${master.name} latest draw: ${latestDraw.date.toISOString().split('T')[0]} -> ${latestDraw.numbers.join('-')} [${latestDraw.powerBall}]`);
            }

            console.log(`📦 Found ${masterDraws.length} verified draws for ${master.name}. Propagating to all states...`);

            // Find all sibling games across other states matching this game
            const siblingGames = await Game.find({
                _id: { $ne: masterGame._id },
                name: master.matchRegex
            });

            console.log(`📍 Found ${siblingGames.length} sibling state instances to synchronize.`);

            const syncStart = Date.now();
            let syncedCount = 0;

            for (const sibling of siblingGames) {
                const bulkOps = masterDraws.map((d: any) => ({
                    updateOne: {
                        filter: { gameId: sibling._id, date: d.date },
                        update: {
                            $set: {
                                gameId: sibling._id,
                                date: d.date,
                                numbers: d.numbers,
                                powerBall: d.powerBall,
                                jackpot: d.jackpot
                            }
                        },
                        upsert: true
                    }
                }));

                if (bulkOps.length > 0) {
                    try {
                        await Result.bulkWrite(bulkOps, { ordered: false });
                        
                        // Also update Game document for homepage cards & headers
                        if (latestDraw && isCurrentYear) {
                            await Game.findByIdAndUpdate(sibling._id, {
                                lastDrawDate: latestDraw.date,
                                numbers: latestDraw.numbers,
                                powerBall: latestDraw.powerBall,
                                ...(latestDraw.jackpot ? { jackpot: latestDraw.jackpot } : {})
                            });
                        }
                        syncedCount++;
                    } catch (err: any) {
                        console.error(`⚠️ Error syncing ${sibling.stateSlug}/${sibling.slug}:`, err.message);
                    }
                }
            }

            const elapsed = ((Date.now() - syncStart) / 1000).toFixed(2);
            console.log(`✨ Successfully synchronized ${masterDraws.length} draws to ${syncedCount} state games in ${elapsed}s!`);

            totalSyncedGames += syncedCount;
            totalSyncedDraws += masterDraws.length * syncedCount;
        }

        console.log(`\n============================================================`);
        console.log(`🎉 NATIONAL SYNC COMPLETE FOR YEAR ${targetYear}!`);
        console.log(`📊 Total State Games Updated: ${totalSyncedGames}`);
        console.log(`💾 Total Draws Propagated: ~${totalSyncedDraws}`);
        console.log(`============================================================\n`);
    }

    process.exit(0);
}

runNationalSync().catch((err) => {
    console.error('Fatal national sync error:', err);
    process.exit(1);
});
