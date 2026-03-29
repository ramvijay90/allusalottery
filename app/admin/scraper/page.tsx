'use client';

import { useState, useEffect } from 'react';
import { Play, RotateCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface State {
    _id: string;
    name: string;
    slug: string;
}

export default function ScraperControlPage() {
    const [states, setStates] = useState<State[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        // We need a public API to get states or use server action. 
        // Since we have the public /api (not created yet), let's just fetch from the public page logic or create a simple API.
        // Actually, we don't have a public states API. 
        // Let's assume for this version we fetch from a new API or just hardcode for demo if DB fetch is complex in client components
        // Better: Create /api/states route.
        fetchStates();
    }, []);

    const fetchStates = async () => {
        try {
            const res = await fetch('/api/states');
            if (res.ok) {
                const data = await res.json();
                setStates(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const triggerScraper = async (action: string, slug?: string) => {
        setRunning(slug || 'hub');
        setMessage(null);

        try {
            const res = await fetch('/api/admin/scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, slug }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Scraper started for ${slug || 'Hub'}` });
            } else {
                setMessage({ type: 'error', text: 'Failed to start scraper' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setTimeout(() => setRunning(null), 2000); // Fake loading state reset
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Scraper Control</h1>
                    <p className="text-slate-500">Manage automation tasks and crawlers.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Main Hub Control */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Hub Scraper</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-600">Refreshes the list of States and Games.</p>
                        <p className="text-xs text-slate-400 mt-1">Schedule: 2:00 AM Daily</p>
                    </div>
                    <button
                        onClick={() => triggerScraper('hub')}
                        disabled={running === 'hub'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {running === 'hub' ? <RotateCw className="animate-spin" size={18} /> : <Play size={18} />}
                        Run Now
                    </button>
                </div>
            </div>

            {/* State List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">State Scrapers</h2>
                    <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{states.length} States</span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading states...</div>
                ) : (
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                        {states.map((state) => (
                            <div key={state._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {state.slug.toUpperCase()}
                                    </div>
                                    <span className="font-medium text-slate-700">{state.name}</span>
                                </div>
                                <button
                                    onClick={() => triggerScraper('state', state.slug)}
                                    disabled={running === state.slug}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {running === state.slug ? <RotateCw className="animate-spin" size={14} /> : <Play size={14} />}
                                    Scrape Result
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
