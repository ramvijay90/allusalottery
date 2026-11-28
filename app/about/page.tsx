import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Shield, BookOpen, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About All USA Lottery | Verified Results & 2026 Charts',
  description: 'Learn how AllUSALottery.com verifies real-time winning numbers, 2026 visual charts, and historical draw archives across USA, Canada, Australia, UK, Europe, NZ & Africa.',
  alternates: { canonical: 'https://allusalottery.com/about' },
  openGraph: {
    title: 'About All USA Lottery | Verified Results & 2026 Charts',
    description: 'Verified real-time lottery results, 2026 charts, and draw archives across 7 global regions.',
    url: 'https://allusalottery.com/about',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    type: 'website',
    siteName: 'All USA Lottery',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full mb-6">
          <Users size={16} className="text-[#f59e0b]" />
          <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Our Mission</span>
        </div>
        <h1 className="text-5xl font-black text-[#0f172a] tracking-tighter mb-6">
          About <span className="text-[#f59e0b]">AllUSALottery.com</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The most trusted, accurate, and real-time destination for lottery players across the United States and Canada.
        </p>
      </div>

      <div className="grid gap-12">
        <section className="premium-card p-10 bg-[#0f172a] text-white">
          <h2 className="text-3xl font-black mb-6 tracking-tight flex items-center gap-3">
             <div className="w-1.5 h-8 bg-[#f59e0b] rounded-full"></div>
             Who We Are
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            AllUSALottery.com was founded with a single goal: to provide lottery enthusiasts with the fastest and most reliable results available online. We believe that clarity and speed are paramount when it comes to winning numbers.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                <Shield className="text-[#f59e0b]" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-wider mb-2">Verified Data</h3>
                <p className="text-slate-500 text-sm">Every number is cross-referenced with official state lottery commissions.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                <BookOpen className="text-[#f59e0b]" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-wider mb-2">Full Transparency</h3>
                <p className="text-slate-500 text-sm">We provide historical data and drawing analysis for every game we track.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-slate-100">
          <h2 className="text-3xl font-black text-[#0f172a] mb-8 tracking-tight">Our Values</h2>
          <div className="space-y-6">
            <p className="text-slate-600 leading-relaxed">
              At **AllUSALottery.com**, we prioritize the player experience. Whether you are checking a Powerball jackpot or looking for local state results, our platform is designed to be accessible, lightning-fast, and beautiful on every device.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
