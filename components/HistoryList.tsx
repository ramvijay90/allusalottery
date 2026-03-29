'use client';

import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';

interface HistoryItem {
    date: string;
    numbers: string[];
    jackpot: string;
}

interface HistoryListProps {
    initialHistory: HistoryItem[];
    gameId: string;
    cutoffDate: string;
}

export default function HistoryList({ initialHistory, gameId, cutoffDate }: HistoryListProps) {
    const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const res = await fetch(`/api/history?gameId=${gameId}&page=${nextPage}&limit=20&cutoff=${cutoffDate}`);
            const newResults = await res.json();

            if (newResults.length === 0) {
                setHasMore(false);
            } else {
                setHistory([...history, ...newResults]);
                setPage(nextPage);
            }
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">Recent Draw History</h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Showing Last 365 Days</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0f172a] text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="p-6">Draw Date</th>
                            <th className="p-6">Winning Numbers</th>
                            <th className="p-6 text-right">Jackpot</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 transition-all">
                        {history.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="p-6">
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 font-black text-sm uppercase">
                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {item.numbers.map((n: string, i: number) => (
                                            <span key={i} className="w-8 h-8 rounded-lg bg-slate-100 text-[#0f172a] text-xs font-black flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:border-[#f59e0b]/30 transition-all shadow-sm">
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <span className="text-sm font-black text-[#0f172a] bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                        {item.jackpot || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} className="text-[#f59e0b]" />}
                        {loading ? 'Fetching Results...' : 'Load Complete History'}
                    </button>
                </div>
            )}
        </section>
    );
}
