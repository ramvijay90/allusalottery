import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ChevronLeft, TrendingUp, Zap } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import State from '@/models/State';
import Result from '@/models/Result';
import HistoryList from '@/components/HistoryList';
import MultiplexAd from '@/components/ads/MultiplexAd';
import SidebarAd from '@/components/ads/SidebarAd';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import AfterContentAd from '@/components/ads/AfterContentAd';

export const revalidate = 60; // ISR

async function getGameData(stateSlug: string, gameSlug: string) {
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

    // Fetch initial history (20 items) limited by cutoff
    const history = await Result.find({
        gameId: game._id,
        date: { $gte: cutoffDate }
    })
        .sort({ date: -1 })
        .limit(20)
        .lean();

    return {
        state: JSON.parse(JSON.stringify(state)),
        game: JSON.parse(JSON.stringify(game)),
        history: JSON.parse(JSON.stringify(history)),
        cutoffDate: cutoffDate.toISOString()
    };
}

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string, gameSlug: string }> }) {
    const { stateSlug, gameSlug } = await params;
    const data = await getGameData(stateSlug, gameSlug);
    if (!data) return { title: 'Game Not Found' };

    return {
        title: `${data.game.name} Results - ${data.state.name} Lottery`,
        description: `Latest winning numbers for ${data.state.name} ${data.game.name}. Next jackpot: ${data.game.jackpot || 'N/A'}.`,
        openGraph: {
            images: ['/og-image.png'], // Placeholder
        }
    };
}

export default async function GamePage({ params }: { params: Promise<{ stateSlug: string, gameSlug: string }> }) {
    const { stateSlug, gameSlug } = await params;
    const data = await getGameData(stateSlug, gameSlug);

    if (!data) {
        notFound();
    }

    const { state, game, history } = data;

    // Schema.org JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Lottery',
        'name': `${state.name} ${game.name}`,
        'location': {
            '@type': 'Place',
            'name': state.name
        },
        'offers': {
            '@type': 'Offer',
            'price': '2.00',
            'priceCurrency': 'USD'
        },
        'lastDrawDate': game.lastDrawDate
    };

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 px-4 py-12 w-full mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Left Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 sticky top-28 h-fit">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
            </aside>

            {/* Main Content Column */}
            <main className="w-full max-w-4xl mx-auto lg:mx-0">
                <div className="mb-12">
                    <Link href={`/results/${state.slug}`} className="text-slate-400 hover:text-[#0f172a] text-xs font-bold uppercase tracking-widest mb-4 inline-flex items-center gap-1 transition-colors">
                        <ChevronLeft size={14} className="text-[#f59e0b]" /> ALL {state.name} RESULTS
                    </Link>
                    <h1 className="text-5xl font-black text-[#0f172a] tracking-tighter mb-4">
                        {state.name} <span className="text-slate-400">{game.name}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                            <Calendar size={16} className="text-[#f59e0b]" />
                            <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Next Draw: {game.nextDrawDate ? new Date(game.nextDrawDate).toLocaleDateString() : 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-amber-900">
                            <TrendingUp size={16} />
                            <span className="text-sm font-black uppercase tracking-widest">Jackpot: {game.jackpot || 'Pending'}</span>
                        </div>
                    </div>
                </div>

                {/* Before Content Ad */}
                <BeforeContentAd />

                {/* Latest Result Hero Card */}
                <div className="relative bg-[#0f172a] text-white rounded-[32px] p-10 md:p-14 shadow-2xl mb-20 overflow-hidden border border-white/5">
                    <div className="relative z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Most Recent Results</span>
                        </div>
                        
                        <h2 className="text-2xl font-black mb-8 text-blue-100 uppercase tracking-widest opacity-80">Winning Numbers</h2>
                        
                        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mb-10">
                            {game.numbers.map((num: string, idx: number) => (
                                <span key={idx} className="w-20 h-20 rounded-[28%] bg-white text-[#0f172a] text-3xl font-black flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform cursor-default">
                                    {num}
                                </span>
                            ))}
                            {game.powerBall && (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-red-600 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
                                    <span className="relative w-22 h-22 min-w-[80px] rounded-full bg-red-600 text-white text-3xl font-black flex items-center justify-center shadow-2xl border-4 border-white animate-pulse">
                                        {game.powerBall}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center gap-4">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Official Draw Date</span>
                            <span className="text-white font-black text-lg">
                                {new Date(game.lastDrawDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -ml-20 -mb-20"></div>
                </div>

                {/* History Table */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-8 bg-[#f59e0b] rounded-full"></div>
                        <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Results History</h2>
                    </div>
                    <HistoryList initialHistory={history} gameId={game._id} cutoffDate={data.cutoffDate} />
                </div>

                {/* After Content Ad */}
                <AfterContentAd />

                {/* Multiplex Ad Section */}
                <MultiplexAd />
            </main>

            {/* Right Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 sticky top-28 h-fit">
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
