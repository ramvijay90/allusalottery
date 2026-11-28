'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, CheckCircle2, Sparkles, ArrowRight, BarChart3, Clock, Wand2, Loader2, Layers } from 'lucide-react';

interface SearchResultItem {
  name: string;
  slug: string;
  stateSlug: string;
  stateName: string;
  country: string;
  numbers: string[];
  powerBall?: string;
  jackpot?: string;
  lastDrawDate?: string;
  isCompanionVariant?: boolean;
}

interface SchemeDirectoryCard {
  schemeKey: string;
  label: string;
  summary: string;
  defaultHref: string;
  variantHints: { label: string; badge: string }[];
}

interface NumberMatchItem {
  gameName: string;
  gameSlug: string;
  stateSlug: string;
  stateName: string;
  country: string;
  date: string;
  numbers: string[];
  powerBall?: string;
  jackpot?: string;
  matchedMainCount: number;
  matchedMainNumbers: number[];
  matchedPowerBall: boolean;
}

interface SearchHubClientProps {
  initialQuery: string;
  initialTab: 'scheme' | 'check';
  initialSpotlight: SearchResultItem[];
  initialGames: SearchResultItem[];
  initialSchemes: SchemeDirectoryCard[];
}

export default function SearchHubClient({
  initialQuery,
  initialTab,
  initialSpotlight,
  initialGames,
  initialSchemes,
}: SearchHubClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scheme' | 'check'>(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [spotlight, setSpotlight] = useState<SearchResultItem[]>(initialSpotlight);
  const [games, setGames] = useState<SearchResultItem[]>(initialGames);
  const [schemes, setSchemes] = useState<SchemeDirectoryCard[]>(initialSchemes);
  const [loading, setLoading] = useState(false);

  // Number Checker state
  const [checkNumbersInput, setCheckNumbersInput] = useState('');
  const [checkPbInput, setCheckPbInput] = useState('');
  const [checkSchemeFilter, setCheckSchemeFilter] = useState(initialQuery || 'powerball');
  const [checkResults, setCheckResults] = useState<NumberMatchItem[]>([]);
  const [checkedMeta, setCheckedMeta] = useState<{ checkedGames: number; checkedDraws: number } | null>(null);
  const [checkError, setCheckError] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
    setSpotlight(initialSpotlight);
    setGames(initialGames);
    setSchemes(initialSchemes);
  }, [initialQuery, initialSpotlight, initialGames, initialSchemes]);

  const runSchemeSearch = async (term: string) => {
    setLoading(true);
    try {
      const url = `/api/search?q=${encodeURIComponent(term.trim())}`;
      router.replace(term.trim() ? `/search?q=${encodeURIComponent(term.trim())}` : '/search', { scroll: false });
      const res = await fetch(url);
      const data = await res.json();
      setSpotlight(data.spotlightSchemes || []);
      setGames(data.games || []);
      setSchemes(data.schemes || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSchemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSchemeSearch(query);
  };

  const handleNumberCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError('');
    setCheckLoading(true);
    try {
      const params = new URLSearchParams({
        mode: 'check',
        numbers: checkNumbersInput.trim(),
        pb: checkPbInput.trim(),
        q: checkSchemeFilter.trim(),
      });
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setCheckError(data.error || 'Could not check numbers.');
        setCheckResults([]);
        setCheckedMeta(null);
      } else {
        setCheckResults(data.matches || []);
        setCheckedMeta({ checkedGames: data.checkedGames || 0, checkedDraws: data.checkedDraws || 0 });
      }
    } catch {
      setCheckError('Search service temporarily unavailable.');
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-fit mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('scheme')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === 'scheme'
              ? 'bg-[#0f172a] text-[#f59e0b] shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search size={16} />
          <span>Search Lottery Schemes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('check')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === 'check'
              ? 'bg-[#0f172a] text-[#f59e0b] shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Check My Numbers Across History</span>
        </button>
      </div>

      {/* TAB 1: SCHEME SEARCH (e.g. searching Powerball -> shows Powerball + Powerball Double Play) */}
      {activeTab === 'scheme' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
            <form onSubmit={handleSchemeSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4">
                <Search size={18} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter scheme or state name (e.g. powerball, double play, mega millions, pick 3, lotto max)..."
                  className="w-full py-3.5 text-sm sm:text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#f59e0b] hover:bg-amber-400 text-[#0f172a] font-black px-8 py-3.5 rounded-2xl text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>Search Schemes</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Popular Schemes:</span>
              {['Powerball', 'Powerball Double Play', 'Mega Millions', 'Lotto Max', 'Lotto 649', 'Pick 3', 'Pick 4', 'EuroMillions', 'SA PowerBall', 'Oz Lotto'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    runSchemeSearch(term);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0f172a] hover:text-[#f59e0b] text-slate-700 font-bold transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Distinct Matched Schemes Spotlight (e.g. Powerball & Powerball Double Play side-by-side) */}
          {spotlight.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#f59e0b]" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight">
                  Matching Lottery Schemes &amp; Companion Draws {query ? `for "${query}"` : ''}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spotlight.map((item) => (
                  <div
                    key={`spot-${item.stateSlug}-${item.slug}`}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-[#0f172a]">{item.name}</h3>
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">
                            {item.stateName} ({item.country})
                          </span>
                        </div>
                        {item.isCompanionVariant && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                            Double Play / Plus Draw
                          </span>
                        )}
                      </div>

                      {item.numbers && item.numbers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 my-3">
                          {item.numbers.slice(0, 7).map((n, idx) => (
                            <span
                              key={idx}
                              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-900"
                            >
                              {n}
                            </span>
                          ))}
                          {item.powerBall && (
                            <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                              {item.powerBall}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 font-semibold flex flex-wrap gap-3">
                        {item.lastDrawDate && (
                          <span>
                            Draw: {new Date(item.lastDrawDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {item.jackpot && <span className="text-amber-700 font-black">Jackpot: {item.jackpot}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 text-[11px] font-black uppercase tracking-wider">
                      <Link
                        href={`/results/${item.stateSlug}/${item.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-[#0f172a] text-white hover:bg-slate-800 transition-colors"
                      >
                        Results &amp; Payouts
                      </Link>
                      <Link
                        href={`/results/${item.stateSlug}/${item.slug}/history`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Clock size={12} /> History
                      </Link>
                      <Link
                        href={`/results/${item.stateSlug}/${item.slug}/chart`}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-200 transition-colors inline-flex items-center gap-1"
                      >
                        <BarChart3 size={12} /> Chart
                      </Link>
                      <Link
                        href={`/results/${item.stateSlug}/${item.slug}/lucky-numbers`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Wand2 size={12} /> Lucky
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Matching State & Jurisdiction Entries */}
          {games.length > spotlight.length && (
            <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-[#0f172a]">
                All Participating Jurisdictions ({games.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {games.map((g) => (
                  <Link
                    key={`all-${g.stateSlug}-${g.slug}`}
                    href={`/results/${g.stateSlug}/${g.slug}`}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-900 truncate">
                        {g.stateName} — {g.name}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 truncate">
                        {g.numbers.slice(0, 6).join('-')}
                        {g.powerBall ? ` (${g.powerBall})` : ''}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Scheme Directory Cards */}
          {schemes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
                <Sparkles size={18} className="text-[#f59e0b]" />
                <span>Popular Scheme Guides &amp; Variant Families</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemes.map((s) => (
                  <div key={s.schemeKey} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-black text-[#0f172a]">{s.label}</h3>
                      <Link href={s.defaultHref} className="text-xs font-black text-amber-700 hover:underline shrink-0">
                        Open Hub &rarr;
                      </Link>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.variantHints.map((vh) => (
                        <button
                          key={vh.label}
                          type="button"
                          onClick={() => {
                            const nextQ = vh.label.replace(/\(.*\)/, '').trim();
                            setQuery(nextQ);
                            runSchemeSearch(nextQ);
                          }}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 transition-colors"
                        >
                          {vh.label} • {vh.badge}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB 2: CHECK MY NUMBERS ACROSS PAST HISTORY */}
      {activeTab === 'check' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] mb-2">
              Check Your Lottery Numbers Against 2026 Draw History
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Enter your ticket numbers and choose a scheme (e.g. searching &quot;powerball&quot; checks both Powerball and Powerball Double Play draws automatically).
            </p>

            <form onSubmit={handleNumberCheck} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Your Main Numbers (comma or space separated)
                </label>
                <input
                  type="text"
                  value={checkNumbersInput}
                  onChange={(e) => setCheckNumbersInput(e.target.value)}
                  placeholder="e.g. 23, 43, 57, 58, 68"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Power / Bonus Ball
                </label>
                <input
                  type="text"
                  value={checkPbInput}
                  onChange={(e) => setCheckPbInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Optional (12)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Scheme / Game Filter
                </label>
                <input
                  type="text"
                  value={checkSchemeFilter}
                  onChange={(e) => setCheckSchemeFilter(e.target.value)}
                  placeholder="e.g. powerball"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={checkLoading}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-[#f59e0b] font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {checkLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  <span>Check</span>
                </button>
              </div>
            </form>

            {checkError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {checkError}
              </div>
            )}
          </div>

          {checkedMeta && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500">
                Scanned <strong>{checkedMeta.checkedDraws}</strong> historical draws across{' '}
                <strong>{checkedMeta.checkedGames}</strong> matching games — found{' '}
                <strong>{checkResults.length}</strong> multi-number matches (2+ hits or ball + bonus):
              </div>

              {checkResults.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-sm font-bold text-slate-500">
                  No 2+ number matches found across recent stored draws for those digits.
                </div>
              ) : (
                <div className="space-y-3">
                  {checkResults.map((hit, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-black text-slate-900 text-sm">{hit.stateName} {hit.gameName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            Matched {hit.matchedMainCount}{hit.matchedPowerBall ? ' + Bonus' : ''}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(hit.date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {hit.numbers.map((n, bi) => {
                            const isHit = hit.matchedMainNumbers.includes(parseInt(n, 10));
                            return (
                              <span
                                key={bi}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                                  isHit
                                    ? 'bg-[#f59e0b] text-slate-950 border-amber-500 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {n}
                              </span>
                            );
                          })}
                          {hit.powerBall && (
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                                hit.matchedPowerBall
                                  ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                                  : 'bg-red-600 text-white border-white'
                              }`}
                            >
                              {hit.powerBall}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/results/${hit.stateSlug}/${hit.gameSlug}/history`}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0f172a] hover:text-white text-slate-700 text-xs font-black uppercase tracking-wider shrink-0 text-center transition-colors"
                      >
                        View Archive &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
