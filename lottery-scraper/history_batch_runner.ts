import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';
import Game from '../models/Game';
import Result from '../models/Result';
import connectToDatabase from '../lib/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

function runGameYear(stateSlug: string, gameSlug: string, year: number): Promise<void> {
    return new Promise((resolve) => {
        const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        const cmd = `${npxCmd} tsx lottery-scraper/history_crawler.ts ${stateSlug} ${gameSlug} --year=${year}`;
        console.log(`\n🚀 Executing: ${cmd}`);

        exec(cmd, { cwd: process.cwd(), timeout: 180000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error running history for ${stateSlug}/${gameSlug} (${year}):`, error.message);
                resolve();
                return;
            }
            if (stdout) console.log(stdout);
            console.log(`✅ Finished ${stateSlug}/${gameSlug} for Year ${year}`);
            resolve();
        });
    });
}

async function runBatch() {
    console.log('🔄 ========================================================');
    console.log('🔄 Global Historical Data Importer (2005 - 2026 Archive)');
    console.log('🔄 ========================================================');

    try {
        await connectToDatabase();

        const args = process.argv.slice(2);
        
        // Flags
        const yearArg = args.find(a => a.startsWith('--year='));
        const fromArg = args.find(a => a.startsWith('--from='));
        const toArg = args.find(a => a.startsWith('--to='));
        const stateArg = args.find(a => a.startsWith('--state='));
        const gameArg = args.find(a => a.startsWith('--game='));
        const topOnly = args.includes('--topOnly') || args.includes('--national');
        const localOnly = args.includes('--localOnly');

        const stateFilter = stateArg ? stateArg.split('=')[1].toLowerCase() : null;
        const gameFilter = gameArg ? gameArg.split('=')[1].toLowerCase() : null;

        // Determine list of years to process (Descending)
        let targetYears: number[] = [];
        if (yearArg) {
            targetYears = [parseInt(yearArg.split('=')[1])];
        } else if (fromArg && toArg) {
            const from = parseInt(fromArg.split('=')[1]);
            const to = parseInt(toArg.split('=')[1]);
            for (let y = to; y >= from; y--) {
                targetYears.push(y);
            }
        } else {
            // Default target: Start with 2025 deep archive
            targetYears = [2025];
        }

        console.log(`📅 Target Years: ${targetYears.join(', ')}`);
        if (stateFilter) console.log(`📍 State Filter: ${stateFilter}`);
        if (gameFilter) console.log(`🎮 Game Filter: ${gameFilter}`);
        if (topOnly) console.log(`🏆 Top Games Filter: ON (National & Multi-State games only)`);
        if (localOnly) console.log(`📍 Local Games Filter: ON (Excluding National games)`);

        // Build query
        const query: any = { historyUrl: { $exists: true, $ne: '' } };
        if (stateFilter) query.stateSlug = stateFilter;
        if (gameFilter) query.slug = gameFilter;

        let allGames = await Game.find(query).sort({ stateSlug: 1, name: 1 });

        const nationalSlugs = ['powerball', 'mega-millions', 'lotto-max', 'canada-lotto-6-49', 'cash-4-life', 'lucky-for-life', 'lotto-america'];
        const isNational = (g: any) => 
            nationalSlugs.includes(g.slug?.toLowerCase()) || 
            /powerball|mega millions|lotto max|lotto 6[\/-]?49|lotto america/i.test(g.name);

        if (topOnly) {
            allGames = allGames.filter(isNational);
        } else if (localOnly) {
            allGames = allGames.filter(g => !isNational(g));
        }

        console.log(`📊 Found ${allGames.length} matching games in database.\n`);

        if (allGames.length === 0) {
            console.log('No games found matching criteria.');
            process.exit(0);
        }

        for (const year of targetYears) {
            console.log(`\n========================================================`);
            console.log(`📁 PROCESSING ARCHIVE YEAR: ${year}`);
            console.log(`========================================================`);

            for (const [index, game] of allGames.entries()) {
                console.log(`\n------------------------------------------------`);
                console.log(`[${index + 1}/${allGames.length}] ${game.name} (${game.stateSlug.toUpperCase()}) - Year: ${year}`);

                // Check how many draws exist for this year in database
                const startDate = new Date(`${year}-01-01T00:00:00Z`);
                const endDate = new Date(`${year}-12-31T23:59:59Z`);

                const existingCount = await Result.countDocuments({
                    gameId: game._id,
                    date: { $gte: startDate, $lte: endDate }
                });

                // If already has drawings for this year, skip automatically to prevent unnecessary scraping
                if (existingCount >= 30) {
                    console.log(`⏭️ Skipping ${game.name} - Already has ${existingCount} draws in database for ${year}.`);
                    continue;
                }

                try {
                    await runGameYear(game.stateSlug, game.slug, year);
                } catch (e: any) {
                    console.error(`💥 Failed scraping ${game.name} for ${year}:`, e.message);
                }

                // Respectful pause between games
                console.log('⏳ Cooldown (2s)...');
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        console.log('\n✨ Global History Batch Scraping Finished Successfully!');
        process.exit(0);

    } catch (error) {
        console.error("Batch runner failed:", error);
        process.exit(1);
    }
}

runBatch();
