import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { syncOfficialPowerball, syncOfficialMegaMillions, syncOfficialCash4Life } from '@/lib/scrapers/officialNationalScraper';
import { scrapeCanadaLotteries } from '@/lib/scrapers/canadaScraper';
import { scrapeAustraliaLotteries } from '@/lib/scrapers/australiaScraper';
import { scrapeEuropeLotteries } from '@/lib/scrapers/europeScraper';
import { scrapeStateFromLotteryUsa } from '@/lib/scrapers/lotteryUsaScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 45; // Max 45s within Hostinger 50s limit

// High-priority state rotation groups
const STATE_BATCHES = [
    ['az', 'ca', 'fl', 'tx', 'ny'], // Batch 0 (:00)
    ['il', 'ga', 'nc', 'pa', 'oh'], // Batch 1 (:15)
    ['mi', 'nj', 'va', 'wa', 'tn'], // Batch 2 (:30)
    ['ma', 'md', 'co', 'mn', 'in'], // Batch 3 (:45)
];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');

    const expectedSecret = process.env.CRON_SECRET || 'allusa_cron_secure_2026';
    if (secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
    }

    const startTime = Date.now();
    const specificState = searchParams.get('state'); // e.g. ?state=az or ?state=all
    const skipStates = searchParams.get('skip_states') === 'true';

    try {
        await connectToDatabase();

        // 1. Sync Official US National, Canada, Australia, and UK & Europe Lotteries
        const [pbSync, mmSync, c4lSync, canadaSync, auSync, europeSync] = await Promise.all([
            syncOfficialPowerball(),
            syncOfficialMegaMillions(),
            syncOfficialCash4Life(),
            scrapeCanadaLotteries(),
            scrapeAustraliaLotteries(),
            scrapeEuropeLotteries()
        ]);

        const nationalUpdates = [pbSync, mmSync, c4lSync].filter(Boolean);

        // 2. Sync Local State Games from LotteryUSA
        const stateResults: any[] = [];

        if (!skipStates) {
            let targetStates: string[] = [];

            if (specificState) {
                if (specificState === 'all') {
                    // Top 10 major states if 'all' requested via web to stay under timeout
                    targetStates = ['az', 'ca', 'fl', 'tx', 'ny', 'il', 'ga', 'pa', 'nc', 'oh'];
                } else {
                    targetStates = [specificState.toLowerCase().trim()];
                }
            } else {
                // Round-Robin Rotation based on current 15-minute slot
                const currentMinute = new Date().getMinutes();
                const batchIndex = Math.floor(currentMinute / 15) % STATE_BATCHES.length;
                targetStates = STATE_BATCHES[batchIndex] || STATE_BATCHES[0];
            }

            // Scrape target states sequentially (safe for connection pooling)
            for (const st of targetStates) {
                const res = await scrapeStateFromLotteryUsa(st);
                stateResults.push(res);
            }
        }

        // 3. Database Summary Stats
        const totalGames = await Game.countDocuments();
        const totalResults = await Result.countDocuments();

        const durationMs = Date.now() - startTime;

        return NextResponse.json({
            status: 'ok',
            message: 'AllUSALottery live sync completed successfully.',
            timestamp: new Date().toISOString(),
            durationMs,
            stats: {
                totalGames,
                totalResults
            },
            nationalSync: nationalUpdates,
            canadaSync: canadaSync,
            australiaSync: auSync,
            europeSync: europeSync,
            stateSync: stateResults
        });

    } catch (error: any) {
        console.error('Cron live sync error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
