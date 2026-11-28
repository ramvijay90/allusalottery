'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    ShieldCheck, ShieldAlert, RefreshCw, Download, Search, ExternalLink,
    CheckCircle2, AlertTriangle, XCircle, Activity, Wrench, Globe, EyeOff
} from 'lucide-react';

interface AuditRow {
    id: string;
    url: string;
    pageType: string;
    country: string;
    stateSlug?: string;
    stateName?: string;
    gameSlug?: string;
    gameName?: string;
    googleStatus: 'INDEXABLE_SITEMAP' | 'NOINDEX_THIN_EMPTY' | 'NOINDEX_ADMIN_SYSTEM' | 'ARCHIVAL_ENDED';
    dbHealth: 'HEALTHY_2026' | 'STALE_DRAW' | 'PARTIAL_2026' | 'EMPTY_NO_RESULTS';
    drawCount2026: number;
    earliest2026?: string;
    latest2026?: string;
    latestDrawDate?: string;
    repairable: boolean;
    reason: string;
}

interface AuditSummary {
    totalUrls: number;
    indexable: number;
    noindexThin: number;
    noindexSystem: number;
    archival: number;
    staleUrls: number;
    partial2026Urls: number;
    emptyUrls: number;
    repairableGameHubs: number;
    countries: string[];
}

interface ProbeResult {
    url: string;
    httpStatus: number;
    xRobotsTag?: string;
    robotsMeta?: string;
    canonical?: string;
    title?: string;
    schemaCount?: number;
    adUnitsDetected?: number;
    googleWillIndex?: boolean;
    error?: string;
}

