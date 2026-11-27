import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import State from '@/models/State';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { CATEGORIES } from '@/lib/lotteryCategories';

export const dynamic = 'force-dynamic';

const NOINDEX_HEADERS = {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Cache-Control': 'no-store'
};

const RETIRED_SLUGS = new Set([
    'cash-4-life',
    'sa-daily-lotto-plus',
    'ng-lotto-6-49',
    'scottish-childrens-lottery',
    'lotto-hotpicks',
    'daily-derby',
    'kicker',
    'mass-cash-midday',
    'play-5-night',
    'loter-a-tradicional',
]);

export type GoogleIndexStatus =
    | 'INDEXABLE_SITEMAP'
    | 'NOINDEX_THIN_EMPTY'
    | 'NOINDEX_ADMIN_SYSTEM'
    | 'ARCHIVAL_ENDED';

export type DbHealthStatus =
    | 'HEALTHY_2026'
    | 'STALE_DRAW'
    | 'PARTIAL_2026'
    | 'EMPTY_NO_RESULTS';

export interface AuditUrlRow {
    id: string;
    url: string;
    pageType: 'Core' | 'Admin/Noindex' | 'State Hub' | 'Game Hub' | 'Past History' | 'Visual Chart' | 'Generator';
    country: string;
    stateSlug?: string;
    stateName?: string;
    gameSlug?: string;
    gameName?: string;
    googleStatus: GoogleIndexStatus;
    dbHealth: DbHealthStatus;
    drawCount2026: number;
    earliest2026?: string;
    latest2026?: string;
    latestDrawDate?: string;
    repairable: boolean;
    reason: string;
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NOINDEX_HEADERS });
    }

    const searchParams = req.nextUrl.searchParams;
    const probePath = searchParams.get('probe');

    // Optional live HTTP + Meta inspection for a single internal route
    if (probePath) {
        if (!probePath.startsWith('/')) {
            return NextResponse.json({ error: 'Probe path must start with /' }, { status: 400, headers: NOINDEX_HEADERS });
        }
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://allusalottery.com';
        const target = new URL(probePath, baseUrl);
        if (target.origin !== new URL(baseUrl).origin) {
            return NextResponse.json({ error: 'Invalid origin' }, { status: 400, headers: NOINDEX_HEADERS });
        }

        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(target.toString(), {
                headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(tid);
            const html = await res.text();
            const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
            const robotsMeta = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1]
                || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i)?.[1]
                || 'index, follow (default)';
            const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || '';
            const schemaCount = (html.match(/type=["']application\/ld\+json["']/gi) || []).length;
            const adUnitsDetected = (html.match(/adsbygoogle/gi) || []).length;
            const xRobots = res.headers.get('x-robots-tag') || '';

            return NextResponse.json({
                url: target.toString(),
                httpStatus: res.status,
                xRobotsTag: xRobots,
                robotsMeta,
                canonical,
                title,
                schemaCount,
                adUnitsDetected,
                googleWillIndex: res.status === 200 && !/noindex/i.test(robotsMeta) && !/noindex/i.test(xRobots)
            }, { headers: NOINDEX_HEADERS });
        } catch (err: any) {
            return NextResponse.json({
                url: target.toString(),
                httpStatus: 0,
                error: err.message
            }, { status: 500, headers: NOINDEX_HEADERS });
        }
    }

    // Full DB + Sitemap + SEO Audit
    try {
        await connectToDatabase();

        const yearStart = new Date('2026-01-01T00:00:00.000Z');
        const staleCutoff = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
        const early2026Cutoff = new Date('2026-04-01T00:00:00.000Z');

        const [states, games, stats] = await Promise.all([
            State.find().sort({ country: 1, name: 1 }).lean(),
            Game.find().sort({ stateSlug: 1, name: 1 }).lean(),
            Result.aggregate([
                { $match: { date: { $gte: yearStart } } },
                {
                    $group: {
                        _id: '$gameId',
                        count: { $sum: 1 },
                        minDate: { $min: '$date' },
                        maxDate: { $max: '$date' }
                    }
                }
            ])
        ]);

        const stateMap = new Map<string, any>();
        states.forEach((s: any) => stateMap.set(s.slug, s));

        const statMap = new Map<string, any>();
        stats.forEach((r: any) => statMap.set(r._id.toString(), r));

        const stateActiveCount = new Map<string, number>();
        for (const g of games as any[]) {
            if (Array.isArray(g.numbers) && g.numbers.length > 0) {
                stateActiveCount.set(g.stateSlug, (stateActiveCount.get(g.stateSlug) || 0) + 1);
            }
        }

        const rows: AuditUrlRow[] = [];

        // 1. Core + Protected Noindex Admin Routes
        rows.push(
            { id: 'core-home', url: '/', pageType: 'Core', country: 'Global', googleStatus: 'INDEXABLE_SITEMAP', dbHealth: 'HEALTHY_2026', drawCount2026: games.length, repairable: false, reason: 'Homepage canonical & schema active' },
            { id: 'core-live', url: '/live-results', pageType: 'Core', country: 'Global', googleStatus: 'INDEXABLE_SITEMAP', dbHealth: 'HEALTHY_2026', drawCount2026: 40, repairable: false, reason: 'Live results hub active' },
            { id: 'core-gen', url: '/lucky-number-generator', pageType: 'Generator', country: 'Global', googleStatus: 'INDEXABLE_SITEMAP', dbHealth: 'HEALTHY_2026', drawCount2026: CATEGORIES.length, repairable: false, reason: 'Generator directory indexed' },
            { id: 'sys-admin', url: '/admin', pageType: 'Admin/Noindex', country: 'System', googleStatus: 'NOINDEX_ADMIN_SYSTEM', dbHealth: 'HEALTHY_2026', drawCount2026: 0, repairable: false, reason: 'Disallowed in robots.txt + meta noindex' },
            { id: 'sys-audit', url: '/admin/audit', pageType: 'Admin/Noindex', country: 'System', googleStatus: 'NOINDEX_ADMIN_SYSTEM', dbHealth: 'HEALTHY_2026', drawCount2026: 0, repairable: false, reason: 'Audit console protected (noindex, nofollow)' },
            { id: 'sys-login', url: '/login', pageType: 'Admin/Noindex', country: 'System', googleStatus: 'NOINDEX_ADMIN_SYSTEM', dbHealth: 'HEALTHY_2026', drawCount2026: 0, repairable: false, reason: 'Login portal explicitly noindexed' },
            { id: 'sys-api', url: '/api/cron/live-sync', pageType: 'Admin/Noindex', country: 'System', googleStatus: 'NOINDEX_ADMIN_SYSTEM', dbHealth: 'HEALTHY_2026', drawCount2026: 0, repairable: false, reason: 'Disallowed in robots.txt (/api/)' }
        );

        // 2. State Hub Pages
        for (const st of states as any[]) {
            const activeGames = stateActiveCount.get(st.slug) || 0;
            rows.push({
                id: `state-${st.slug}`,
                url: `/results/${st.slug}`,
                pageType: 'State Hub',
                country: st.country || 'US',
                stateSlug: st.slug,
                stateName: st.name,
                googleStatus: activeGames > 0 ? 'INDEXABLE_SITEMAP' : 'NOINDEX_THIN_EMPTY',
                dbHealth: activeGames > 0 ? 'HEALTHY_2026' : 'EMPTY_NO_RESULTS',
                drawCount2026: activeGames,
                repairable: activeGames === 0,
                reason: activeGames > 0 ? `${activeGames} active verified games` : 'Zero populated games; auto-gated noindex until scraped'
            });
        }

        // 3. Game Pages (Main + History + Chart)
        for (const g of games as any[]) {
            const st = stateMap.get(g.stateSlug);
            const country = st?.country || 'US';
            const stateName = st?.name || g.stateSlug.toUpperCase();
            const stat = statMap.get(g._id.toString());
            const hasNumbers = Array.isArray(g.numbers) && g.numbers.length > 0;
            const latestDate = g.lastDrawDate ? new Date(g.lastDrawDate) : null;
            const isRetired = RETIRED_SLUGS.has(g.slug);

            let googleStatus: GoogleIndexStatus = 'INDEXABLE_SITEMAP';
            let dbHealth: DbHealthStatus = 'HEALTHY_2026';
            let reason = 'Full verified results in DB & sitemap';
            let repairable = false;

            if (!hasNumbers || !stat || stat.count === 0) {
                googleStatus = hasNumbers ? 'INDEXABLE_SITEMAP' : 'NOINDEX_THIN_EMPTY';
                dbHealth = 'EMPTY_NO_RESULTS';
                reason = hasNumbers ? 'Latest draw present but missing 2026 Result history' : 'Empty numbers; excluded from sitemap & dynamically noindexed';
                repairable = !isRetired;
            } else if (isRetired) {
                googleStatus = 'ARCHIVAL_ENDED';
                dbHealth = 'HEALTHY_2026';
                reason = `Ended/archival game (${stat.count} draws stored)`;
            } else if (!latestDate || latestDate < staleCutoff) {
                dbHealth = 'STALE_DRAW';
                reason = `Latest draw (${latestDate ? latestDate.toISOString().split('T')[0] : 'none'}) > 8 days old`;
                repairable = true;
            } else if (new Date(stat.minDate) > early2026Cutoff) {
                dbHealth = 'PARTIAL_2026';
                reason = `2026 history starts late (${new Date(stat.minDate).toISOString().split('T')[0]})`;
                repairable = true;
            }

            const basePayload = {
                country,
                stateSlug: g.stateSlug,
                stateName,
                gameSlug: g.slug,
                gameName: g.name,
                googleStatus,
                dbHealth,
                drawCount2026: stat?.count || 0,
                earliest2026: stat?.minDate ? new Date(stat.minDate).toISOString().split('T')[0] : undefined,
                latest2026: stat?.maxDate ? new Date(stat.maxDate).toISOString().split('T')[0] : undefined,
                latestDrawDate: latestDate ? latestDate.toISOString().split('T')[0] : undefined,
                repairable,
                reason
            };

            rows.push(
                { id: `g-${g._id}`, url: `/results/${g.stateSlug}/${g.slug}`, pageType: 'Game Hub', ...basePayload },
                { id: `h-${g._id}`, url: `/results/${g.stateSlug}/${g.slug}/history`, pageType: 'Past History', ...basePayload },
                { id: `c-${g._id}`, url: `/results/${g.stateSlug}/${g.slug}/chart`, pageType: 'Visual Chart', ...basePayload }
            );
        }

        // 4. Generator Subpages
        for (const cat of CATEGORIES) {
            rows.push({
                id: `gen-${cat.id}`,
                url: `/lucky-number-generator/${cat.id}`,
                pageType: 'Generator',
                country: cat.country,
                gameSlug: cat.id,
                gameName: cat.name,
                googleStatus: 'INDEXABLE_SITEMAP',
                dbHealth: 'HEALTHY_2026',
                drawCount2026: 1,
                repairable: false,
                reason: 'Static SEO generator page indexed'
            });
        }

        const summary = {
            totalUrls: rows.length,
            indexable: rows.filter(r => r.googleStatus === 'INDEXABLE_SITEMAP').length,
            noindexThin: rows.filter(r => r.googleStatus === 'NOINDEX_THIN_EMPTY').length,
            noindexSystem: rows.filter(r => r.googleStatus === 'NOINDEX_ADMIN_SYSTEM').length,
            archival: rows.filter(r => r.googleStatus === 'ARCHIVAL_ENDED').length,
            staleUrls: rows.filter(r => r.dbHealth === 'STALE_DRAW').length,
            partial2026Urls: rows.filter(r => r.dbHealth === 'PARTIAL_2026').length,
            emptyUrls: rows.filter(r => r.dbHealth === 'EMPTY_NO_RESULTS').length,
            repairableGameHubs: rows.filter(r => r.pageType === 'Game Hub' && r.repairable).length,
            countries: [...new Set(states.map((s: any) => s.country || 'US'))]
        };

        return NextResponse.json({ summary, rows }, { headers: NOINDEX_HEADERS });
    } catch (error: any) {
        console.error('Audit GET error:', error);
        return NextResponse.json({ error: error.message || 'Audit error' }, { status: 500, headers: NOINDEX_HEADERS });
    }
}
