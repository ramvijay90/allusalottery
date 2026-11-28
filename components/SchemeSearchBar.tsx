'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

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

const QUICK_SCHEME_CHIPS = [
  { label: 'Powerball', q: 'powerball' },
  { label: 'Double Play', q: 'double play' },
  { label: 'Mega Millions', q: 'mega millions' },
  { label: 'Pick 3', q: 'pick 3' },
  { label: 'Lotto Max', q: 'lotto max' },
  { label: 'EuroMillions', q: 'euromillions' },
  { label: 'SA PowerBall', q: 'sa powerball' },
];

export default function SchemeSearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        const combined = [...(data.spotlightSchemes || []), ...(data.games || [])];
        const unique = new Map<string, SearchResultItem>();
        for (const item of combined) {
          const k = `${item.stateSlug}:${item.slug}`;
          if (!unique.has(k)) unique.set(k, item);
          if (unique.size >= 8) break;
        }
        setResults(Array.from(unique.values()));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    setOpen(false);
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative z-30">
      <form onSubmit={handleSubmit} className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20">
        <div className="pl-3 pr-2 text-slate-400">
          {loading ? <Loader2 size={20} className="animate-spin text-amber-500" /> : <Search size={20} />}
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => results.length > 0 && setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lottery scheme or state (e.g. Powerball, Double Play, Pick 3, Lotto Max)..."
          aria-label="Search lottery scheme or state"
          className="flex-1 py-3 px-2 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none min-w-0"
        />
        <button
          type="submit"
          className="bg-[#f59e0b] hover:bg-amber-400 text-[#0f172a] font-black text-xs sm:text-sm px-4 sm:px-6 py-3 rounded-xl transition-all shrink-0 uppercase tracking-wider cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Quick-Search Scheme Chips */}
      <div className="flex flex-wrap justify-center items-center gap-1.5 mt-3 text-xs">
        <span className="text-slate-400 font-bold mr-1">Try:</span>
        {QUICK_SCHEME_CHIPS.map((chip) => (
          <Link
            key={chip.q}
            href={`/search?q=${encodeURIComponent(chip.q)}`}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#f59e0b] text-slate-200 hover:text-[#0f172a] font-bold transition-colors border border-white/10"
          >
            {chip.label}
          </Link>
        ))}
        <Link
          href="/search?tab=check"
          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-black transition-colors border border-emerald-400/30 inline-flex items-center gap-1"
        >
          <CheckCircle2 size={12} /> Check My Numbers
        </Link>
      </div>

      {/* Live Dropdown Results Showing Main Scheme + Companion Variants (e.g. Powerball & Powerball Double Play) */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left z-50">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Matching Lottery Schemes &amp; Variants
            </span>
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
              className="text-amber-700 hover:underline inline-flex items-center gap-1"
            >
              View All Results <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
            {results.map((item) => (
              <Link
                key={`${item.stateSlug}-${item.slug}`}
                href={`/results/${item.stateSlug}/${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 hover:bg-amber-50/70 transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{item.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.stateName}
                    </span>
                    {item.isCompanionVariant && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Companion / Double Play
                      </span>
                    )}
                  </div>
                  {item.numbers && item.numbers.length > 0 && (
                    <div className="text-xs font-bold text-slate-500 mt-0.5">
                      Latest: {item.numbers.slice(0, 7).join(' - ')}
                      {item.powerBall ? ` (${item.powerBall})` : ''}
                      {item.jackpot ? ` • ${item.jackpot}` : ''}
                    </div>
                  )}
                </div>
                <ArrowRight size={16} className="text-slate-300 shrink-0 hidden sm:block" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
