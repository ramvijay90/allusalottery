'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Sparkles, Trophy, Calendar, Zap, LayoutGrid } from 'lucide-react';

interface LotteryChartNavigationProps {
  stateSlug?: string;
  gameSlug?: string;
  country?: string;
}

export default function LotteryChartNavigation({ stateSlug, gameSlug }: LotteryChartNavigationProps) {
  const pathname = usePathname();

  // Top National & Multi-State Charts (Verified working database routes)
  const nationalCharts = [
    { name: 'Powerball Chart', href: '/results/ca/powerball', flag: '🇺🇸' },
    { name: 'Mega Millions Chart', href: '/results/ca/mega-millions', flag: '🇺🇸' },
    { name: 'Lotto Max Chart', href: '/results/on/lotto-max', flag: '🇨🇦' },
    { name: 'AU Powerball Chart', href: '/results/au-nsw/powerball-australia', flag: '🇦🇺' },
    { name: 'UK Lotto Chart', href: '/results/uk/uk-lotto', flag: '🇬🇧' },
    { name: 'NZ Powerball Chart', href: '/results/nz/nz-powerball', flag: '🇳🇿' },
    { name: 'SA PowerBall Chart', href: '/results/za/sa-powerball', flag: '🇿🇦' },
    { name: 'Nigeria Mega Jackpot', href: '/results/ng/ng-mega-jackpot', flag: '🇳🇬' },
  ];

  // Top Popular States & Regions
  const popularStates = [
    { name: 'California', href: '/results/ca' },
    { name: 'Texas', href: '/results/tx' },
    { name: 'New York', href: '/results/ny' },
    { name: 'New Zealand', href: '/results/nz' },
    { name: 'South Africa', href: '/results/za' },
    { name: 'Nigeria', href: '/results/ng' },
    { name: 'Live Feeds', href: '/live-results' },
  ];

  return (
    <nav aria-label="Lottery Chart Navigation" className="mb-8 space-y-3" suppressHydrationWarning>
      {/* Primary Chart Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {nationalCharts.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#f59e0b] text-[#0f172a] shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0f172a] border border-slate-200 shadow-sm'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Secondary Regional Quick Nav */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {popularStates.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`px-3 py-1 rounded-full transition-colors font-bold ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-900'
              }`}
            >
              {item.name} →
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
