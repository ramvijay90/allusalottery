import { exec } from 'child_process';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import State from '../models/State';
import connectToDatabase from '../lib/db';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function runScript(scriptName: string, args: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        const cmd = `npx --yes tsx lottery-scraper/${scriptName} ${args.join(' ')}`;
        console.log(`\n🚀 Executing: ${cmd}`);

        exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error running ${scriptName} ${args.join(' ')}:`, error.message);
                // Resolve anyway to continue the loop
                resolve();
                return;
            }
            if (stderr) {
                // console.warn(`⚠️ Stderr: ${stderr}`);
            }
            console.log(`✅ Finished ${args[0]}`);
            resolve();
        });
    });
}

async function runBatch() {
    console.log('🔄 Starting Robust Batch Scraper...');

    try {
        await connectToDatabase();

        // Get all states
        const allStates = await State.find({}).sort({ name: 1 });

        // Handle Sharding
        const args = process.argv.slice(2);
        const shardArg = args.find(a => a.startsWith('--shard=')); // --shard=1/4

        let statesToProcess = allStates;

        if (shardArg) {
            const [current, total] = shardArg.split('=')[1].split('/').map(Number);
            if (current && total && total > 0) {
                const chunkSize = Math.ceil(allStates.length / total);
                const start = (current - 1) * chunkSize;
                const end = start + chunkSize;
                statesToProcess = allStates.slice(start, end);
                console.log(`🍰 Shard mode: ${current}/${total} (Processing ${statesToProcess.length} states)`);
            }
        }

        console.log(`Found ${statesToProcess.length} states to process.`);

        for (const [index, state] of statesToProcess.entries()) {
            console.log(`\n------------------------------------------------`);
            console.log(`[${index + 1}/${statesToProcess.length}] Processing ${state.name} (${state.slug})...`);

            try {
                // Run the individual scraper
                await runScript('state_crawler.ts', [state.slug]);
            } catch (e) {
                console.error(`💥 Critical failure on ${state.name}:`, e);
            }

            // Delay to be nice to the target server
            console.log('⏳ Cooling down (5s)...');
            await new Promise(r => setTimeout(r, 5000));
        }

        console.log('\n✨ Batch Complete: All states processed.');
        process.exit(0);

    } catch (error) {
        console.error("Batch runner failed:", error);
        process.exit(1);
    }
}

runBatch();
