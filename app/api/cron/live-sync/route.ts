import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { syncOfficialPowerball, syncOfficialMegaMillions, syncOfficialMillionaireForLife } from '@/lib/scrapers/officialNationalScraper';
import { scrapeCanadaLotteries } from '@/lib/scrapers/canadaScraper';
import { scrapeAustraliaLotteries } from '@/lib/scrapers/australiaScraper';
import { scrapeEuropeLotteries } from '@/lib/scrapers/europeScraper';
import { scrapeNewZealandLotteries } from '@/lib/scrapers/newZealandScraper';
import { scrapeSouthAfricaLotteries } from '@/lib/scrapers/southAfricaScraper';
import { scrapeNigeriaLotteries } from '@/lib/scrapers/nigeriaScraper';
import { scrapeStateFromLotteryUsa, StateScrapeResult } from '@/lib/scrapers/lotteryUsaScraper';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 45; // Stay safely under Hostinger 50s PHP limit

// All 47 US states & territories in DB rotated cleanly across 4 quarter-hour slots (100% hourly coverage)
const STATE_BATCHES: string[][] = [
    ['az', 'ca', 'fl', 'tx', 'ny', 'ar', 'co', 'ct', 'dc', 'de', 'ga', 'wy'], // Batch 0 (:00)
    ['il', 'nc', 'pa', 'oh', 'ia', 'id', 'in', 'ks', 'ky', 'la', 'ma', 'md'], // Batch 1 (:15)
    ['mi', 'nj', 'va', 'wa', 'tn', 'me', 'mn', 'mo', 'ms', 'mt', 'nd', 'ne'], // Batch 2 (:30)
    ['nh', 'nm', 'ok', 'or', 'pr', 'ri', 'sc', 'sd', 'vt', 'wi', 'wv'],       // Batch 3 (:45)
];

const ALL_US_STATES = STATE_BATCHES.flat();

async function scrapeStatesConcurrently(stateSlugs: string[], concurrency = 4): Promise<StateScrapeResult[]> {
    const results: StateScrapeResult[] = [];
    for (let i = 0; i < stateSlugs.length; i += concurrency) {
        const chunk = stateSlugs.slice(i, i + concurrency);
        const chunkRes = await Promise.all(chunk.map(st => scrapeStateFromLotteryUsa(st)));
        results.push(...chunkRes);
    }
    return results;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');

    const expectedSecret = process.env.CRON_SECRET || 'allusa_cron_secure_2026';
    if (secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
    }

    const startTime = Date.now();
    const specificState = searchParams.get('state'); // ?state=az or ?state=all
    const skipStates = searchParams.get('skip_states') === 'true';

    try {
        await connectToDatabase();

        // 1. Sync Official US National, Canada, Australia, UK & Europe, New Zealand, South Africa, and Nigeria Lotteries concurrently
        const [pbSync, mmSync, mflSync, canadaSync, auSync, europeSync, nzSync, zaSync, ngSync] = await Promise.all([
            syncOfficialPowerball(),
            syncOfficialMegaMillions(),
            syncOfficialMillionaireForLife(),
            scrapeCanadaLotteries(),
            scrapeAustraliaLotteries(),
            scrapeEuropeLotteries(),
            scrapeNewZealandLotteries(),
            scrapeSouthAfricaLotteries(),
            scrapeNigeriaLotteries()
        ]);

        const nationalUpdates = [pbSync, mmSync, mflSync].filter(Boolean);

        // 2. Sync US Local State Games from LotteryCorner + NY Open Data
        let stateResults: StateScrapeResult[] = [];

        if (!skipStates) {
            let targetStates: string[] = [];

            if (specificState) {
                if (specificState === 'all') {
                    targetStates = ALL_US_STATES;
                } else {
                    targetStates = [specificState.toLowerCase().trim()];
                }
            } else {
                const currentMinute = new Date().getMinutes();
                const batchIndex = Math.floor(currentMinute / 15) % STATE_BATCHES.length;
                targetStates = STATE_BATCHES[batchIndex] || STATE_BATCHES[0];
            }

            stateResults = await scrapeStatesConcurrently(targetStates, 6);
        }

        const totalStatesUpdated = stateResults.reduce((acc, r) => acc + (r.updatedCount || 0), 0);

        // Always refresh key global listing routes if any update landed
        if (
            totalStatesUpdated > 0 ||
            canadaSync.updatedCount > 0 ||
            auSync.updatedCount > 0 ||
            europeSync.updatedCount > 0 ||
            nzSync.updatedCount > 0 ||
            zaSync.updatedCount > 0 ||
            ngSync.updatedCount > 0 ||
            nationalUpdates.some(u => u?.updated)
        ) {
            try {
                revalidatePath('/');
                revalidatePath('/live-results');
            } catch (_) {}
        }

        const [totalGames, totalResults] = await Promise.all([
            Game.countDocuments(),
            Result.countDocuments()
        ]);

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
            canadaSync,
            australiaSync: auSync,
            europeSync,
            newZealandSync: nzSync,
            southAfricaSync: zaSync,
            nigeriaSync: ngSync,
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
