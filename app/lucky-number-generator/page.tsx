import React from 'react';
import LuckyGeneratorWrapper from '@/components/LuckyGeneratorWrapper';
import { Target } from 'lucide-react';

import type { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Lucky Number Generator 2026 - Powerball, Mega Millions & Pick 3',
  description: 'Generate winning lucky numbers for Powerball, Mega Millions, Pick 3, Pick 4, and 30+ state lotteries. Free predictive lottery numbers, box sets, and quick picks.',
  alternates: {
    canonical: 'https://allusalottery.com/lucky-number-generator',
  },
  keywords: [
    'lucky number generator 2026',
    'lottery number generator',
    'random number picker',
    'Mega Millions lucky numbers',
    'Powerball generator',
    'Pick 3 generator',
    'Pick 4 combinations',
    'predictive lottery numbers'
  ],
  openGraph: {
    title: 'Lucky Number Generator 2026 - Powerball & Mega Millions',
    description: 'Generate winning lottery combinations and custom box variations instantly.',
    url: 'https://allusalottery.com/lucky-number-generator',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
    siteName: 'All USA Lottery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucky Number Generator 2026 - Powerball & Mega Millions',
    description: 'Generate winning lottery numbers for 30+ games.',
    images: ['/og-image.png'],
  }
};

export default function LuckyNumberGeneratorPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://allusalottery.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Lucky Number Generator',
        'item': 'https://allusalottery.com/lucky-number-generator'
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How does the lucky number generator choose numbers?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The lucky number generator utilizes cryptographically secure mathematical randomization algorithms tailored to the exact ball and bonus ball ranges of official US and global lotteries.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Which lottery games are supported?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Over 30 lotteries are supported including Powerball, Mega Millions, Lotto America, Cash4Life, Lotto Max, Pick 2, Pick 3, Pick 4, Pick 5, Keno, EuroMillions, and custom digit combinations.'
        }
      }
    ]
  };

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero Section */}
      <section className="relative bg-[#0f172a] pt-16 pb-48 overflow-hidden border-b border-white/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f59e0b]/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-0 tracking-tighter leading-tight max-w-4xl">
            Lucky Number Generator 2026 - <span className="text-[#f59e0b]">Powerball & Mega Millions</span>
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
