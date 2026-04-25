import cron from 'node-cron';
import { exec } from 'child_process';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import State from '../models/State';
import connectToDatabase from '../lib/db';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Helper to run a script
function runScript(scriptName: string, args: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        const cmd = `npx --yes tsx lottery-scraper/${scriptName} ${args.join(' ')}`;
        console.log(`\n🚀 Schedular Running: ${cmd}`);

        exec(cmd, { cwd: process.cwd(), timeout: 120000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error running ${scriptName}:`, error);
                // Don't reject, just log, so other tasks continue
                resolve();
                return;
            }
            console.log(`✅ Finished ${scriptName}`);
            // Optional: log stdout if needed, but it might be verbose
            resolve();
        });
    });
}

let isBatchRunning = false;

async function runAllStates() {
    if (isBatchRunning) {
        console.log('⚠️ Skip: Previous batch is still running.');
        return;
    }
    isBatchRunning = true;
    
    try {
        console.log('🔄 Starting Batch: Run All States...');
        await connectToDatabase();

        // Get all states
        const states = await State.find({}).sort({ name: 1 });
        console.log(`Found ${states.length} states to update.`);

        // Run sequentially to avoid overwhelming cpu/network/db
        for (const state of states) {
            console.log(`\nProcessing ${state.name} (${state.slug})...`);
            await runScript('state_crawler.ts', [state.slug]);

            // Small delay between states
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log('\n✨ Batch Complete: All states updated.');
    } finally {
        isBatchRunning = false;
    }
}

async function startScheduler() {
    console.log('🕒 Scheduler Service Started - Aggressive Mode');
    console.log('   - Hub Scraper: 2:00 AM Daily');
    console.log('   - History Backfill: 3:00 AM Daily');
    console.log('   - Live Results (States): Every 10 Minutes');

    // 1. Hub Scraper - 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('⏰ Cron Trigger: Hub Scraper');
        await runScript('hub_crawler.ts');
    });

    // 2. Deep History Backfill - 3:00 AM Daily
    cron.schedule('0 3 * * *', async () => {
        console.log('⏰ Cron Trigger: Deep History Scraping Block');
        await runScript('history_batch_runner.ts');
    });

    // 3. All States Live Results - Every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('⏰ Cron Trigger: Live Results Batch');
        await runAllStates();
    });

    // 4. INSTANT INITIALIZATION 
    // Always trigger immediately upon server boot so database isn't empty!
    console.log('⚡ Triggering instant initial population (Bypassing cron timer)...');
    runScript('hub_crawler.ts').then(() => {
        runAllStates();
    });
}

// Handle Command Line Args
const args = process.argv.slice(2);
if (args.includes('--run-now')) {
    runAllStates().then(() => process.exit(0));
} else if (args.includes('--run-history')) {
    console.log('⚡ Forced Manual Execution: Deep History');
    runScript('history_batch_runner.ts').then(() => process.exit(0));
} else {
    startScheduler();
}
