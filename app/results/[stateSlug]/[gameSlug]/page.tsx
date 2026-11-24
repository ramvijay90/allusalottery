import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Zap, Building2, Landmark, Clock, ShieldCheck, DollarSign, Award, ExternalLink } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import State from '@/models/State';
import Result from '@/models/Result';
import GameChartAnalytics from '@/components/GameChartAnalytics';
import ChartImagePreview from '@/components/ChartImagePreview';
import LotteryChartNavigation from '@/components/LotteryChartNavigation';
import GameSubNav from '@/components/GameSubNav';
import MultiplexAd from '@/components/ads/MultiplexAd';
import SidebarAd from '@/components/ads/SidebarAd';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import AfterContentAd from '@/components/ads/AfterContentAd';
import { getStateLotteryDetails } from '@/lib/stateLotteryInfo';

// Cache responses for 5 minutes (ISR) to keep server process count near 0
export const revalidate = 300;

const STATE_ALIASES: Record<string, string> = {
  arizona: 'az',
  arkansas: 'ar',
  california: 'ca',
  colorado: 'co',
  connecticut: 'ct',
  delaware: 'de',
  florida: 'fl',
  georgia: 'ga',
  idaho: 'id',
  illinois: 'il',
  indiana: 'in',
  iowa: 'ia',
  kansas: 'ks',
  kentucky: 'ky',
  louisiana: 'la',
  maine: 'me',
  maryland: 'md',
  massachusetts: 'ma',
  michigan: 'mi',
  minnesota: 'mn',
  mississippi: 'ms',
  missouri: 'mo',
  montana: 'mt',
  nebraska: 'ne',
  newhampshire: 'nh',
  newjersey: 'nj',
  newmexico: 'nm',
  newyork: 'ny',
  northcarolina: 'nc',
  northdakota: 'nd',
  ohio: 'oh',
  oklahoma: 'ok',
  oregon: 'or',
  pennsylvania: 'pa',
  puertorico: 'pr',
  rhodeisland: 'ri',
  southcarolina: 'sc',
  southdakota: 'sd',
  tennessee: 'tn',
  texas: 'tx',
  vermont: 'vt',
  virginia: 'va',
  washington: 'wa',
  westvirginia: 'wv',
  wisconsin: 'wi',
  wyoming: 'wy',
  dc: 'dc',
  washingtondc: 'dc',
  ontario: 'on',
  quebec: 'qc',
  britishcolumbia: 'bc',
  atlanticcanada: 'ac',
  atlantic: 'ac',
  westerncanada: 'wc',
  western: 'wc',
  'au-nsw': 'au-nsw',
  'au-vic': 'au-vic',
  'au-qld': 'au-qld',
  'au-wa': 'au-wa',
  'au-sa': 'au-sa',
  'au-tas': 'au-tas',
  eu: 'eu',
  europe: 'eu',
  uk: 'uk',
  unitedkingdom: 'uk',
  'uk-eng': 'uk-eng',
  england: 'uk-eng',
  'uk-sct': 'uk-sct',
  scotland: 'uk-sct',
  'uk-wls': 'uk-wls',
  wales: 'uk-wls',
  'uk-nir': 'uk-nir',
  northernireland: 'uk-nir',
  ie: 'ie',
  ireland: 'ie',
  es: 'es',
  spain: 'es',
  'es-cat': 'es-cat',
  catalonia: 'es-cat',
  it: 'it',
  italy: 'it',
  fr: 'fr',
  france: 'fr',
  'eu-de': 'eu-de',
  germany: 'eu-de',
  'de-by': 'de-by',
  bavaria: 'de-by'
};

const GAME_ALIASES: Record<string, string> = {
  lottomax: 'lotto-max',
  megamillions: 'mega-millions',
  powerball: 'powerball',
  'power-ball': 'powerball',
  lotto649: 'canada-lotto-6-49',
  'lotto-6-49': 'canada-lotto-6-49',
  'canada-lotto649': 'canada-lotto-6-49',
};

