import Link from 'next/link';
import { Calendar, Clock, Download, Flame, HelpCircle, ShieldCheck, Sparkles, TrendingUp, Trophy, Zap } from 'lucide-react';

export default function HomeSeoContent() {
  const schedule = [
    { day: 'Monday', games: ['Powerball (US$)', 'Lotto America', 'Cash4Life'], time: '10:59 PM EST', prize: '$20M - $1B+' },
    { day: 'Tuesday', games: ['Mega Millions (US$)', 'Lotto Max (CA$)', 'Lucky for Life'], time: '11:00 PM EST', prize: '$20M - $1B+' },
    { day: 'Wednesday', games: ['Powerball (US$)', 'Canada Lotto 6/49', 'Classic Lotto'], time: '10:59 PM EST', prize: '$20M - $1B+' },
    { day: 'Thursday', games: ['Daily Grand (CA$)', 'Cash4Life', 'Lucky for Life'], time: '10:30 PM EST', prize: '$1,000/Day for Life' },
    { day: 'Friday', games: ['Mega Millions (US$)', 'Lotto Max (CA$)', 'Cash4Life'], time: '11:00 PM EST', prize: '$20M - $1B+' },
    { day: 'Saturday', games: ['Powerball (US$)', 'Canada Lotto 6/49', 'Lotto America'], time: '10:59 PM EST', prize: '$20M - $1B+' },
    { day: 'Sunday', games: ['Cash4Life', 'Lucky for Life', 'Daily State Games'], time: '9:00 PM EST', prize: 'Daily Top Prizes' },
  ];

  const popularCharts = [
    { name: 'Powerball Chart 2026', href: '/results/ca/powerball', flag: '🇺🇸', sub: 'USA Multi-State' },
    { name: 'Mega Millions Chart', href: '/results/ca/mega-millions', flag: '🇺🇸', sub: 'USA Multi-State' },
    { name: 'Canada Lotto Max Chart', href: '/results/on/lotto-max', flag: '🇨🇦', sub: 'National Canada' },
    { name: 'AU Powerball Chart', href: '/results/au-nsw/powerball-australia', flag: '🇦🇺', sub: 'Australia' },
    { name: 'UK Lotto Chart', href: '/results/uk/uk-lotto', flag: '🇬🇧', sub: 'United Kingdom' },
    { name: 'EuroMillions Chart', href: '/results/eu/euromillions', flag: '🇪🇺', sub: 'Pan-Europe' },
    { name: 'NZ Powerball Chart', href: '/results/nz/nz-powerball', flag: '🇳🇿', sub: 'New Zealand' },
    { name: 'SA PowerBall Chart', href: '/results/za/sa-powerball', flag: '🇿🇦', sub: 'South Africa' },
  ];

  const topStates = [
    { name: 'California Results', href: '/results/ca', code: 'CA' },
    { name: 'Texas Results', href: '/results/tx', code: 'TX' },
    { name: 'Florida Results', href: '/results/fl', code: 'FL' },
    { name: 'New York Results', href: '/results/ny', code: 'NY' },
    { name: 'Ontario Results', href: '/results/on', code: 'ON' },
    { name: 'New South Wales', href: '/results/au-nsw', code: 'NSW' },
    { name: 'United Kingdom', href: '/results/uk', code: 'UK' },
    { name: 'New Zealand', href: '/results/nz', code: 'NZ' },
    { name: 'Auckland Hub', href: '/results/nz-akl', code: 'AKL' },
    { name: 'South Africa', href: '/results/za', code: 'ZA' },
    { name: 'Gauteng Hub', href: '/results/za-gp', code: 'GP' },
    { name: 'Western Cape', href: '/results/za-wc', code: 'WC' },
  ];

  return (
    <section className="container mx-auto px-4 py-16 my-16 bg-white rounded-3xl shadow-xl border-2 border-slate-200">
      <div className="max-w-5xl mx-auto space-y-12 text-slate-800">
        
        {/* Main Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-800 text-xs font-black uppercase tracking-widest mb-3 border border-amber-400/30">
            <Sparkles size={14} className="text-amber-600" />
            <span>Official North American Lottery Hub</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f172a] tracking-tight">
            Official USA &amp; Canada Lottery Results &amp; Live Chart Updates
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed font-medium">
            Welcome to the most trusted portal for checking verified <strong>USA lottery results</strong> and <strong>Canada lottery results</strong>. We provide instant real-time updates for live today drawings, comprehensive 365-day archives, and official <strong>2026 lottery charts</strong>.
          </p>
        </div>

        {/* 2-Column Core Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black mb-4 shadow-md shadow-amber-500/20">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-black text-[#0f172a] mb-3">
                USA &amp; Canada Lottery Live Today
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Don&apos;t miss a single winning number. Our platform updates <strong>lottery results live today</strong> precisely when official drawings take place across all 50 states and Canadian provinces. We deliver the fastest, verified winning numbers directly to your screen for <strong>Powerball</strong>, <strong>Mega Millions</strong>, <strong>Lotto Max</strong>, and <strong>Canada Lotto 6/49</strong>.
              </p>
            </div>
            <Link
              href="/live-results"
              className="inline-flex items-center gap-2 text-xs font-black text-amber-700 hover:text-amber-800 uppercase tracking-wider group"
            >
              <span>Explore Live Drawing Feeds</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-[#f59e0b] flex items-center justify-center font-black mb-4 shadow-md shadow-slate-900/20">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-black text-[#0f172a] mb-3">
                Comprehensive 2026 Lottery Charts
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                For serious players and analytical enthusiasts who study drawing patterns, our <strong>2026 lottery charts</strong> are an indispensable tool. We maintain an exhaustive drawing archive spanning the full year. Whether you need the <strong>Monthly Chart</strong>, <strong>Weekly Day-Wise breakdown</strong>, or <strong>Overdue Pending Numbers</strong>, our charts update daily to keep you informed.
              </p>
            </div>
            <Link
              href="/results/ca/powerball"
              className="inline-flex items-center gap-2 text-xs font-black text-slate-900 hover:text-amber-600 uppercase tracking-wider group"
            >
              <span>View Official Powerball Chart</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Why Check Results Here */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-8 sm:p-10 rounded-3xl shadow-xl">
          <div className="max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 flex items-center gap-3">
              <ShieldCheck className="text-[#f59e0b]" size={32} />
              <span>Why Check All USA Lottery Results Here?</span>
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              While many websites display outdated or unverified numbers, <strong>All USA Lottery</strong> ensures 100% data integrity verified directly against state lottery commissions and Canadian provincial corporations. Here is what we offer:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Zap size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black">Instant Live Updates</strong>
                  <span className="text-slate-300">Track official evening and midday drawings as they occur live in real-time.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <TrendingUp size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black">Advanced Statistical Charts</strong>
                  <span className="text-slate-300">Explore interactive Monthly, Weekly Day-of-the-Week, and Yearly drawing charts.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <HelpCircle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black">Pending Numbers Tracker</strong>
                  <span className="text-slate-300">Discover which balls are overdue and have not appeared for the longest period.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Download size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black">High-Resolution Chart Downloads</strong>
                  <span className="text-slate-300">Save and share printable 1200x630 official verified chart cards on any device.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Weekly Drawing Schedule Table */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
                Official North American Lottery Weekly Schedule
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Multi-state and national lottery drawings occur seven days a week across the US and Canada.
              </p>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full self-start sm:self-auto">
              2026 Verified Schedule
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-[#0f172a] text-white">
                <tr>
                  <th className="py-3.5 px-4 font-black uppercase tracking-wider">Day</th>
                  <th className="py-3.5 px-4 font-black uppercase tracking-wider">Featured National Lotteries</th>
                  <th className="py-3.5 px-4 font-black uppercase tracking-wider">Official Draw Time</th>
                  <th className="py-3.5 px-4 font-black uppercase tracking-wider text-right">Top Prize / Jackpot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schedule.map((row, idx) => (
                  <tr key={row.day} className={`hover:bg-amber-50/50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                    <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-2">
                      <Clock size={14} className="text-[#f59e0b]" />
                      <span>{row.day}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {row.games.join(' • ')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {row.time}
                    </td>
                    <td className="py-3 px-4 font-black text-amber-800 text-right">
                      {row.prize}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Free Chart Download & Social Sharing */}
        <div className="bg-amber-50 border-2 border-amber-200 p-6 sm:p-8 rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Download size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-2">
                Lottery Chart Downloads &amp; Instant Mobile Sharing
              </h3>
              <p className="text-amber-900 text-xs sm:text-sm leading-relaxed mb-4">
                Many users prefer having offline charts for in-depth statistical analysis. Every lottery result page on our website includes a high-definition <strong>1200x630 visual chart card</strong> ready for 1-click download. You can also share the latest winning numbers directly to <strong>WhatsApp</strong>, <strong>Telegram</strong>, <strong>Facebook</strong>, and <strong>X (Twitter)</strong> using our universal share drawer.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-black">
                <Link
                  href="/results/ca/powerball"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all"
                >
                  Download Powerball Chart →
                </Link>
                <Link
                  href="/results/on/lotto-max"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-amber-300 transition-all"
                >
                  Download Lotto Max Chart →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Lottery Pattern Analysis & Lucky Number Generator */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-black text-[#0f172a] mb-3 flex items-center gap-2">
            <Flame className="text-amber-500" size={24} />
            <span>Lottery Pattern Analytics &amp; Lucky Combinations</span>
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
            While every drawing is completely random, millions of players follow mathematical frequency distribution and overdue cycles. Our platform provides the analytical tools to explore these metrics responsibly:
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-black text-slate-900 mb-1.5">Overdue Pending Balls</h4>
              <p className="text-slate-600">Track balls that have remained absent for the longest duration to identify cycles.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-black text-slate-900 mb-1.5">Hot &amp; Cold Frequencies</h4>
              <p className="text-slate-600">Compare statistical appearance frequencies across 50+ draws to spot high-frequency numbers.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-black text-slate-900 mb-1.5">Lucky Number Generator</h4>
              <p className="text-slate-600">Generate mathematically balanced quick-picks for any 3-digit, 4-digit, or jackpot game.</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">Need a balanced set of numbers for tonight&apos;s draw?</span>
            <Link
              href="/lucky-number-generator"
              className="px-4 py-2 rounded-xl bg-[#0f172a] text-white hover:bg-slate-800 text-xs font-black uppercase tracking-wider transition-all"
            >
              Generate Lucky Numbers →
            </Link>
          </div>
        </div>

        {/* Bottom Navigation Links Hub (Deep Links to Popular Charts & State Results) */}
        <div className="pt-8 border-t-2 border-slate-200">
          <h3 className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight mb-4">
            Popular Lottery Charts &amp; State Results Directory
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">
            Quickly navigate to verified winning charts and state result archives across our network:
          </p>

          {/* National Charts Pills */}
          <div className="mb-6">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Top National &amp; Multi-State Charts:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {popularCharts.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 hover:border-amber-600 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{item.flag}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-bold uppercase">{item.sub}</span>
                  </div>
                  <div className="font-black text-xs text-slate-900 group-hover:text-slate-950 mt-2">
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top States Quick Directory */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Popular State &amp; Province Lotteries:
            </div>
            <div className="flex flex-wrap gap-2">
              {topStates.map((st) => (
                <Link
                  key={st.href}
                  href={st.href}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white text-xs font-bold transition-all border border-slate-200"
                >
                  {st.name} ({st.code})
                </Link>
              ))}
              <Link
                href="/live-results"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                🔴 All Live Feeds →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