export default function AdminAuditPage() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [rows, setRows] = useState<AuditRow[]>([]);
    const [search, setSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('Game Hub');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [limit, setLimit] = useState(100);
    const [scrapingKey, setScrapingKey] = useState<string | null>(null);
    const [probingUrl, setProbingUrl] = useState<string | null>(null);
    const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
    const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadAudit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/audit', { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load audit');
            setSummary(data.summary);
            setRows(data.rows || []);
        } catch (e: any) {
            setBanner({ type: 'error', text: e.message || 'Could not load audit report' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAudit();
    }, []);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter((r) => {
            if (countryFilter !== 'ALL' && r.country !== countryFilter) return false;
            if (typeFilter !== 'ALL' && r.pageType !== typeFilter) return false;
            if (statusFilter === 'NOINDEX' && !r.googleStatus.startsWith('NOINDEX')) return false;
            if (statusFilter === 'REPAIRABLE' && !r.repairable) return false;
            if (statusFilter === 'STALE' && r.dbHealth !== 'STALE_DRAW') return false;
            if (statusFilter === 'PARTIAL' && r.dbHealth !== 'PARTIAL_2026') return false;
            if (statusFilter === 'EMPTY' && r.dbHealth !== 'EMPTY_NO_RESULTS') return false;
            if (statusFilter === 'HEALTHY' && (r.googleStatus !== 'INDEXABLE_SITEMAP' || r.dbHealth !== 'HEALTHY_2026')) return false;
            if (q) {
                const hay = `${r.url} ${r.country} ${r.stateName || ''} ${r.gameName || ''} ${r.reason}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [rows, countryFilter, typeFilter, statusFilter, search]);

    const visibleRows = filteredRows.slice(0, limit);

    const handleScrapeMissing = async (row?: AuditRow) => {
        const key = row ? row.id : 'ALL_MISSING';
        setScrapingKey(key);
        setBanner(null);

        try {
            const payload = row
                ? { stateSlug: row.stateSlug, gameSlug: row.gameSlug, mode: 'single' }
                : { mode: 'all_missing' };

            const res = await fetch('/api/admin/audit/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Scrape failed');

            const updatedMsg = row
                ? `Synced ${row.stateSlug?.toUpperCase()} (${row.url}) in ${data.durationMs}ms.`
                : `Batch scrape finished in ${data.durationMs}ms (${data.totalUpdated} updated records).`;

            setBanner({ type: 'success', text: updatedMsg });
            await loadAudit();
        } catch (e: any) {
            setBanner({ type: 'error', text: e.message || 'Scrape trigger error' });
        } finally {
            setScrapingKey(null);
        }
    };

    const handleLiveProbe = async (urlPath: string) => {
        setProbingUrl(urlPath);
        setProbeResult(null);
        try {
            const res = await fetch(`/api/admin/audit?probe=${encodeURIComponent(urlPath)}`, { cache: 'no-store' });
            const data = await res.json();
            setProbeResult(data);
        } catch (e: any) {
            setProbeResult({ url: urlPath, httpStatus: 0, error: e.message });
        } finally {
            setProbingUrl(null);
        }
    };

    const handleExportCsv = () => {
        const header = ['URL', 'Type', 'Country', 'State', 'Game', 'GoogleStatus', 'DbHealth', 'Draws2026', 'Earliest2026', 'Latest2026', 'Reason'];
        const lines = filteredRows.map((r) =>
            [
                r.url, r.pageType, r.country, r.stateName || '', r.gameName || '',
                r.googleStatus, r.dbHealth, r.drawCount2026, r.earliest2026 || '', r.latest2026 || '',
                `"${(r.reason || '').replace(/"/g, '""')}"`
            ].join(',')
        );
        const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `google-url-audit-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const renderGoogleBadge = (status: AuditRow['googleStatus']) => {
        if (status === 'INDEXABLE_SITEMAP') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={13} /> Indexed (Sitemap)
                </span>
            );
        }
        if (status === 'NOINDEX_THIN_EMPTY') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                    <XCircle size={13} /> Noindex (Thin / Empty)
                </span>
            );
        }
        if (status === 'NOINDEX_ADMIN_SYSTEM') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    <EyeOff size={13} /> Noindex Protected
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle size={13} /> Archival / Ended
            </span>
        );
    };

    const renderDbBadge = (row: AuditRow) => {
        if (row.dbHealth === 'HEALTHY_2026') {
            return <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Healthy ({row.drawCount2026} draws)</span>;
        }
        if (row.dbHealth === 'PARTIAL_2026') {
            return <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Partial 2026 ({row.drawCount2026})</span>;
        }
        if (row.dbHealth === 'STALE_DRAW') {
            return <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">Stale ({row.latestDrawDate || 'old'})</span>;
        }
        return <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">Missing Results (0)</span>;
    };

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-[11px] font-black uppercase tracking-wider mb-2">
                        <EyeOff size={12} /> Noindex Admin Utility • Search Console &amp; DB Sync
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Google URL Indexability &amp; Missing-Results Audit</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Detects thin/empty <code>noindex</code> pages, stale draws, and partial 2026 history—and scrapes missing results directly into MongoDB.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={loadAudit}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExportCsv}
                        disabled={filteredRows.length === 0}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => handleScrapeMissing()}
                        disabled={scrapingKey !== null}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <Wrench size={16} className={scrapingKey === 'ALL_MISSING' ? 'animate-spin' : ''} />
                        {scrapingKey === 'ALL_MISSING' ? 'Scraping Missing...' : 'Auto-Scrape All Missing'}
                    </button>
                </div>
            </div>

            {banner && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-bold ${
                    banner.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {banner.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    <span>{banner.text}</span>
                </div>
            )}

            {/* KPI Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 uppercase">Total Audited URLs</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalUrls.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">Across {summary.countries.length} regions</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm">
                        <div className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1"><ShieldCheck size={14} /> Indexed Sitemap</div>
                        <div className="text-2xl font-black text-emerald-700 mt-1">{summary.indexable.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">Valid draws + SEO schema</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><EyeOff size={14} /> Google Noindex</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">{(summary.noindexThin + summary.noindexSystem).toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">{summary.noindexThin} thin + {summary.noindexSystem} admin/API</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm">
                        <div className="text-xs font-bold text-orange-600 uppercase flex items-center gap-1"><ShieldAlert size={14} /> Missing / Stale DB</div>
                        <div className="text-2xl font-black text-orange-700 mt-1">{summary.repairableGameHubs.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">{summary.staleUrls} stale / {summary.emptyUrls} empty routes</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                        <div className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1"><Activity size={14} /> Partial 2026 History</div>
                        <div className="text-2xl font-black text-amber-800 mt-1">{summary.partial2026Urls.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">{summary.archival} archival/ended routes</div>
                    </div>
                </div>
            )}

            {/* Live URL Probe Box */}
            {probeResult && (
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-700 shadow-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <div className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                            <Globe size={14} /> Live Googlebot Inspection: {probeResult.url}
                        </div>
                        <button onClick={() => setProbeResult(null)} className="text-slate-400 hover:text-white font-bold">Close</button>
                    </div>
                    {probeResult.error ? (
                        <div className="text-red-400 font-bold">Probe Error: {probeResult.error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                            <div className="bg-white/5 p-3 rounded-lg"><span className="text-slate-400 block">HTTP Status</span><strong>{probeResult.httpStatus}</strong></div>
                            <div className="bg-white/5 p-3 rounded-lg"><span className="text-slate-400 block">Meta Robots</span><strong>{probeResult.robotsMeta}</strong></div>
                            <div className="bg-white/5 p-3 rounded-lg"><span className="text-slate-400 block">JSON-LD / AdUnits</span><strong>{probeResult.schemaCount} schemas • {probeResult.adUnitsDetected} ads</strong></div>
                            <div className="bg-white/5 p-3 rounded-lg"><span className="text-slate-400 block">Google Index Eligibility</span><strong className={probeResult.googleWillIndex ? 'text-emerald-400' : 'text-red-400'}>{probeResult.googleWillIndex ? 'INDEXABLE' : 'BLOCKED / NOINDEX'}</strong></div>
                        </div>
                    )}
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter by URL, game name, region, or reason..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg font-medium">
                    <option value="ALL">All Countries</option>
                    {summary?.countries.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="Global">Global</option>
                    <option value="System">System</option>
                </select>

                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg font-medium">
                    <option value="ALL">All URL Types</option>
                    <option value="Game Hub">Game Hubs</option>
                    <option value="State Hub">State/Region Hubs</option>
                    <option value="Past History">Past History</option>
                    <option value="Visual Chart">Visual Charts</option>
                    <option value="Lucky Numbers">Game Lucky Numbers</option>
                    <option value="Generator">Lucky Generators</option>
                    <option value="Admin/Noindex">Admin / Noindex</option>
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg font-medium">
                    <option value="ALL">All Statuses</option>
                    <option value="REPAIRABLE">Needs Scrape Update Only</option>
                    <option value="NOINDEX">Noindex URLs Only</option>
                    <option value="STALE">Stale Draws Only</option>
                    <option value="PARTIAL">Partial 2026 Only</option>
                    <option value="EMPTY">Empty (0 Draws)</option>
                    <option value="HEALTHY">Indexed &amp; Healthy</option>
                </select>

                <span className="text-xs font-bold text-slate-500 ml-auto">
                    Showing {visibleRows.length} of {filteredRows.length} matching URLs
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                            <tr>
                                <th className="py-3.5 px-4">URL &amp; Type</th>
                                <th className="py-3.5 px-4">Region / Game</th>
                                <th className="py-3.5 px-4">Google Status</th>
                                <th className="py-3.5 px-4">DB 2026 Freshness</th>
                                <th className="py-3.5 px-4">Diagnostics</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-400">Running full SEO &amp; database audit...</td></tr>
                            ) : visibleRows.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No URLs matched your filter criteria.</td></tr>
                            ) : (
                                visibleRows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                <a href={row.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline flex items-center gap-1">
                                                    {row.url} <ExternalLink size={11} className="text-slate-400" />
                                                </a>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-400">{row.pageType}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-800">{row.gameName || row.stateName || row.country}</div>
                                            <div className="text-xs text-slate-500">{row.country}{row.stateName && row.gameName ? ` • ${row.stateName}` : ''}</div>
                                        </td>
                                        <td className="py-3 px-4">{renderGoogleBadge(row.googleStatus)}</td>
                                        <td className="py-3 px-4">
                                            <div>{renderDbBadge(row)}</div>
                                            {row.earliest2026 && row.latest2026 && (
                                                <div className="text-[11px] text-slate-400 mt-0.5">{row.earliest2026} → {row.latest2026}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">{row.reason}</td>
                                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                onClick={() => handleLiveProbe(row.url)}
                                                disabled={probingUrl === row.url}
                                                className="px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
                                            >
                                                {probingUrl === row.url ? 'Probing...' : 'Probe Live'}
                                            </button>
                                            {row.stateSlug && (
                                                <button
                                                    onClick={() => handleScrapeMissing(row)}
                                                    disabled={scrapingKey !== null}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                                        row.repairable
                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                    } disabled:opacity-50`}
                                                >
                                                    {scrapingKey === row.id ? 'Syncing...' : 'Scrape Missing'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredRows.length > limit && (
                    <div className="p-4 border-t border-slate-100 text-center">
                        <button
                            onClick={() => setLimit((l) => l + 150)}
                            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider"
                        >
                            Load More ({filteredRows.length - limit} remaining)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
