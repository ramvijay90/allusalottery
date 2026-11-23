import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Max 30s timeout

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');

    const expectedSecret = process.env.CRON_SECRET || 'allusa_cron_secure_2026';
    if (secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
    }

    const startTime = Date.now();

    try {
        await connectToDatabase();

        // 1. Fetch current active master games count
        const totalGames = await Game.countDocuments();
        const totalResults = await Result.countDocuments();

        // 2. Fetch top national games last draw dates
        const topGames = await Game.find({
            slug: { $in: ['powerball', 'mega-millions', 'lotto-america', 'lotto-max', 'canada-lotto-6-49'] }
        }).select('name slug lastDrawDate jackpot numbers').lean();

        const durationMs = Date.now() - startTime;

        return NextResponse.json({
            status: 'ok',
            message: 'AllUSALottery cron heartbeat received successfully.',
            timestamp: new Date().toISOString(),
            durationMs,
            stats: {
                totalGames,
                totalResults,
                topGames: topGames.map(g => ({
                    name: g.name,
                    slug: g.slug,
                    lastDrawDate: g.lastDrawDate,
                    jackpot: g.jackpot,
                    hasNumbers: !!(g.numbers && g.numbers.length > 0)
                }))
            }
        });
    } catch (error: any) {
        console.error('Cron sync error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