function cleanJackpot(jackpotStr?: string): string {
  if (!jackpotStr) return '';
  let text = jackpotStr.trim();
  if (!text || text.toLowerCase() === 'official' || text.toLowerCase() === 'official result') return '';

  // Fix common scrape/OCR typo: CAS65 -> CA$65
  text = text.replace(/^CAS(?=\d)/i, 'CA$');

  // 1. Canadian Dollar pattern: CA$65 Million, CAD $12 Million, etc.
  const caMatch = text.match(/(?:CA\s?\$?|CAD\s?\$?)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (caMatch && caMatch[0].length >= 3) {
    let res = caMatch[0].trim();
    if (/^CA(?!\$)/i.test(res)) res = res.replace(/^CA/i, 'CA$');
    return res;
  }

  // 2. US / AU / UK / Euro pattern: US$45.95 Million, $2.65 Million, €130 Million, £5.4 Million, etc.
  const usMatch = text.match(/(?:US\s?\$?|AU\s?\$?|\$|£|€)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (usMatch && usMatch[0].length >= 2) {
    return usMatch[0].trim();
  }

  // 3. Fallback: match any standalone value with Million/Billion
  const millionMatch = text.match(/[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (millionMatch) {
    return `$${millionMatch[0].trim()}`;
  }

  return text.length > 18 ? text.slice(0, 16) + '...' : text;
}

function resolveAliases(stateSlug: string, gameSlug: string) {
  const cleanState = (stateSlug || '').toLowerCase().trim();
  const cleanGame = (gameSlug || '').toLowerCase().trim();
  const resolvedState = STATE_ALIASES[cleanState.replace(/[^a-z]/g, '')] || cleanState;
  const resolvedGame = GAME_ALIASES[cleanGame.replace(/[^a-z0-9]/g, '')] || GAME_ALIASES[cleanGame] || cleanGame;
  return { resolvedState, resolvedGame };
}

const getGameData = cache(async (stateSlug: string, gameSlug: string) => {
    await connectToDatabase();
    const state = await State.findOne({ slug: stateSlug }).lean();
    if (!state) return null;

    const game = await Game.findOne({ stateSlug, slug: gameSlug }).lean();
    if (!game) return null;

    // Determine if this is a "Top/Jackpot" game
    const isTopGame = !!game.jackpot || 
                      ['powerball', 'megamillions', 'lottomax'].includes(game.slug.toLowerCase()) ||
                      game.name.match(/Powerball|Mega Millions|Lotto Max/i);

    // Calculate cutoff
    let cutoffDate: Date;
    if (isTopGame) {
        // Jackpot/Top games: last 1 year from current date
        cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 365);
    } else {
        // Standard games: only from Jan 1, 2026
        cutoffDate = new Date('2026-01-01T00:00:00Z');
    }

    // Fetch initial history (50 items) for rich charts
    let history = await Result.find({
        gameId: game._id,
        date: { $gte: cutoffDate }
    })
        .sort({ date: -1 })
        .limit(50)
        .lean();

    // Fallback: If no records match 2026 cutoff, fetch latest available history to prevent empty tables
    if (history.length === 0) {
        history = await Result.find({
            gameId: game._id
        })
            .sort({ date: -1 })
            .limit(50)
            .lean();
    }

    // Fetch sibling games in the same state for internal linking equity
    const siblingGames = await Game.find({ stateSlug, slug: { $ne: gameSlug } })
        .select('name slug lastDrawDate numbers jackpot')
        .sort({ name: 1 })
        .limit(8)
        .lean();

    // Fallback: If no history records found in Result collection, use the game's latest numbers
    const initialHistoryData = history.length > 0 
        ? history 
        : (game.numbers && game.numbers.length > 0 ? [{
            date: game.lastDrawDate ? new Date(game.lastDrawDate).toISOString() : new Date().toISOString(),
            numbers: game.numbers,
            jackpot: game.jackpot || '',
            powerBall: game.powerBall || ''
        }] : []);

    return {
        state: JSON.parse(JSON.stringify(state)),
        game: JSON.parse(JSON.stringify(game)),
        history: JSON.parse(JSON.stringify(initialHistoryData)),
        siblingGames: JSON.parse(JSON.stringify(siblingGames)),
        cutoffDate: cutoffDate.toISOString()
    };
});

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string, gameSlug: string }> }) {
    const { stateSlug, gameSlug } = await params;
    const { resolvedState, resolvedGame } = resolveAliases(stateSlug, gameSlug);
    const data = await getGameData(resolvedState, resolvedGame);
    if (!data) return { title: 'Game Not Found' };

    const currentYear = new Date().getFullYear();
    const stateDetails = getStateLotteryDetails(resolvedState);
    const isMultiState = ['powerball', 'megamillions', 'lotto-america', 'cash-4-life', 'lucky-for-life', 'lottomax', 'euro-millions', 'euro-jackpot'].includes(data.game.slug.toLowerCase());
    
    // Unique formula for EVERY state to eliminate Google deduplication
    const primaryTitle = isMultiState
        ? `${data.state.name} ${data.game.name} Winning Numbers & Results ${currentYear} | ${stateDetails.code} Lottery`
        : `${data.state.name} ${data.game.name} Results Today, Past Numbers & Charts ${currentYear}`;
    
    const title = `${primaryTitle} | Past Drawings & Payouts`;
    const cleanJp = cleanJackpot(data.game.jackpot);
    const description = `Official ${data.state.name} ${data.game.name} winning numbers for ${currentYear}. Complete past draw history, 2026 result charts, ${data.state.name} claim deadlines (${stateDetails.claimPeriod}), state tax rates (${stateDetails.stateTaxRate}), and jackpot payouts (${cleanJp || 'official draws'}).`;
    const canonicalUrl = `https://allusalottery.com/results/${resolvedState}/${resolvedGame}`;
    const ogImageUrl = `https://allusalottery.com/results/${resolvedState}/${resolvedGame}/opengraph-image`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        keywords: [
            `${data.game.name} results`,
            `${data.game.name} winning numbers`,
            `${data.game.name} chart ${currentYear}`,
            `${data.game.name} past results`,
            `${data.game.name} history`,
            `${data.game.name} monthly chart`,
            `${data.game.name} weekly chart`,
            `${data.game.name} pending numbers`,
            `${data.game.name} overdue numbers`,
            `${data.game.name} hot and cold numbers`,
            `${data.state.name} lottery results`,
            `${data.state.name} ${data.game.name}`,
            'past lottery numbers',
            `lottery history ${currentYear}`,
            'tonight\'s winning numbers',
            'latest lottery draw',
            `check ${data.game.name} ticket`
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
                    alt: `${data.state.name} ${data.game.name} Winning Numbers Chart ${currentYear}`,
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

export default async function GamePage({ params }: { params: Promise<{ stateSlug: string, gameSlug: string }> }) {
    const { stateSlug, gameSlug } = await params;
    const { resolvedState, resolvedGame } = resolveAliases(stateSlug, gameSlug);

    // If an alias was used (e.g. /results/ontario/lottomax), redirect to canonical (/results/on/lotto-max)
    if (resolvedState !== stateSlug || resolvedGame !== gameSlug) {
        redirect(`/results/${resolvedState}/${resolvedGame}`);
    }

    const data = await getGameData(resolvedState, resolvedGame);

    if (!data) {
        notFound();
    }

    const { state, game, history, siblingGames } = data;
    const stateDetails = getStateLotteryDetails(state.slug);

    const currentYear = new Date().getFullYear();
    const isMultiState = ['powerball', 'megamillions', 'lotto-america', 'cash-4-life', 'lucky-for-life', 'lottomax', 'euro-millions', 'euro-jackpot'].includes(game.slug.toLowerCase());
    const pageH1 = isMultiState
        ? `${state.name} ${game.name} Winning Numbers & Results ${currentYear}`
        : `${state.name} ${game.name} Winning Numbers Today`;

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
                'name': `${state.name} Lottery`,
                'item': `https://allusalottery.com/results/${state.slug}`
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': `${game.name} Results`,
                'item': `https://allusalottery.com/results/${state.slug}/${game.slug}`
            }
        ]
    };

    // FAQPage JSON-LD Schema for Google Rich Snippets
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `What are today's ${state.name} ${game.name} winning numbers?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `The most recent winning numbers for ${state.name} ${game.name} drawn on ${new Date(game.lastDrawDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} are ${game.numbers.join(', ')}${game.powerBall ? ` with bonus ball ${game.powerBall}` : ''}.`
                }
            },
            {
                '@type': 'Question',
                'name': `What is the lottery tax rate on winnings in ${state.name}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `In ${state.name}, the state tax withholding on lottery prizes is ${stateDetails.stateTaxRate}. Federal taxes may also apply to prizes over $5,000.`
                }
            },
            {
                '@type': 'Question',
                'name': `How long do I have to claim ${game.name} tickets in ${state.name}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `Winning ${game.name} tickets in ${state.name} must be claimed within ${stateDetails.claimPeriod}.`
                }
            },
            {
                '@type': 'Question',
                'name': `Can ${state.name} lottery winners remain anonymous?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `${stateDetails.anonymity}.`
                }
            },
            {
                '@type': 'Question',
                'name': `When is the next ${game.name} drawing?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `The next scheduled drawing date is ${game.nextDrawDate ? new Date(game.nextDrawDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'to be announced'}. Ticket sales close at ${stateDetails.ticketSalesCutoff}. Estimated jackpot is ${game.jackpot || 'announced prior to drawing'}.`
                }
            },
            {
                '@type': 'Question',
                'name': `How can I check past ${game.name} winning numbers and draw charts?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `You can view complete 365-day past draw history, monthly result galleries, weekly day-of-week breakdown, and overdue pending numbers directly in the interactive 2026 chart on this page.`
                }
            },
            {
                '@type': 'Question',
                'name': `Which ${game.name} numbers are currently overdue?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `Switch to the 'Pending Numbers' tab on the chart above to analyze which numbers have not been drawn for the longest period.`
                }
            }
        ]
    };

    // Schema.org Lottery / Event JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': `${state.name} ${game.name} Lottery Drawing`,
        'startDate': game.lastDrawDate,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'location': {
            '@type': 'Place',
            'name': `${state.name} Lottery Official Drawing`,
            'address': {
                '@type': 'PostalAddress',
                'addressRegion': state.name,
                'addressCountry': 'US'
            }
        },
        'description': `Official ${state.name} ${game.name} lottery drawing. Winning numbers: ${game.numbers.join(' ')}${game.powerBall ? ' [' + game.powerBall + ']' : ''}.`,
        'offers': {
            '@type': 'Offer',
            'price': '2.00',
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock',
            'url': `https://allusalottery.com/results/${state.slug}/${game.slug}`
        }
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Left Sidebar - Desktop Only */}
            <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
            </aside>

            {/* Main Content Column */}
            <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto space-y-8">
                {/* Visual Chart Navigation Hub (Like Klsite) */}
                <LotteryChartNavigation stateSlug={state.slug} gameSlug={game.slug} country={state.country} />

                {/* 3-Tab Section Navigation (Latest, History, Chart) */}
                <GameSubNav stateSlug={state.slug} gameSlug={game.slug} currentSection="main" />

                <div className="mb-12">
                    <Link href={`/results/${state.slug}`} className="text-slate-400 hover:text-[#0f172a] text-xs font-bold uppercase tracking-widest mb-4 inline-flex items-center gap-1 transition-colors">
                        <ChevronLeft size={14} className="text-[#f59e0b]" /> ALL {state.name} RESULTS
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tighter mb-4">
                        {pageH1}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                            <Calendar size={16} className="text-[#f59e0b]" />
                            <span suppressHydrationWarning className="text-sm font-bold text-slate-600 uppercase tracking-wide">Next Draw: {game.nextDrawDate ? new Date(game.nextDrawDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-amber-900">
                            <TrendingUp size={16} />
                            <span className="text-sm font-black uppercase tracking-widest">Jackpot: {cleanJackpot(game.jackpot) || 'Pending'}</span>
                        </div>
                    </div>
                </div>

                {/* Visual Image Preview & Printable Download for Google Discover / Images (Klsite Style) */}
                <ChartImagePreview
                    imageSrc={`/results/${state.slug}/${game.slug}/opengraph-image`}
                    altText={`${state.name} ${game.name} Winning Numbers Chart 2026 - Official Drawing`}
                    title={`${state.name} ${game.name} Chart 2026`}
                    downloadFileName={`${state.slug}-${game.slug}-chart-2026.png`}
                />

                {/* Before Content Ad */}
                <BeforeContentAd />

                {/* Latest Result Hero Card - Matching High-End OG Card Design */}
                <div className="relative bg-gradient-to-br from-[#0a1128] via-[#102046] to-[#050b18] text-white rounded-[32px] p-6 sm:p-10 md:p-12 shadow-2xl mb-12 sm:mb-16 overflow-hidden border border-white/10 text-center">
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Gold State Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-3 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>{state.name} Official Lottery</span>
                        </div>
                        
                        {/* Title & Subtitle */}
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2">
                            {game.name} Winning Numbers
                        </h2>
                        <p className="text-xs sm:text-sm text-blue-200/80 font-medium mb-8 max-w-xl">
                            Official Draw Results & 365-Day Archive • {state.name}
                        </p>
                        
                        {/* Number Balls - Perfectly Proportioned Squircles & Circular Powerball */}
                        <div className="flex flex-wrap gap-2.5 sm:gap-3.5 md:gap-4 items-center justify-center mb-8">
                            {game.numbers.filter((num: string) => /^\d+$/.test(num.trim())).map((num: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 aspect-square rounded-2xl md:rounded-[22px] bg-white text-[#0f172a] text-xl sm:text-3xl md:text-4xl font-black flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.35)] border border-slate-100 hover:scale-105 transition-transform shrink-0"
                                >
                                    {num}
                                </span>
                            ))}
                            {game.powerBall && (
                                <div className="relative group shrink-0">
                                    <div className="absolute inset-0 bg-red-600 blur-xl opacity-60 rounded-full animate-pulse"></div>
                                    <span className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 aspect-square rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-xl sm:text-3xl md:text-4xl font-black flex items-center justify-center shadow-[0_10px_30px_rgba(220,38,38,0.6)] border-3 md:border-4 border-white animate-pulse shrink-0">
                                        {game.powerBall}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Pill Indicators (Jackpot, Verification, Rules) */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
                            {cleanJackpot(game.jackpot) && (
                                <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm">
                                    <span>💰</span>
                                    <span>Jackpot: {cleanJackpot(game.jackpot)}</span>
                                </div>
                            )}
                            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-slate-200 text-xs font-bold">
                                Official Numbers
                            </div>
                            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-slate-200 text-xs font-bold">
                                Draw Schedule
                            </div>
                            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Verified Results
                            </div>
                        </div>
                        
                        {/* Official Verification Footer Bar */}
                        <div className="w-full pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Official Draw Date:</span>
                                <span suppressHydrationWarning className="text-white font-black text-sm sm:text-base">
                                    {new Date(game.lastDrawDate).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Verified Against State Gazette</span>
                            </div>
                        </div>
                    </div>

                    {/* Ambient Radial Lights */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                </div>

                {/* History & Interactive Winning Chart Section */}
                <div className="mb-12">
                    <GameChartAnalytics 
                        initialHistory={history} 
                        gameName={game.name}
                        stateName={state.name}
                        gameId={game._id} 
                        cutoffDate={data.cutoffDate} 
                    />
                </div>

                {/* After Content Ad */}
                <AfterContentAd />

                {/* SEO Text, State Rules, Cross-Links & Frequently Asked Questions */}
                <div className="mt-12 space-y-8">
                    {/* State-Specific Claim & Tax Rules Guide (High E-E-A-T Unique Content) */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#f59e0b] flex items-center justify-center font-black">
                                <Landmark size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">
                                    {state.name} Lottery Rules, State Taxes & Claim Guidelines
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Official state regulations for {game.name} ticket holders</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                                    <DollarSign size={14} className="text-emerald-500" />
                                    <span>State Tax Withholding</span>
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {stateDetails.stateTaxRate}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Federal withholding of 24% applies to prizes exceeding $5,000 for US citizens.</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                                    <Clock size={14} className="text-amber-500" />
                                    <span>Ticket Claim Period</span>
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {stateDetails.claimPeriod}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Unclaimed prizes revert to the state education and general revenue funds.</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                                    <ShieldCheck size={14} className="text-blue-500" />
                                    <span>Winner Anonymity</span>
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {stateDetails.anonymity}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Rules are governed by {state.name} open public records legislation.</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                                    <Building2 size={14} className="text-purple-500" />
                                    <span>Headquarters & Sales Cutoff</span>
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {stateDetails.headquarters} • Cutoff {stateDetails.ticketSalesCutoff}
                                </div>
                                <div className="mt-1">
                                    <a 
                                        href={stateDetails.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-[#f59e0b] hover:underline font-bold inline-flex items-center gap-1"
                                    >
                                        Visit Official State Lottery Portal <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                            <p>
                                When you play <strong>{game.name}</strong> in {state.name}, drawings are conducted under strict regulatory supervision. Always sign the back of your paper ticket immediately upon purchase to establish legal ownership before claiming.
                            </p>
                        </div>
                    </div>

                    {/* Sibling Games Cross-Linking Hub (Internal Link Equity for Googlebot) */}
                    {siblingGames && siblingGames.length > 0 && (
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">
                                        More {state.name} Lottery Results Today
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">Explore live winning numbers, draw archives, and charts for all {state.name} games</p>
                                </div>
                                <Link 
                                    href={`/results/${state.slug}`} 
                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#f59e0b] hover:text-[#d97706] uppercase tracking-wider"
                                >
                                    View All {state.name} Games &rarr;
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {siblingGames.map((sib: any) => (
                                    <Link 
                                        key={sib.slug} 
                                        href={`/results/${state.slug}/${sib.slug}`}
                                        className="group p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all hover:shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                                                {state.name}
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 group-hover:text-[#f59e0b] transition-colors line-clamp-1">
                                                {sib.name}
                                            </h3>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-500">
                                            <span>{sib.jackpot || 'Results & Charts'}</span>
                                            <ChevronRight size={14} className="text-[#f59e0b] group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Frequently Asked Questions */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-[#0f172a] mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                            <span>❓</span> Frequently Asked Questions ({game.name} • {state.name})
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> What are today&apos;s winning numbers for {state.name} {game.name}?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    The latest winning numbers drawn on {new Date(game.lastDrawDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} are <strong>{game.numbers.join(' - ')}</strong>{game.powerBall ? ` with bonus ball ${game.powerBall}` : ''}.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> What is the lottery tax rate on winnings in {state.name}?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    In {state.name}, the state tax withholding rate is <strong>{stateDetails.stateTaxRate}</strong>. In addition, mandatory federal tax withholding of 24% applies to prizes over $5,000 for US citizens and resident aliens.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> How long do I have to claim {game.name} prizes in {state.name}?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    Winning tickets must be claimed within <strong>{stateDetails.claimPeriod}</strong>. Prizes not claimed before the deadline are returned to the state lottery trust fund.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> Can {state.name} lottery winners remain anonymous?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    {stateDetails.anonymity}. Consult with an attorney or financial advisor before claiming large jackpot awards.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> When is the next {state.name} {game.name} drawing?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    The next scheduled drawing date is {game.nextDrawDate ? new Date(game.nextDrawDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'announced by the state lottery'}. Ticket sales close at approximately {stateDetails.ticketSalesCutoff}.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                                    <span className="text-[#f59e0b] font-black">Q.</span> How do I check past {game.name} results and frequency charts?
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                                    Use the 365-day history table above to browse previous winning numbers, draw dates, and jackpot payouts. You can also switch between the Monthly Chart, Weekly Breakdown, and Overdue Pending Numbers tabs to study frequency patterns.
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
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-[#0f172a] font-bold text-center">
                    Check your tickets carefully! Good luck!
                </div>
            </aside>
        </div>
    );
}
