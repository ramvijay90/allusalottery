import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight, Zap } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import State from '@/models/State';
import MultiplexAd from '@/components/ads/MultiplexAd';
import SidebarAd from '@/components/ads/SidebarAd';
import InFeedAd from '@/components/ads/InFeedAd';
import BeforeContentAd from '@/components/ads/BeforeContentAd';

function cleanJackpot(jackpotStr?: string): string {
  if (!jackpotStr) return '';
  let text = jackpotStr.trim();
  if (!text || text.toLowerCase() === 'official' || text.toLowerCase() === 'official result') return '';
  text = text.replace(/^CAS(?=\d)/i, 'CA$');
  const caMatch = text.match(/(?:CA\s?\$?|CAD\s?\$?)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (caMatch && caMatch[0].length >= 3) {
    let res = caMatch[0].trim();
    if (/^CA(?!\$)/i.test(res)) res = res.replace(/^CA/i, 'CA$');
    return res;
  }
  const usMatch = text.match(/(?:US\s?\$?|AU\s?\$?|NZ\s?\$?|ZAR\s?|NGN\s?|₦\s?|R\s?(?=\d)|\$|£|€)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)?/i);
  if (usMatch && usMatch[0].length >= 2) return usMatch[0].trim();
  const millionMatch = text.match(/[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (millionMatch) return `$${millionMatch[0].trim()}`;
  return text.length > 18 ? text.slice(0, 16) + '...' : text;
}

const STATE_ABBREVIATIONS: { [key: string]: string } = {
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  dc: 'DC',
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
  atlantic: 'ATL',
  bc: 'BC',
  ontario: 'ON',
  quebec: 'QC',
  western: 'WES',
  'au-nsw': 'NSW',
  'au-vic': 'VIC',
  'au-qld': 'QLD',
  'au-wa': 'WA',
  'au-sa': 'SA',
  'au-tas': 'TAS',
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
  za: 'ZA',
  ng: 'NG'
};

// Cache live results for 60 seconds (prevents process spikes under crawler traffic)
export const revalidate = 60;

export const metadata = {
    title: 'Live Lottery Results Today & Tonight Winning Numbers 2026',
    description: 'Track official live lottery results today and tonight\'s winning numbers from USA, Canada, Australia, UK, Europe, New Zealand, South Africa & Nigeria live.',
    alternates: {
        canonical: 'https://allusalottery.com/live-results',
    },
    keywords: [
        'live lottery results',
        'live lottery results today',
        'tonight\'s winning numbers',
        'latest winning numbers 2026',
        'past winning numbers',
        'numbers for the last 6 months',
        'Powerball Mega Millions live results',
        'Lotto Max Lotto 649 OLG WCLC Loto-Quebec',
        'The Lott Oz Lotto Australia Powerball',
        'EuroMillions UK Lotto Thunderball EuroJackpot',
        'MyLotto NZ Powerball results',
        'Ithuba SA PowerBall Daily Lotto Nigeria',
        'real time lottery results',
        'today lottery results',
        'lottery live feed'
    ],
    openGraph: {
        title: 'Live Lottery Results Today & Tonight Winning Numbers 2026',
        description: 'Track incoming lottery draws live across USA, Canada, UK, Europe, Australia, NZ & Africa as they happen.',
        url: 'https://allusalottery.com/live-results',
        images: [{ url: '/live-results/opengraph-image', width: 1200, height: 630, alt: 'Live Lottery Results Today 2026' }],
        type: 'website',
        siteName: 'All USA Lottery',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Live Lottery Results Today & Tonight Winning Numbers 2026',
        description: 'Track real-time lottery draws from USA, Canada & global lotteries live.',
        images: ['/live-results/opengraph-image'],
    }
};

async function getLiveResults() {
    try {
        await connectToDatabase();
        
        // Fetch games that actually have numbers recorded, sorted by latest draw date
        // Limit to 40 games to keep the feed punchy but comprehensive
        const games = await Game.find({ numbers: { $not: { $size: 0 } } })
                                .sort({ lastDrawDate: -1, updatedAt: -1 })
                                .limit(40)
                                .lean();
                                
        // To display the State Name properly, we need to populate state information
        // In this architecture, Game only stores stateSlug, so we fetch States separately
        const stateSlugs = [...new Set(games.map(g => g.stateSlug))];
        const states = await State.find({ slug: { $in: stateSlugs } }).lean();
        
        const stateMap = states.reduce((acc: any, state: any) => {
            acc[state.slug] = state.name;
            return acc;
        }, {});

        return JSON.parse(JSON.stringify({ games, stateMap }));
    } catch (e) {
        console.error("Failed to fetch live results backend:", e);
        return { games: [], stateMap: {} };
    }
}

export default async function LiveResultsPage() {
    const { games, stateMap } = await getLiveResults();

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
                'name': 'Live Results',
                'item': 'https://allusalottery.com/live-results'
            }
        ]
    };

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 px-4 py-12 w-full mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {/* Left Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 sticky top-28 h-fit">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-slate-600">
                    <p className="font-bold mb-2">Live Draw Monitor</p>
                    <p className="text-sm italic">"Our cloud scraper hits the states asynchronously, logging results directly to this global feed up to the minute."</p>
                </div>
            </aside>

            {/* Main Content Column */}
            <main className="w-full max-w-4xl mx-auto lg:mx-0">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg relative">
                            <Zap size={24} className="animate-pulse" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] tracking-tighter">
                            Live Lottery Results Today & <span className="text-red-600">Winning Numbers</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Watch instantly as state lotteries clear their drawings. The most absolutely recent global winners are pushed to the top of this feed.
                    </p>
                </div>

                {/* Before Content Ad */}
                <BeforeContentAd />

                <div className="grid gap-6">
                    {games.map((game: any, index: number) => {
                        const stateName = stateMap[game.stateSlug] || game.stateSlug.toUpperCase();
                        const abbr = STATE_ABBREVIATIONS[game.stateSlug] || game.stateSlug.substring(0, 2).toUpperCase();
                        
                        return (
                        <React.Fragment key={game._id}>
                            {/* The Card */}
                            <div className="bg-white rounded-[24px] border border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all p-6 group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 border-b border-dashed border-slate-100 pb-6">
                                    <div className="flex items-center gap-5">
                                        <Link href={`/results/${game.stateSlug}`} className="flex-shrink-0 w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-sm font-black text-[#0f172a] shadow-inner hover:bg-[#0f172a] hover:text-white transition-colors">
                                            {abbr}
                                        </Link>
                                        <div>
                                            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight group-hover:text-red-600 transition-colors">
                                                <Link href={`/results/${game.stateSlug}/${game.slug}`}>
                                                    {game.name}
                                                </Link>
                                            </h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stateName} Lottery</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <Calendar size={12} className="text-red-500" />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                {new Date(game.lastDrawDate).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {cleanJackpot(game.jackpot) && (
                                            <div className="mt-2 text-xl font-black text-[#0f172a]">{cleanJackpot(game.jackpot)}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Balls */}
                                <div className="flex flex-wrap items-center gap-3 mb-6 px-2">
                                    {(game.numbers || []).filter((num: string) => /^\d+$/.test(num.trim())).map((num: string, idx: number) => (
                                        <span key={`n-${idx}`} className="w-12 h-12 bg-white border-2 border-slate-200 text-[#0f172a] text-lg font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform">
                                            {num}
                                        </span>
                                    ))}
                                    {game.powerBall && (
                                        <span className="w-12 h-12 bg-red-500 border-2 border-red-600 text-white text-lg font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform animate-pulse">
                                            {game.powerBall}
                                        </span>
                                    )}
                                    {game.bonusBall && !game.powerBall && (
                                        <span className="w-12 h-12 bg-amber-500 border-2 border-amber-600 text-white text-lg font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform">
                                            {game.bonusBall}
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-end pr-2">
                                    <Link href={`/results/${game.stateSlug}/${game.slug}`} className="text-xs font-black text-slate-400 hover:text-[#0f172a] uppercase tracking-widest flex items-center gap-1 transition-colors">
                                        View History <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                            
                            {/* In-feed Ad placed intermittently in the stream */}
                            {(index === 2 || index === 7) && <InFeedAd />}
                        </React.Fragment>
                        );
                    })}

                    {games.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold mb-2">No live results intercepted yet.</p>
                            <p className="text-xs text-slate-400">Waiting for first state drawings...</p>
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <MultiplexAd />
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="hidden xl:block w-72 sticky top-28 h-fit">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
            </aside>
        </div>
    );
}
