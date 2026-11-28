import React from 'react';
import LuckyGeneratorWrapper from '@/components/LuckyGeneratorWrapper';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import InFeedAd from '@/components/ads/InFeedAd';
import MultiplexAd from '@/components/ads/MultiplexAd';
import SidebarAd from '@/components/ads/SidebarAd';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/lotteryCategories';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lucky Number Generator 2026 | Lottery Number Generator & Quick Pick',
  description: 'Free Lucky Number Generator & Lottery Number Picker 2026. Pick your lucky lottery numbers for Powerball, Mega Millions, Lotto Max, 6/49, EuroMillions, UK 49s, Pick 3/4, Numerology, Horoscope & Scrambler.',
  keywords: [
    'lucky number generator',
    'lottery number generator',
    'lottery generator',
    'lotto number generator',
    'lottery number picker',
    'pick my lottery numbers',
    'lucky lottery numbers',
    'lucky number generator 2026',
    'truly random lucky number picker',
    'numerology lucky numbers',
    'horoscopic lucky numbers',
    'lottery number scrambler',
    'number combination generator',
    'powerball lucky numbers', 'mega millions lucky numbers', 'pick 3 generator', 'pick 4 generator',
    'lotto max generator', 'lotto 649 OLG WCLC lucky numbers', '6 lucky numbers from 1 to 49',
    '5 lucky numbers from 1 to 90', 'uk 49s lucky numbers', 'euromillions generator',
    'oz powerball tattslotto generator', 'sa powerball daily lotto nigeria lucky numbers',
  ],
  alternates: {
    canonical: 'https://allusalottery.com/lucky-number-generator',
  },
  openGraph: {
    title: 'Lucky Number Generator 2026 | Lottery Number Generator & Quick Pick',
    description: 'Free Lucky Number Generator, Combinator, Scrambler, Numerology & Horoscope picker for Powerball, Mega Millions, Lotto 6/49, EuroMillions & 45+ world lotteries.',
    url: 'https://allusalottery.com/lucky-number-generator',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Lucky Number Generator 2026' }],
    type: 'website',
    siteName: 'All USA Lottery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucky Number Generator 2026 | Lottery Number Picker & Quick Pick',
    description: 'Free Lucky Number Generator for Powerball, Mega Millions, Lotto Max, EuroMillions, UK 49s & 45+ world lotteries.',
    images: ['/opengraph-image'],
  }
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Lucky Number Generator & Lottery Number Picker",
  "url": "https://allusalottery.com/lucky-number-generator",
  "description": "Free Lottery Number Generator & Quick Pick tool with Truly Lucky Touch, Numerology, Horoscopic, Scrambler, and Combinator modes for 45+ world lotteries.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://allusalottery.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Lucky Number Generator",
      "item": "https://allusalottery.com/lucky-number-generator"
    }
  ]
};

export default function LuckyNumberGeneratorMainPage() {
  const regions = [
    { title: 'USA Lotteries (Powerball, Mega Millions & 2by2)', filter: 'USA' },
    { title: 'Canada Lotteries (Lotto Max, 6/49 & Daily Grand)', filter: 'Canada' },
    { title: 'UK & Europe Lotteries (EuroMillions, UK 49s & Irish Lotto)', filter: 'Europe' },
    { title: 'Australia Lotteries (Oz Powerball, Oz Lotto & Tatts)', filter: 'Australia' },
    { title: 'New Zealand & Africa (NZ Powerball, SA & Nigeria)', filter: 'NZ_ZA' },
    { title: 'Lucky Modes & Popular Number Formats (6/49, 5/90)', filter: 'Global' },
    { title: 'Digit Box, Straight & Kerala Tools', filter: 'Digit' },
  ];

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      <script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0f172a] pt-12 pb-14 overflow-hidden border-b border-white/10 text-white text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f59e0b]/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#f59e0b] font-bold text-xs uppercase tracking-wider mb-4">
            Official 2026 Statistical Prediction Algorithm
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight max-w-4xl">
            Lucky Number Generator &amp; <span className="text-[#f59e0b]">Lottery Number Picker</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            Pick your lucky lottery numbers with Quick Pick, Truly Lucky Touch, Numerology, Horoscopic Zodiac, Scrambler &amp; Combinator across USA, Canada, UK, Europe, Australia, NZ &amp; Africa.
          </p>
        </div>
      </section>

      {/* 3-Column Layout with Wide Docked Sticky Sidebars & Spacious Interactive Generator */}
      <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-6 xl:gap-8 px-4 sm:px-6 xl:px-8 py-8 w-full max-w-[1760px] mx-auto">
        {/* Left Sticky Sidebar - Docked to Outer Left */}
        <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
            <SidebarAd />
          </div>
        </aside>

        {/* Center Main Content - Ultra Spacious Container */}
        <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto space-y-8">
          {/* Before Content Ad (Top Manual Unit for Maximum Viewability & Impressions) */}
          <BeforeContentAd />

          {/* Interactive Tool Component */}
          <LuckyGeneratorWrapper />

          {/* In-Feed Ad between Tool and Directory */}
          <InFeedAd />

          {/* Dedicated Category Hub Directory (1 Keyword = 1 Dedicated URL Route) */}
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight mb-2">
                Explore Dedicated Lottery Number Generators
              </h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                Choose your game below for dedicated drawing rules, ball ranges, statistical algorithms, and probability rules.
              </p>
            </div>

            {regions.map((reg, idx) => {
              const catList = CATEGORIES.filter(c => {
                if (reg.filter === 'Digit') return c.region === 'Kerala' || c.toolGroup === 'digit';
                if (reg.filter === 'Global') return c.region === 'Global' && c.toolGroup !== 'digit';
                if (reg.filter === 'NZ_ZA') return c.region === 'New Zealand' || c.region === 'Africa';
                return c.region === reg.filter && c.toolGroup !== 'digit';
              });
              if (catList.length === 0) return null;

              return (
                <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-wide mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span>🎯</span> {reg.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {catList.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/lucky-number-generator/${cat.id}`}
                        className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{cat.flag}</span>
                          <div>
                            <div className="text-sm font-bold text-slate-800 group-hover:text-amber-900 transition-colors">
                              {cat.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {cat.country}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-300 group-hover:text-amber-600 transition-colors">
                          &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Multiplex Bottom Ad */}
          <div className="my-8">
            <MultiplexAd />
          </div>
        </main>

        {/* Right Sticky Sidebar */}
        <aside className="hidden xl:block w-72 shrink-0 sticky top-24 self-start space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Sponsored</h3>
            <SidebarAd />
          </div>
        </aside>
      </div>
    </div>
  );
}
