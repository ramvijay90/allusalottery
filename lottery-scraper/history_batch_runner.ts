import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';
import Game from '../models/Game';
import Result from '../models/Result';
import connectToDatabase from '../lib/db';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function runScript(stateSlug: string, gameSlug: string, year: number | null): Promise<void> {
    return new Promise((resolve, reject) => {
        let cmd = `npx tsx lottery-scraper/history_crawler.ts ${stateSlug} ${gameSlug}`;
        if (year) {
            cmd += ` --year=${year}`;
        }

        console.log(`\n🚀 Executing: ${cmd}`);

        exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error running history for ${stateSlug}/${gameSlug}:`, error.message);
                resolve();
                return;
            }
            if (stdout) console.log(stdout);
            // if (stderr) console.warn(`⚠️ Stderr: ${stderr}`);
            console.log(`✅ Finished ${stateSlug}/${gameSlug}`);
            resolve();
        });
    });
}

async function runBatch() {
    console.log('🔄 Starting Global History Batch Scraper...');

    try {
        await connectToDatabase();

        // Check for year arg
        const args = process.argv.slice(2);
        const yearArg = args.find(a => a.startsWith('--year='));
        const targetYear = yearArg ? parseInt(yearArg.split('=')[1]) : null;

        if (targetYear) {
            console.log(`📅 Target Year: ${targetYear}`);
        } else {
            console.log(`📅 No specific year set (Defaulting to recent history)`);
        }

        // Get all games with historyUrl
        const allGames = await Game.find({ historyUrl: { $exists: true, $ne: '' } }).sort({ stateSlug: 1, name: 1 });

        console.log(`Found ${allGames.length} games to scrape.`);

        for (const [index, game] of allGames.entries()) {
            console.log(`\n------------------------------------------------`);
            console.log(`[${index + 1}/${allGames.length}] Processing ${game.name} (${game.stateSlug})...`);

            // Check if we already have data for this year
            if (targetYear) {
                const startDate = new Date(`${targetYear}-01-01`);
                const endDate = new Date(`${targetYear}-12-31`);

                const existingCount = await Result.countDocuments({
                    gameId: game._id,
                    date: { $gte: startDate, $lte: endDate }
                });

                if (existingCount > 5) { // Threshold to assume "done"
                    console.log(`⏭️ Skipping ${game.name} - Already has ${existingCount} results for ${targetYear}.`);
                    continue;
                }
            }

            try {
                await runScript(game.stateSlug, game.slug, targetYear);
            } catch (e) {
                console.error(`💥 Critical failure on ${game.name}:`, e);
            }

            // Delay to be nice to the target server
            // History scraping is heavy (12 requests per game per year), so we should be careful.
            console.log('⏳ Cooling down (2s)...');
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log('\n✨ Global History Batch Complete.');
        process.exit(0);

    } catch (error) {
        console.error("Batch runner failed:", error);
        process.exit(1);
    }
}

runBatch();
