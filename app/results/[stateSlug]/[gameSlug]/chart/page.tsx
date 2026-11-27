import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, BarChart3, Sparkles } from 'lucide-react';
import { getStateLotteryDetails } from '@/lib/stateLotteryInfo';
import { getGameData, resolveAliases, cleanJackpot } from '@/lib/getGameData';
import GameChartAnalytics from '@/components/GameChartAnalytics';
import GameSubNav from '@/components/GameSubNav';
import ChartImagePreview from '@/components/ChartImagePreview';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import AfterContentAd from '@/components/ads/AfterContentAd';
import SidebarAd from '@/components/ads/SidebarAd';

export const dynamic = 'auto';
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string; gameSlug: string }> }) {
    const { stateSlug, gameSlug } = await params;
    const { resolvedState, resolvedGame } = resolveAliases(stateSlug, gameSlug);

    const data = await getGameData(resolvedState, resolvedGame);
    if (!data) return { title: 'Chart Not Found' };

    const currentYear = new Date().getFullYear();
    const stateDetails = getStateLotteryDetails(resolvedState);

    const title = `${data.state.name} ${data.game.name} 2026 Chart | Monthly, Weekly & Overdue Analysis`;
    const description = `Interactive ${currentYear} lottery charts for ${data.state.name} ${data.game.name}. Analyze monthly winning trends, weekly day-of-week breakdowns, hot and cold numbers, and overdue pending digits (${stateDetails.name}).`;
    const canonicalUrl = `https://allusalottery.com/results/${resolvedState}/${resolvedGame}/chart`;
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
            `${data.game.name} chart 2026`,
            `${data.game.name} monthly chart`,
            `${data.game.name} weekly chart`,
            `${data.game.name} overdue numbers`,
            `${data.game.name} pending numbers`,
            `${data.game.name} hot and cold numbers`,
            `${data.state.name} ${data.game.name} statistics`,
            `${data.game.name} frequency chart`
        ],
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${data.state.name} ${data.game.name} 2026 Lottery Chart` }],
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

export default async function GameChartPage({ params }: { params: Promise<{ stateSlug: string; gameSlug: string }> }) {
    const { stateSlug, gameSlug } = await params;
    const { resolvedState, resolvedGame } = resolveAliases(stateSlug, gameSlug);

    if (resolvedState !== stateSlug || resolvedGame !== gameSlug) {
        redirect(`/results/${resolvedState}/${resolvedGame}/chart`);
    }

    const data = await getGameData(resolvedState, resolvedGame);
    if (!data) notFound();

    const { state, game, history } = data;
    const currentYear = new Date().getFullYear();

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://allusalottery.com' },
            { '@type': 'ListItem', 'position': 2, 'name': `${state.name} Lottery`, 'item': `https://allusalottery.com/results/${state.slug}` },
            { '@type': 'ListItem', 'position': 3, 'name': `${game.name}`, 'item': `https://allusalottery.com/results/${state.slug}/${game.slug}` },
            { '@type': 'ListItem', 'position': 4, 'name': '2026 Chart', 'item': `https://allusalottery.com/results/${state.slug}/${game.slug}/chart` }
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
                <GameSubNav stateSlug={state.slug} gameSlug={game.slug} currentSection="chart" />

                <div className="mb-8">
                    <Link href={`/results/${state.slug}/${game.slug}`} className="text-slate-400 hover:text-[#0f172a] text-xs font-bold uppercase tracking-widest mb-4 inline-flex items-center gap-1 transition-colors">
                        <ChevronLeft size={14} className="text-[#f59e0b]" /> LATEST {game.name.toUpperCase()} DRAW
                    </Link>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] tracking-tighter mb-4">
                        {state.name} {game.name} 2026 Visual Chart &amp; Number Analytics
                    </h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base max-w-3xl">
                        Comprehensive interactive 2026 lottery charts for {state.name} {game.name}. Study monthly winning patterns, day-of-week frequencies, hot vs cold digits, and overdue pending numbers.
                    </p>
                </div>

                {/* Printable Visual Card Preview */}
                <ChartImagePreview
                    imageSrc={`/results/${state.slug}/${game.slug}/opengraph-image`}
                    altText={`${state.name} ${game.name} 2026 Visual Chart`}
                    title={`${state.name} ${game.name} Chart 2026`}
                    downloadFileName={`${state.slug}-${game.slug}-chart-2026.png`}
                />

                {/* Before Content Ad */}
                <BeforeContentAd />

                {/* Interactive Chart (Opens on monthly calendar tab) */}
                <div className="mb-12">
                    <GameChartAnalytics 
                        initialHistory={history} 
                        gameName={game.name}
                        stateName={state.name}
                        gameId={game._id} 
                        cutoffDate={data.cutoffDate} 
                        defaultTab="monthly"
                    />
                </div>

                {/* After Content Ad */}
                <AfterContentAd />
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
