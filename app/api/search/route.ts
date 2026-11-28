import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import State from '@/models/State';
import Result from '@/models/Result';
import { cleanJackpot } from '@/lib/getGameData';
import { buildSchemeSearchRegexes, SCHEME_DIRECTORY } from '@/lib/lotterySchemes';

export const dynamic = 'force-dynamic';

function scoreGameRelevance(name: string, slug: string, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  const n = name.toLowerCase();
  const s = slug.toLowerCase();

  // Exact scheme + immediate companion variant ordering:
  // Searching "powerball" -> Powerball (100), Powerball Double Play (95), other Powerball variants (85)
  if (n === q || s === q) return 100;
  if (n.startsWith(q) && /double\s*play|plus/i.test(n)) return 95;
  if (n.startsWith(q)) return 90;
  if (n.includes(q) && /double\s*play|plus/i.test(n)) return 85;
  if (n.includes(q) || s.includes(q.replace(/\s+/g, '-'))) return 80;
  return 60;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get('q') || '').trim();
  const mode = (searchParams.get('mode') || 'scheme').toLowerCase();
  const numbersParam = (searchParams.get('numbers') || '').trim();
  const pbParam = (searchParams.get('pb') || '').trim();

  if (mode === 'check') {
    const userNums = Array.from(
      new Set(
        numbersParam
          .split(/[\s,;|-]+/)
          .map((s) => s.trim())
          .filter((s) => /^\d+$/.test(s))
          .map((s) => parseInt(s, 10))
      )
    );

    if (userNums.length === 0) {
      return NextResponse.json({ matches: [], checkedGames: 0, error: 'Please enter at least 1 valid ticket number.' }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const gameQuery: any = { numbers: { $exists: true, $not: { $size: 0 } } };
      if (q) {
        const regexes = buildSchemeSearchRegexes(q);
        gameQuery.$or = [
          ...regexes.map((r) => ({ name: r })),
          ...regexes.map((r) => ({ slug: r })),
        ];
      }

      const [matchedGames, states] = await Promise.all([
        Game.find(gameQuery)
          .select('_id name slug stateSlug lastDrawDate numbers powerBall jackpot')
          .sort({ lastDrawDate: -1 })
          .limit(35)
          .lean(),
        State.find().select('slug name country').lean(),
      ]);

      const stateMap = new Map<string, any>(states.map((st: any) => [st.slug, st]));
      const gameIds = matchedGames.map((g: any) => g._id);
      const gameMap = new Map<string, any>(matchedGames.map((g: any) => [String(g._id), g]));

      const recentResults = gameIds.length > 0
        ? await Result.find({ gameId: { $in: gameIds } })
            .select('gameId date numbers powerBall jackpot')
            .sort({ date: -1 })
            .limit(900)
            .lean()
        : [];

      const pbNumeric = /^\d+$/.test(pbParam) ? parseInt(pbParam, 10) : null;
      const hits: any[] = [];

      for (const r of recentResults as any[]) {
        const g = gameMap.get(String(r.gameId));
        if (!g) continue;
        const drawMain = (r.numbers || [])
          .filter((x: any) => /^\d+$/.test(String(x).trim()))
          .map((x: any) => parseInt(String(x).trim(), 10));

        const matchedMain = userNums.filter((n) => drawMain.includes(n));
        const drawPb = r.powerBall && /^\d+$/.test(String(r.powerBall).trim())
          ? parseInt(String(r.powerBall).trim(), 10)
          : null;
        const matchedPb = pbNumeric !== null && drawPb !== null && pbNumeric === drawPb;

        if (matchedMain.length >= 2 || (matchedMain.length >= 1 && matchedPb)) {
          const st = stateMap.get(g.stateSlug);
          hits.push({
            gameName: g.name,
            gameSlug: g.slug,
            stateSlug: g.stateSlug,
            stateName: st?.name || g.stateSlug.toUpperCase(),
            country: st?.country || 'US',
            date: r.date,
            numbers: r.numbers,
            powerBall: r.powerBall || '',
            jackpot: cleanJackpot(r.jackpot || g.jackpot),
            matchedMainCount: matchedMain.length,
            matchedMainNumbers: matchedMain,
            matchedPowerBall: matchedPb,
            score: matchedMain.length * 10 + (matchedPb ? 5 : 0),
          });
        }
      }

      hits.sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime());

      return NextResponse.json({
        query: q || 'All Schemes',
        checkedGames: matchedGames.length,
        checkedDraws: recentResults.length,
        matches: hits.slice(0, 60),
      });
    } catch (err: any) {
      return NextResponse.json({ matches: [], error: err.message || 'Search unavailable' }, { status: 500 });
    }
  }

  // Scheme / Game Live Search Mode
  if (!q) {
    return NextResponse.json({
      query: '',
      schemes: SCHEME_DIRECTORY.map((s) => ({
        schemeKey: s.schemeKey,
        label: s.label,
        summary: s.summary,
        defaultHref: s.defaultHref,
        variantHints: s.variantHints,
      })),
      games: [],
    });
  }

  try {
    await connectToDatabase();
    const regexes = buildSchemeSearchRegexes(q);
    const states = await State.find().select('slug name country').lean();
    const stateMap = new Map<string, any>(states.map((st: any) => [st.slug, st]));

    // Also include states whose name matches user search (e.g. "texas")
    const matchingStateSlugs = states
      .filter((st: any) => regexes.some((rx) => rx.test(st.name) || rx.test(st.slug)))
      .map((st: any) => st.slug);

    const gameQuery: any = {
      numbers: { $exists: true, $not: { $size: 0 } },
      $or: [
        ...regexes.map((r) => ({ name: r })),
        ...regexes.map((r) => ({ slug: r })),
        ...(matchingStateSlugs.length > 0 ? [{ stateSlug: { $in: matchingStateSlugs } }] : []),
      ],
    };

    const rawGames = await Game.find(gameQuery)
      .select('name slug stateSlug lastDrawDate numbers powerBall jackpot')
      .sort({ lastDrawDate: -1 })
      .limit(120)
      .lean();

    const formatted = (rawGames as any[])
      .map((g) => {
        const st = stateMap.get(g.stateSlug);
        const relevance = scoreGameRelevance(g.name, g.slug, q);
        return {
          name: g.name,
          slug: g.slug,
          stateSlug: g.stateSlug,
          stateName: st?.name || g.stateSlug.toUpperCase(),
          country: st?.country || 'US',
          numbers: g.numbers || [],
          powerBall: g.powerBall || '',
          jackpot: cleanJackpot(g.jackpot),
          lastDrawDate: g.lastDrawDate,
          isCompanionVariant: /double\s*play|plus(\s*[12])?$|extra$/i.test(g.name),
          relevance,
        };
      })
      .sort((a, b) => {
        if (b.relevance !== a.relevance) return b.relevance - a.relevance;
        const da = a.lastDrawDate ? new Date(a.lastDrawDate).getTime() : 0;
        const db = b.lastDrawDate ? new Date(b.lastDrawDate).getTime() : 0;
        return db - da;
      });

    // Deduplicate to show distinct schemes prominently first (e.g. Powerball AND Powerball Double Play!)
    const seenSchemeKeys = new Set<string>();
    const spotlightSchemes: any[] = [];
    for (const item of formatted) {
      const key = item.name.toLowerCase().trim();
      if (!seenSchemeKeys.has(key)) {
        seenSchemeKeys.add(key);
        spotlightSchemes.push(item);
      }
      if (spotlightSchemes.length >= 12) break;
    }

    const matchingGuides = SCHEME_DIRECTORY.filter((s) =>
      s.keywords.some((k) => q.toLowerCase().includes(k) || k.includes(q.toLowerCase())) || s.matchRegex.test(q)
    ).map((s) => ({
      schemeKey: s.schemeKey,
      label: s.label,
      summary: s.summary,
      defaultHref: s.defaultHref,
      variantHints: s.variantHints,
    }));

    return NextResponse.json({
      query: q,
      spotlightSchemes,
      schemes: matchingGuides,
      games: formatted.slice(0, 48),
    });
  } catch (err: any) {
    return NextResponse.json({
      query: q,
      spotlightSchemes: [],
      schemes: SCHEME_DIRECTORY.filter((s) =>
        s.keywords.some((k) => q.toLowerCase().includes(k) || k.includes(q.toLowerCase()))
      ),
      games: [],
      error: err.message,
    });
  }
}
