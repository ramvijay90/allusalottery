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
        const cmd = `npx tsx lottery-scraper/${scriptName} ${args.join(' ')}`;
        console.log(`\n🚀 Schedular Running: ${cmd}`);

        exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
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

async function runAllStates() {
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
}

async function startScheduler() {
    console.log('🕒 Scheduler Service Started');
    console.log('   - Hub Scraper: 2:00 AM Daily');
    console.log('   - All States:  Every 15 Minutes');

    // 1. Hub Scraper - 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('⏰ Cron Trigger: Hub Scraper');
        await runScript('hub_crawler.ts');
    });

    // 2. All States - Every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('⏰ Cron Trigger: All States Batch');
        await runAllStates();
    });

    // Keep process alive
}

// Handle Command Line Args
const args = process.argv.slice(2);
if (args.includes('--run-now')) {
    runAllStates().then(() => process.exit(0));
} else {
    startScheduler();
}
