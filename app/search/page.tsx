import type { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import State from '@/models/State';
import { cleanJackpot } from '@/lib/getGameData';
import { buildSchemeSearchRegexes, SCHEME_DIRECTORY } from '@/lib/lotterySchemes';
import SearchHubClient from '@/components/SearchHubClient';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import SidebarAd from '@/components/ads/SidebarAd';
import MultiplexAd from '@/components/ads/MultiplexAd';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }): Promise<Metadata> {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const title = q
    ? `${q} Lottery Search Results & Winning Numbers (2026)`
    : 'Lottery Search Engine & Check Winning Numbers Archive (2026)';
  const description = q
    ? `Search all ${q} schemes, companion Double Play / Plus draws, past winning numbers, prize payouts & 2026 charts across USA, Canada, Australia, UK, Europe, NZ & Africa.`
    : 'Search any lottery scheme (Powerball & Powerball Double Play, Mega Millions, Lotto Max, Pick 3/4, EuroMillions) or check your ticket numbers across 2026 draw history.';

  return {
    title,
    description,
    alternates: { canonical: 'https://allusalottery.com/search' },
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
    keywords: [
      'lottery search engine',
      'check my lottery numbers',
      'powerball double play results search',
      'past winning numbers search',
      'search lottery results by number',
      'powerball results tonight',
      'mega millions number checker',
    ],
    openGraph: {
      title,
      description,
      url: 'https://allusalottery.com/search',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Lottery Scheme Search & Winning Number Checker' }],
      type: 'website',
      siteName: 'All USA Lottery',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const initialTab: 'scheme' | 'check' = sp.tab === 'check' ? 'check' : 'scheme';

  let initialSpotlight: any[] = [];
  let initialGames: any[] = [];

  if (q) {
    try {
      await connectToDatabase();
      const regexes = buildSchemeSearchRegexes(q);
      const states = await State.find().select('slug name country').lean();
      const stateMap = new Map<string, any>(states.map((st: any) => [st.slug, st]));
      const matchingStateSlugs = states
        .filter((st: any) => regexes.some((rx) => rx.test(st.name) || rx.test(st.slug)))
        .map((st: any) => st.slug);

      const rawGames = await Game.find({
        numbers: { $exists: true, $not: { $size: 0 } },
        $or: [
          ...regexes.map((r) => ({ name: r })),
          ...regexes.map((r) => ({ slug: r })),
          ...(matchingStateSlugs.length > 0 ? [{ stateSlug: { $in: matchingStateSlugs } }] : []),
        ],
      })
        .select('name slug stateSlug lastDrawDate numbers powerBall jackpot')
        .sort({ lastDrawDate: -1 })
        .limit(80)
        .lean();

      const ql = q.toLowerCase();
      initialGames = (rawGames as any[])
        .map((g) => {
          const st = stateMap.get(g.stateSlug);
          const n = g.name.toLowerCase();
          const relevance =
            n === ql ? 100 : n.startsWith(ql) && /double\s*play|plus/i.test(n) ? 95 : n.startsWith(ql) ? 90 : n.includes(ql) ? 80 : 60;
          return {
            name: g.name,
            slug: g.slug,
            stateSlug: g.stateSlug,
            stateName: st?.name || g.stateSlug.toUpperCase(),
            country: st?.country || 'US',
            numbers: g.numbers || [],
            powerBall: g.powerBall || '',
            jackpot: cleanJackpot(g.jackpot),
            lastDrawDate: g.lastDrawDate ? new Date(g.lastDrawDate).toISOString() : undefined,
            isCompanionVariant: /double\s*play|plus(\s*[12])?$|extra$/i.test(g.name),
            relevance,
          };
        })
        .sort((a, b) => b.relevance - a.relevance);

      const seen = new Set<string>();
      for (const item of initialGames) {
        const key = item.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          initialSpotlight.push(item);
        }
        if (initialSpotlight.length >= 12) break;
      }
    } catch {
      initialGames = [];
      initialSpotlight = [];
    }
  }

  const initialSchemes = (q
    ? SCHEME_DIRECTORY.filter(
        (s) => s.keywords.some((k) => q.toLowerCase().includes(k) || k.includes(q.toLowerCase())) || s.matchRegex.test(q)
      )
    : SCHEME_DIRECTORY
  ).map((s) => ({
    schemeKey: s.schemeKey,
    label: s.label,
    summary: s.summary,
    defaultHref: s.defaultHref,
    variantHints: s.variantHints,
  }));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://allusalottery.com' },
      { '@type': 'ListItem', position: 2, name: 'Lottery Search & Number Checker', item: 'https://allusalottery.com/search' },
    ],
  };

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="bg-[#0f172a] text-white py-12 px-4 text-center border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#f59e0b] text-xs font-black uppercase tracking-widest">
            Unified Lottery Results &amp; Ticket Checker
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Lottery Search &amp; <span className="text-[#f59e0b]">Scheme Explorer</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Search any scheme (like <strong>Powerball</strong> &amp; <strong>Powerball Double Play</strong>) or check your ticket numbers across verified past drawings.
          </p>
        </div>
      </section>

      <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-6 xl:gap-8 px-4 sm:px-6 xl:px-8 py-8 w-full max-w-[1760px] mx-auto">
        <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
            <SidebarAd />
          </div>
        </aside>

        <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto space-y-8">
          <BeforeContentAd />
          <SearchHubClient
            initialQuery={q}
            initialTab={initialTab}
            initialSpotlight={initialSpotlight}
            initialGames={initialGames.slice(0, 48)}
            initialSchemes={initialSchemes}
          />
          <MultiplexAd />
        </main>

        <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
            <SidebarAd />
          </div>
        </aside>
      </div>
    </div>
  );
}
