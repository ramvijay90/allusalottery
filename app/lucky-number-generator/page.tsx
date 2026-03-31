import React from 'react';
import LuckyGeneratorWrapper from '@/components/LuckyGeneratorWrapper';
import { Target } from 'lucide-react';

import type { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Advanced Lottery Lucky Number Generator - Create Your Own Lottery | All USA Lottery',
  description: 'Generate lucky numbers for Mega Millions, Powerball, and 30+ global lotteries instantly. Create custom combinations, wheels, and predictive box variations.',
  keywords: [
    'lucky number generator', 'lottery number generator', 'random number picker',
    'Mega Millions generator', 'Powerball lucky numbers', 'create your own lottery',
    'lottery algorithms', 'predictive lottery numbers', 'pick 3 generator', 'pick 4 generator',
    'lottery ticket simulator', 'best lottery generator', 'lottery number predictor'
  ],
  openGraph: {
    title: 'Advanced Lottery Lucky Number Generator & Simulator',
    description: 'Generate lucky numbers, create custom lotteries, and test advanced combinations instantly.',
    url: 'https://allusalottery.com/lucky-number-generator',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucky Number Generator - Mega Millions & Powerball',
    description: 'Generate predictive lottery numbers for 30+ games instantly.',
    images: ['/og-image.png'],
  }
};

export default function LuckyNumberGeneratorPage() {
  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0f172a] pt-16 pb-48 overflow-hidden border-b border-white/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f59e0b]/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-0 tracking-tighter leading-tight max-w-4xl">
            Lucky Number <span className="text-[#f59e0b]">Generator</span>
          </h1>
        </div>
      </section>

      {/* Generator Core Component */}
      <div className="container mx-auto px-4">
        <LuckyGeneratorWrapper />
      </div>
    </div>
  );
}
