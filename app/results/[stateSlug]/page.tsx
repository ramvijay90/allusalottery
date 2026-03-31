import React from 'react';
import { notFound } from 'next/navigation';
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

export const revalidate = 60; // ISR: Update every minute

async function getStateData(slug: string) {
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
}

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string }> }) {
    const { stateSlug } = await params;
    const data = await getStateData(stateSlug);
    if (!data) return { title: 'State Not Found' };

    return {
        title: `${data.state.name} Lottery Results - Winning Numbers`,
        description: `Latest ${data.state.name} lottery results, winning numbers, and jackpots. Updated instantly.`,
    };
}

export default async function StatePage({ params }: { params: Promise<{ stateSlug: string }> }) {
    const { stateSlug } = await params;
    const data = await getStateData(stateSlug);

    if (!data) {
        // If it's a 404 vs DB error, hard to tell, but let's assume if params are valid it might be DB
        // For now, if no data, we could show notFound or a custom error state.
        // Let's return a "Service Unavailable" style fallback if it looks like a DB issue?
        // Actually next.js notFound() is fine, but maybe we want to show the error message.
        // For simplicity, let's just trigger notFound() which is standard, 
        // OR return a custom error component.
        // Let's stick to notFound for invalid states, but we need to handle "DB offline" distinct from "State doesn't exist".
        // With the current try/catch returning null, it will 404. That's acceptable for now.
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-2">System Unavailable</h2>
                <p className="text-slate-600">We could not retrieve lottery results at this time. Please check your connection or try again later.</p>
                <Link href="/" className="text-blue-600 hover:align-baseline mt-4 inline-block">Return Home</Link>
            </div>
        );
    }

    const { state, games } = data;

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 px-4 py-12 w-full mx-auto">
            {/* Left Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 sticky top-28 h-fit">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic text-slate-500 text-sm">
                    "Accuracy is our priority. We sync with official state lottery feeds every minute."
                </div>
            </aside>

            {/* Main Content Column */}
            <main className="w-full max-w-4xl mx-auto lg:mx-0">
                <div className="mb-12">
                    <Link href="/" className="text-slate-400 hover:text-[#0f172a] text-xs font-bold uppercase tracking-widest mb-4 inline-block transition-colors">
                        &larr; All States
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-12 h-12 bg-[#0f172a] text-[#f59e0b] rounded-xl flex items-center justify-center text-lg font-black shadow-lg">
                                    {state.slug.toUpperCase()}
                                </span>
                                <h1 className="text-4xl font-black text-[#0f172a] tracking-tighter">
                                    {state.name} <span className="text-slate-400">Lottery</span>
                                </h1>
                            </div>
                            <p className="text-slate-500 font-medium">Official winning numbers and latest jackpots.</p>
                        </div>
                    </div>
                </div>

                {/* Before Content Ad */}
                <BeforeContentAd />

                <div className="grid gap-8">
                    {games.map((game: any, index: number) => (
                        <React.Fragment key={game._id}>
                            <div className="premium-card p-8">
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
                                                <span>{new Date(game.lastDrawDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
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

                {/* Multiplex Ad Section */}
                <MultiplexAd />
            </main>

            {/* Right Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 sticky top-28 h-fit">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">More Results</h3>
                    <SidebarAd />
                </div>
            </aside>
        </div>
    );
}
