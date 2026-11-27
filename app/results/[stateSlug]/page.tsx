import React, { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import State from '@/models/State';
import Game from '@/models/Game';
import MultiplexAd from '@/components/ads/MultiplexAd';
import SidebarAd from '@/components/ads/SidebarAd';
import InFeedAd from '@/components/ads/InFeedAd';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import ChartImagePreview from '@/components/ChartImagePreview';
import LotteryChartNavigation from '@/components/LotteryChartNavigation';

const STATE_ABBREVIATIONS: { [key: string]: string } = {
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  dc: 'DC',
  washingtondc: 'DC',
  districtcolumbia: 'DC',
  florida: 'FL',
  georgia: 'GA',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  newhampshire: 'NH',
  newjersey: 'NJ',
  newmexico: 'NM',
  newyork: 'NY',
  northcarolina: 'NC',
  northdakota: 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  puertorico: 'PR',
  rhodeisland: 'RI',
  southcarolina: 'SC',
  southdakota: 'SD',
  tennessee: 'TN',
  texas: 'TX',
  virginislands: 'VI',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  westvirginia: 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  atlanticcanada: 'AC',
  atlantic: 'AC',
  bc: 'BC',
  britishcolumbia: 'BC',
  'au-nsw': 'NSW',
  'au-vic': 'VIC',
  'au-qld': 'QLD',
  'au-wa': 'WA',
  'au-sa': 'SA',
  'au-tas': 'TAS',
  ontario: 'ON',
  quebec: 'QC',
  westerncanada: 'WC',
  western: 'WC',
  eu: 'EU',
  uk: 'UK',
  'uk-eng': 'ENG',
  'uk-sct': 'SCT',
  'uk-wls': 'WLS',
  'uk-nir': 'NIR',
  ie: 'IE',
  es: 'ES',
  'es-cat': 'CAT',
  it: 'IT',
  fr: 'FR',
  'eu-de': 'GER',
  'de-by': 'BAY',
  nz: 'NZ',
  newzealand: 'NZ',
  za: 'ZA',
  southafrica: 'ZA',
  ng: 'NG',
  nigeria: 'NG',
  africa: 'ZA'
};

const STATE_SLUG_ALIASES: { [key: string]: string } = {
  washingtondc: 'dc',
  districtcolumbia: 'dc',
  atlanticcanada: 'ac',
  atlantic: 'ac',
  britishcolumbia: 'bc',
  ontario: 'on',
  quebec: 'qc',
  westerncanada: 'wc',
  western: 'wc',
  unitedkingdom: 'uk',
  england: 'uk-eng',
  scotland: 'uk-sct',
  wales: 'uk-wls',
  northernireland: 'uk-nir',
  ireland: 'ie',
  spain: 'es',
  catalonia: 'es-cat',
  italy: 'it',
  france: 'fr',
  germany: 'eu-de',
  bavaria: 'de-by',
  newzealand: 'nz',
  southafrica: 'za',
  nigeria: 'ng',
  africa: 'za',
};

function resolveStateSlug(input: string): string {
  const clean = (input || '').toLowerCase().trim();
  if (/^[a-z]{2}(-[a-z0-9]+)?$/.test(clean)) {
    return clean;
  }
  const normalizedKey = clean.replace(/[^a-z]/g, '');
  if (STATE_SLUG_ALIASES[normalizedKey]) return STATE_SLUG_ALIASES[normalizedKey];
  if (STATE_ABBREVIATIONS[normalizedKey]) {
    return STATE_ABBREVIATIONS[normalizedKey].toLowerCase();
  }
  return clean;
}

// Cache state pages for 5 minutes (ISR) to keep process usage near 0
export const revalidate = 300;

const getStateData = cache(async (slug: string) => {
    try {
        await connectToDatabase();
        const state = await State.findOne({ slug }).lean();
        if (!state) return null;

        const games = await Game.find({ stateSlug: slug }).sort({ name: 1 }).lean();
        return {
            state: JSON.parse(JSON.stringify(state)),
            games: JSON.parse(JSON.stringify(games))
        };
    } catch (error) {
        console.error("Database connection failed:", error);
        return null;
    }
});

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string }> }) {
    const { stateSlug } = await params;
    const resolved = resolveStateSlug(stateSlug);
    const data = await getStateData(resolved);
    if (!data) return { title: 'State Not Found' };

    const currentYear = new Date().getFullYear();
    const stateName = data.state.name;
    const country = data.state.country || 'USA';
    const regionLabel = country === 'US' ? 'USA' : country;
    const activeGamesCount = (data.games || []).filter((g: any) => Array.isArray(g.numbers) && g.numbers.length > 0).length;

    const title = `${stateName} Lottery Results Today & Winning Numbers ${currentYear} | ${regionLabel}`;
    const description = `Official ${stateName} lottery results today, live winning numbers, daily jackpot updates, and complete game schedules for ${currentYear}. Fast, verified drawings.`;
    const canonicalUrl = `https://allusalottery.com/results/${resolved}`;
    const ogImageUrl = `https://allusalottery.com/results/${resolved}/opengraph-image`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        robots: activeGamesCount > 0
            ? { index: true, follow: true }
            : { index: false, follow: true },
        keywords: [
            `${stateName} lottery`,
            `${stateName} lottery results`,
            `${stateName} lottery results today`,
            `${stateName} winning numbers ${currentYear}`,
            `${stateName} lotto live`,
            'daily lottery drawings',
            'state lottery results'
        ],
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${stateName} Lottery Results Today Live`,
                }
            ],
            type: 'website',
            siteName: 'All USA Lottery',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        }
    };
}

export default async function StatePage({ params }: { params: Promise<{ stateSlug: string }> }) {
    const { stateSlug } = await params;
    const resolved = resolveStateSlug(stateSlug);

    // If full state name was passed (e.g. /results/ontario), redirect to canonical /results/on
    if (resolved !== stateSlug) {
        redirect(`/results/${resolved}`);
    }

    const data = await getStateData(resolved);

    if (!data) {
        return notFound();
    }

    const { state, games } = data;
    const currentYear = new Date().getFullYear();

    // BreadcrumbList JSON-LD Schema
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://allusalottery.com'
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': `${state.name} Lottery Results`,
                'item': `https://allusalottery.com/results/${state.slug}`
            }
        ]
    };

    // FAQPage JSON-LD Schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `Where can I find today's ${state.name} lottery winning numbers?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `All official ${state.name} lottery winning numbers are updated live immediately following each daily drawing right on this page.`
                }
            },
            {
                '@type': 'Question',
                'name': `What games are drawn in ${state.name}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `${state.name} offers multiple lottery games including ${games.slice(0, 5).map((g: any) => g.name).join(', ')}, and multi-state drawings like Powerball and Mega Millions.`
                }
            }
        ]
    };

    return (
        <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-6 xl:gap-8 px-4 sm:px-6 xl:px-8 py-12 w-full max-w-[1760px] mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {/* Left Sidebar - Desktop Only */}
            <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic text-slate-500 text-sm">
                    "Accuracy is our priority. We sync with official state lottery feeds every minute."
                </div>
            </aside>

            {/* Main Content Column */}
            <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto space-y-8">
                {/* Visual Chart Navigation */}
                <LotteryChartNavigation stateSlug={state.slug} country={state.country} />

                <div className="mb-8">
                    <Link href="/" className="text-slate-400 hover:text-[#0f172a] text-xs font-bold uppercase tracking-widest mb-4 inline-block transition-colors">
                        &larr; All States
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-12 h-12 bg-[#0f172a] text-[#f59e0b] rounded-xl flex items-center justify-center text-sm font-black shadow-lg">
                                    {STATE_ABBREVIATIONS[state.slug] || state.slug.substring(0, 2).toUpperCase()}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] tracking-tighter">
                                    {state.name} Lottery Results Today & Winning Numbers
                                </h1>
                            </div>
                            <p className="text-slate-500 font-medium">Official winning numbers and latest jackpots.</p>
                        </div>
                    </div>
                </div>

                {/* Visual Image Preview & Printable Download Card for Google Discover / Images */}
                <ChartImagePreview
                    imageSrc={`/results/${state.slug}/opengraph-image`}
                    altText={`${state.name} Lottery Results Chart 2026 - Today Winning Numbers`}
                    title={`${state.name} Lottery Results Chart 2026`}
                    downloadFileName={`${state.slug}-lottery-results-chart-2026.png`}
                />

                {/* Before Content Ad */}
                <BeforeContentAd />

                <div className="grid gap-8">
                    {games.map((game: any, index: number) => (
                        <React.Fragment key={game._id}>
                            <div className="premium-card p-5 sm:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-5">
                                        {game.imageUrl && (
                                            <div className="flex-shrink-0 bg-white p-2 border border-slate-100 rounded-xl shadow-sm">
                                                <Image src={game.imageUrl} alt={`${game.name} Logo`} width={140} height={60} className="h-10 md:h-12 w-auto object-contain" />
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight group">
                                                <Link href={`/results/${state.slug}/${game.slug}`} className="hover:text-[#f59e0b] transition-colors">
                                                    {game.name}
                                                </Link>
                                            </h2>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                <Calendar size={14} className="text-[#f59e0b]" />
                                                <span>{new Date(game.lastDrawDate).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {game.jackpot && (
                                        <div className="bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl text-right shadow-sm">
                                            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Estimate Jackpot</div>
                                            <div className="text-2xl font-black text-[#0f172a]">{game.jackpot}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Balls Display */}
                                <div className="flex flex-wrap gap-3 items-center mb-8">
                                    {game.numbers.map((num: string, idx: number) => (
                                        <span key={idx} className="ball ball-standard">
                                            {num}
                                        </span>
                                    ))}
                                    {game.powerBall && (
                                        <span className="ball ball-power">
                                            {game.powerBall}
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Result Cached</span>
                                    </div>
                                    <Link href={`/results/${state.slug}/${game.slug}`} className="bg-slate-50 hover:bg-[#0f172a] text-slate-600 hover:text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                        Past Results <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>

                            {/* In-feed Ad after 2nd game */}
                            {index === 1 && <InFeedAd />}
                        </React.Fragment>
                    ))}

                    {games.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                            <p className="font-bold text-lg mb-1">No games found for this state.</p>
                            <p className="text-sm">Initiate the scraper to see results here.</p>
                        </div>
                    )}
                </div>

                {/* SEO Text & Frequently Asked Questions */}
                <div className="mt-12 space-y-8">
                    {/* State Lottery Overview */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-[#0f172a] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <span>ℹ️</span> About {state.name} Lottery Results & Schedule
                        </h2>
                        <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                            <p>
                                Welcome to the official <strong>{state.name} Lottery Results</strong> hub. We provide verified, real-time winning numbers for daily draws, mid-day drawings, evening drawings, and multi-state drawings like Powerball and Mega Millions.
                            </p>
                            <p>
                                Every drawing is synced directly with official lottery commission feeds. Whether you need today&apos;s winning numbers, jackpot amounts, or complete past archives, you can explore each game&apos;s 365-day history by clicking &quot;Past Results&quot; on any game card above.
                            </p>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-[#0f172a] mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <span>❓</span> Frequently Asked Questions ({state.name} Lottery)
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> What time are {state.name} lottery drawings held?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    Drawing schedules vary by game. Midday drawings typically take place between 12:30 PM and 1:30 PM, while evening drawings occur between 7:00 PM and 11:00 PM local time. Winning numbers are posted live immediately after confirmation.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> How do I check if my {state.name} lottery ticket won?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    Compare the numbers printed on your ticket with the official winning numbers listed above for your specific draw date. For detailed payout tiers and prize breakdowns, click into each individual game page.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> Can I play multi-state lotteries in {state.name}?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    Yes, major multi-state games like Powerball and Mega Millions are available at licensed lottery retailers and online platforms where permitted in {state.name}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multiplex Ad Section */}
                <MultiplexAd />
            </main>

            {/* Right Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">More Results</h3>
                    <SidebarAd />
                </div>
            </aside>
        </div>
    );
}
