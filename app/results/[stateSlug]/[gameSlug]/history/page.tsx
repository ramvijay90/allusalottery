import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, TrendingUp } from 'lucide-react';
import { getStateLotteryDetails } from '@/lib/stateLotteryInfo';
import { getGameData, resolveAliases, cleanJackpot } from '@/lib/getGameData';
import GameChartAnalytics from '@/components/GameChartAnalytics';
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
    if (!data) return { title: 'History Not Found' };

    const currentYear = new Date().getFullYear();
    const stateDetails = getStateLotteryDetails(resolvedState);

    const title = `${data.state.name} ${data.game.name} Past Results & History Archive ${currentYear} | All Draw Dates`;
    const description = `Complete official ${data.state.name} ${data.game.name} past results archive for ${currentYear} and previous draws. Search winning numbers by year, month, and date with jackpot payout history (${stateDetails.name}).`;
    const canonicalUrl = `https://allusalottery.com/results/${resolvedState}/${resolvedGame}/history`;
    const ogImageUrl = `https://allusalottery.com/results/${resolvedState}/${resolvedGame}/opengraph-image`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        keywords: [
            `${data.game.name} past results`,
            `${data.game.name} history`,
            `${data.game.name} draw archive`,
            `${data.game.name} past winning numbers ${currentYear}`,
            `${data.state.name} ${data.game.name} history`,
            `${data.game.name} old results`,
            `${data.game.name} numbers by date`,
            `all ${data.game.name} drawings`
        ],
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${data.state.name} ${data.game.name} Past Draw History` }],
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

export default async function GameHistoryPage({ params }: { params: Promise<{ stateSlug: string; gameSlug: string }> }) {
    const { stateSlug, gameSlug } = await params;
    const { resolvedState, resolvedGame } = resolveAliases(stateSlug, gameSlug);

    if (resolvedState !== stateSlug || resolvedGame !== gameSlug) {
        redirect(`/results/${resolvedState}/${resolvedGame}/history`);
    }

    const data = await getGameData(resolvedState, resolvedGame);
    if (!data) notFound();

    const { state, game, history } = data;
    const stateDetails = getStateLotteryDetails(state.slug);
    const currentYear = new Date().getFullYear();

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://allusalottery.com' },
            { '@type': 'ListItem', 'position': 2, 'name': `${state.name} Lottery`, 'item': `https://allusalottery.com/results/${state.slug}` },
            { '@type': 'ListItem', 'position': 3, 'name': `${game.name}`, 'item': `https://allusalottery.com/results/${state.slug}/${game.slug}` },
            { '@type': 'ListItem', 'position': 4, 'name': 'Past History', 'item': `https://allusalottery.com/results/${state.slug}/${game.slug}/history` }
        ]
    };

    return (
        <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-6 xl:gap-8 px-4 sm:px-6 xl:px-8 py-12 w-full max-w-[1760px] mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Left Sidebar */}
            <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
                    <SidebarAd />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto space-y-8">
                {/* 3-Tab Section Navigation */}
                <GameSubNav stateSlug={state.slug} gameSlug={game.slug} currentSection="history" />

                <div className="mb-8">
                    <Link href={`/results/${state.slug}/${game.slug}`} className="text-slate-400 hover:text-[#0f172a] text-xs font-bold uppercase tracking-widest mb-4 inline-flex items-center gap-1 transition-colors">
                        <ChevronLeft size={14} className="text-[#f59e0b]" /> LATEST {game.name.toUpperCase()} DRAW
                    </Link>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] tracking-tighter mb-4">
                        {state.name} {game.name} Past Results &amp; Draw History Archive
                    </h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base max-w-3xl">
                        Explore full verified past winning numbers for {state.name} {game.name} from {currentYear} and prior years. Filter by year, month, or search specific numbers.
                    </p>
                </div>

                {/* Before Content Ad */}
                <BeforeContentAd />

                {/* History Archive Table (Opens on table view) */}
                <div className="mb-12">
                    <GameChartAnalytics 
                        initialHistory={history} 
                        gameName={game.name}
                        stateName={state.name}
                        gameId={game._id} 
                        cutoffDate={data.cutoffDate} 
                        defaultTab="table"
                    />
                </div>

                {/* After Content Ad */}
                <AfterContentAd />

                {/* SEO Guide for History Searchers */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <h2 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">
                        How to Search Past {game.name} Winning Numbers
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Our complete {state.name} {game.name} database stores verified historical draws. You can filter results above by selecting a specific year or month, or type your favorite numbers into the search bar to check how many times they have been drawn.
                    </p>
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                        <span>🎯 Claim Deadline: {stateDetails.claimPeriod}</span>
                        <span>💰 State Tax Rate: {stateDetails.stateTaxRate}</span>
                        <span>🔒 Anonymity: {stateDetails.anonymity}</span>
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
