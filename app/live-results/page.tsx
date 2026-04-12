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

// Force absolute dynamic rendering for live tracking
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Live Lottery Results & Latest Winning Numbers',
    description: 'Track the absolute latest real-time lottery draws from 50 US States as they happen. Watch live winning numbers drop instantly.',
    keywords: ['live lottery results', 'latest winning numbers', 'real time lottery', 'today lottery results', 'lottery live feed'],
    openGraph: {
        title: 'Live Lottery Results Feed',
        description: 'Track live incoming lottery draws from 50 states as they happen.',
        url: 'https://allusalottery.com/live-results',
        images: [{ url: '/og-image.png', width: 1200, height: 630 }],
        type: 'website',
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

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 px-4 py-12 w-full mx-auto">
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
                        <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tighter">
                            Live <span className="text-red-600">Results</span>
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
                        
                        return (
                        <React.Fragment key={game._id}>
                            {/* The Card */}
                            <div className="bg-white rounded-[24px] border border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all p-6 group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 border-b border-dashed border-slate-100 pb-6">
                                    <div className="flex items-center gap-5">
                                        <Link href={`/results/${game.stateSlug}`} className="flex-shrink-0 w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-lg font-black text-[#0f172a] shadow-inner hover:bg-[#0f172a] hover:text-white transition-colors">
                                            {game.stateSlug.toUpperCase()}
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
                                        {game.jackpot && (
                                            <div className="mt-2 text-xl font-black text-[#0f172a]">{game.jackpot}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Balls */}
                                <div className="flex flex-wrap items-center gap-3 mb-6 px-2">
                                    {game.numbers.map((num: string, idx: number) => (
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
