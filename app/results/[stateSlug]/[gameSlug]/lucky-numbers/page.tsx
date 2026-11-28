import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Wand2, BarChart3, Clock } from 'lucide-react';
import { getGameData, resolveAliases } from '@/lib/getGameData';
import { getCountryKeywordBundle } from '@/lib/seoKeywords';
import { buildGameGeneratorPreset } from '@/lib/gameGeneratorPreset';
import LuckyGeneratorWrapper from '@/components/LuckyGeneratorWrapper';
import GameSubNav from '@/components/GameSubNav';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import AfterContentAd from '@/components/ads/AfterContentAd';
import SidebarAd from '@/components/ads/SidebarAd';

export const dynamic = 'auto';
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string; gameSlug: string }> }) {
  const { stateSlug, gameSlug } = await params;
  const { resolvedState, resolvedGame } = resolveAliases(stateSlug, gameSlug);

  const data = await getGameData(resolvedState, resolvedGame);
  if (!data) return { title: 'Lucky Number Generator Not Found' };

  const currentYear = new Date().getFullYear();
  const bundle = getCountryKeywordBundle(data.state.country, resolvedState, data.state.name);
  const preset = buildGameGeneratorPreset({
    stateName: data.state.name,
    stateSlug: resolvedState,
    country: data.state.country,
    gameName: data.game.name,
    gameSlug: resolvedGame,
    history: data.history || [],
  });

  const ballsDesc = preset.category.mainRange
    ? `${preset.category.mainBalls} balls (${preset.category.mainRange[0]}-${preset.category.mainRange[1]})`
    : 'custom rules';
  const specialDesc = preset.category.specialBalls && preset.category.specialRange
    ? ` + ${preset.category.specialBalls} ${preset.category.specialName || 'Bonus'} (${preset.category.specialRange[0]}-${preset.category.specialRange[1]})`
    : '';

  const title = `${data.state.name} ${data.game.name} Lucky Numbers & Generator ${currentYear}`;
  const description = `Generate ${data.state.name} ${data.game.name} lucky numbers & random quick picks (${bundle.operatorShort}): ${ballsDesc}${specialDesc}. Mix hot numbers, numerology, horoscope & scrambler modes.`;
  const canonicalUrl = `https://allusalottery.com/results/${resolvedState}/${resolvedGame}/lucky-numbers`;
  const ogImageUrl = `https://allusalottery.com/results/${resolvedState}/${resolvedGame}/opengraph-image`;
  const hasNumbers = Array.isArray(data.game.numbers) && data.game.numbers.length > 0;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: hasNumbers
      ? { index: true, follow: true }
      : { index: false, follow: true },
    keywords: [
      `${data.game.name} lucky number generator`,
      `${data.game.name} lucky numbers`,
      `${data.game.name} number generator`,
      `${data.game.name} number picker`,
      `pick my ${data.game.name} lottery numbers`,
      `${data.state.name} ${data.game.name} quick pick`,
      'lucky number generator',
      'lottery number generator',
      'lotto number generator',
      'lottery number picker',
      'lucky lottery numbers',
      ...bundle.countryTerms,
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${data.state.name} ${data.game.name} Lucky Number Generator` }],
      type: 'website',
      siteName: 'All USA Lottery',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function GameLuckyNumbersPage({ params }: { params: Promise<{ stateSlug: string; gameSlug: string }> }) {
  const { stateSlug, gameSlug } = await params;
  const { resolvedState, resolvedGame } = resolveAliases(stateSlug, gameSlug);

  if (resolvedState !== stateSlug || resolvedGame !== gameSlug) {
    redirect(`/results/${resolvedState}/${resolvedGame}/lucky-numbers`);
  }

  const data = await getGameData(resolvedState, resolvedGame);
  if (!data) notFound();

  const { state, game, history } = data;
  const bundle = getCountryKeywordBundle(state.country, state.slug, state.name);
  const currentYear = new Date().getFullYear();
  const preset = buildGameGeneratorPreset({
    stateName: state.name,
    stateSlug: state.slug,
    country: state.country,
    gameName: game.name,
    gameSlug: game.slug,
    history: history || [],
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://allusalottery.com' },
      { '@type': 'ListItem', position: 2, name: `${state.name} Lottery`, item: `https://allusalottery.com/results/${state.slug}` },
      { '@type': 'ListItem', position: 3, name: game.name, item: `https://allusalottery.com/results/${state.slug}/${game.slug}` },
      { '@type': 'ListItem', position: 4, name: 'Lucky Numbers', item: `https://allusalottery.com/results/${state.slug}/${game.slug}/lucky-numbers` },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${state.name} ${game.name} Lucky Number Generator`,
    operatingSystem: 'All',
    applicationCategory: 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How does the ${state.name} ${game.name} Lucky Number Generator work?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `It generates unbiased combinations configured for ${state.name} ${game.name} (${preset.category.mainBalls} main numbers from ${preset.category.mainRange?.[0]} to ${preset.category.mainRange?.[1]}), with options to mix hot or overdue digits from recent draws.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I mix my own favorite numbers with ${game.name} quick picks?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Enter any lucky numbers in the Include field or click Mix Hot / Mix Overdue numbers, and switch between Quick Pick, Truly Lucky Touch, Numerology, Horoscope, and Scrambler modes.`,
        },
      },
    ],
  };

  return (
    <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-6 xl:gap-8 px-4 sm:px-6 xl:px-8 py-12 w-full max-w-[1760px] mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Left Sidebar */}
      <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
          <SidebarAd />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto space-y-8">
        <GameSubNav stateSlug={state.slug} gameSlug={game.slug} currentSection="lucky" />

        <div className="mb-6">
          <Link
            href={`/results/${state.slug}/${game.slug}`}
            className="text-slate-400 hover:text-[#0f172a] text-xs font-bold uppercase tracking-widest mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <ChevronLeft size={14} className="text-[#f59e0b]" /> BACK TO {game.name.toUpperCase()} RESULTS
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] tracking-tighter mb-3">
            {state.name} {game.name} Lucky Number Generator ({currentYear})
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base max-w-3xl">
            Generate instant {game.name} quick picks, touch-drum draws, numerology seeds, horoscope sets, or scramble your own numbers tailored to {state.name}&apos;s matrix ({preset.category.mainBalls} numbers from {preset.category.mainRange?.[0]}–{preset.category.mainRange?.[1]}).
          </p>
        </div>

        <BeforeContentAd />

        <LuckyGeneratorWrapper
          presetCategory={preset.category}
          gamePageContext={{
            stateName: state.name,
            stateSlug: state.slug,
            gameName: game.name,
            gameSlug: game.slug,
            hotNumbers: preset.hotNumbers,
            overdueNumbers: preset.overdueNumbers,
            matchedHubId: preset.matchedHubId,
          }}
        />

        <AfterContentAd />

        {/* Matrix Info & Cross Links */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-lg md:text-xl font-black text-[#0f172a]">
            <Wand2 size={20} className="text-[#f59e0b]" />
            <h2>
              About the {state.name} {game.name} Lottery Number Picker
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            This dedicated {game.name} generator matches {bundle.operatorName} drawing rules and connects directly with our verified {currentYear} results database. Compare your generated tickets against recent hot/overdue digits, check full 6-month draw history, or inspect our 2026 visual pattern chart before playing.
          </p>
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3 text-xs font-black">
            <Link
              href={`/results/${state.slug}/${game.slug}`}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-[#f59e0b]" /> Latest {game.name} Results
            </Link>
            <Link
              href={`/results/${state.slug}/${game.slug}/history`}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Clock size={14} className="text-[#f59e0b]" /> Past Winning Numbers
            </Link>
            <Link
              href={`/results/${state.slug}/${game.slug}/chart`}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-slate-950 transition-colors inline-flex items-center gap-1.5"
            >
              <BarChart3 size={14} /> 2026 Visual Chart
            </Link>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
          <SidebarAd />
        </div>
      </aside>
    </div>
  );
}
