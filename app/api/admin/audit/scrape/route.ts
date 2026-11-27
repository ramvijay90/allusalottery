import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { syncOfficialPowerball, syncOfficialMegaMillions, syncOfficialMillionaireForLife } from '@/lib/scrapers/officialNationalScraper';
import { scrapeCanadaLotteries } from '@/lib/scrapers/canadaScraper';
import { scrapeAustraliaLotteries } from '@/lib/scrapers/australiaScraper';
import { scrapeEuropeLotteries, ALL_EU_STATES } from '@/lib/scrapers/europeScraper';
import { scrapeNewZealandLotteries, ALL_NZ_STATES } from '@/lib/scrapers/newZealandScraper';
import { scrapeSouthAfricaLotteries, ALL_ZA_STATES } from '@/lib/scrapers/southAfricaScraper';
import { scrapeStateFromLotteryUsa } from '@/lib/scrapers/lotteryUsaScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NOINDEX_HEADERS = {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Cache-Control': 'no-store'
};

const AU_STATES = new Set(['au-nsw', 'au-vic', 'au-qld', 'au-wa', 'au-sa', 'au-tas']);
const CA_STATES = new Set(['ac', 'bc', 'on', 'qc', 'wc']);
const EU_STATES = new Set(ALL_EU_STATES);
const NZ_STATES = new Set(ALL_NZ_STATES);
const ZA_STATES = new Set(ALL_ZA_STATES);

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NOINDEX_HEADERS });
    }

    const startTime = Date.now();

    try {
        const body = await req.json();
        const { stateSlug, gameSlug, mode } = body as { stateSlug?: string; gameSlug?: string; mode?: 'single' | 'all_missing' };

        await connectToDatabase();

        if (mode === 'all_missing') {
            const staleCutoff = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
            const missingOrStaleStates = await Game.distinct('stateSlug', {
                slug: {
                    $nin: [
                        'cash-4-life',
                        'sa-daily-lotto-plus',
                        'scottish-childrens-lottery',
                        'lotto-hotpicks',
                        'daily-derby',
                        'kicker',
                        'mass-cash-midday',
                        'play-5-night',
                        'loter-a-tradicional'
                    ]
                },
                $or: [
                    { numbers: { $size: 0 } },
                    { lastDrawDate: { $lt: staleCutoff } },
                    { lastDrawDate: null }
                ]
            });

            const usStates = (missingOrStaleStates as string[]).filter(
                (st) => !AU_STATES.has(st) && !CA_STATES.has(st) && !EU_STATES.has(st) && !NZ_STATES.has(st) && !ZA_STATES.has(st)
            ).slice(0, 12);

            const [pb, mm, mfl, ca, au, eu, nz, za] = await Promise.all([
                syncOfficialPowerball(),
                syncOfficialMegaMillions(),
                syncOfficialMillionaireForLife(),
                scrapeCanadaLotteries(),
                scrapeAustraliaLotteries(),
                scrapeEuropeLotteries(),
                scrapeNewZealandLotteries(),
                scrapeSouthAfricaLotteries()
            ]);

            const usResults = await Promise.all(usStates.map((st) => scrapeStateFromLotteryUsa(st)));
            const totalUpdated =
                [pb, mm, mfl].filter((x) => x?.updated).length +
                (ca.updatedCount || 0) +
                (au.updatedCount || 0) +
                (eu.updatedCount || 0) +
                (nz.updatedCount || 0) +
                (za.updatedCount || 0) +
                usResults.reduce((acc, r) => acc + (r.updatedCount || 0), 0);

            try {
                revalidatePath('/');
                revalidatePath('/live-results');
                revalidatePath('/sitemap.xml');
            } catch (_) {}

            return NextResponse.json({
                status: 'ok',
                mode: 'all_missing',
                totalUpdated,
                usStatesScanned: usStates,
                details: { pb, mm, mfl, ca, au, eu, nz, za, usResults },
                durationMs: Date.now() - startTime
            }, { headers: NOINDEX_HEADERS });
        }

        if (!stateSlug) {
            return NextResponse.json({ error: 'stateSlug required unless mode=all_missing' }, { status: 400, headers: NOINDEX_HEADERS });
        }

        const st = stateSlug.toLowerCase().trim();
        let result: any = null;

        if (NZ_STATES.has(st)) {
            result = await scrapeNewZealandLotteries();
        } else if (ZA_STATES.has(st)) {
            result = await scrapeSouthAfricaLotteries();
        } else if (AU_STATES.has(st)) {
            result = await scrapeAustraliaLotteries();
        } else if (CA_STATES.has(st)) {
            result = await scrapeCanadaLotteries();
        } else if (EU_STATES.has(st)) {
            result = await scrapeEuropeLotteries();
        } else {
            // US State + National draw sync when gameSlug matches national game
            const [stateRes, natRes] = await Promise.all([
                scrapeStateFromLotteryUsa(st),
                gameSlug === 'powerball' || gameSlug === 'powerball-double-play'
                    ? syncOfficialPowerball()
                    : gameSlug === 'mega-millions'
                    ? syncOfficialMegaMillions()
                    : gameSlug === 'millionaire-for-life' || gameSlug === 'cash-4-life'
                    ? syncOfficialMillionaireForLife()
                    : Promise.resolve(null)
            ]);
            result = { stateRes, nationalRes: natRes };
        }

        try {
            revalidatePath(`/results/${st}`);
            if (gameSlug) {
                revalidatePath(`/results/${st}/${gameSlug}`);
                revalidatePath(`/results/${st}/${gameSlug}/history`);
                revalidatePath(`/results/${st}/${gameSlug}/chart`);
            }
            revalidatePath('/live-results');
            revalidatePath('/sitemap.xml');
        } catch (_) {}

        return NextResponse.json({
            status: 'ok',
            stateSlug: st,
            gameSlug: gameSlug || null,
            result,
            durationMs: Date.now() - startTime
        }, { headers: NOINDEX_HEADERS });
    } catch (error: any) {
        console.error('Audit scrape error:', error);
        return NextResponse.json({ error: error.message || 'Scrape failed' }, { status: 500, headers: NOINDEX_HEADERS });
    }
}
