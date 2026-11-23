import React from 'react';
import LuckyGeneratorWrapper from '@/components/LuckyGeneratorWrapper';
import BeforeContentAd from '@/components/ads/BeforeContentAd';
import InFeedAd from '@/components/ads/InFeedAd';
import MultiplexAd from '@/components/ads/MultiplexAd';
import SidebarAd from '@/components/ads/SidebarAd';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getCategoryById } from '@/lib/lotteryCategories';
import type { Metadata } from 'next';

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: cat.id,
  }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryById(slug);

  if (!category) {
    return { title: 'Page Not Found' };
  }

  const url = `https://allusalottery.com/lucky-number-generator/${category.id}`;

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    keywords: category.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
      siteName: 'All USA Lottery',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.seoTitle,
      description: category.seoDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function DedicatedLuckyGeneratorPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = getCategoryById(slug);

  if (!category) {
    notFound();
  }

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `https://allusalottery.com/lucky-number-generator/${category.id}`
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": category.faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `${category.name} Lucky Number Generator`,
    "operatingSystem": "All",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {/* Schemas */}
      <script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {category.faqs && category.faqs.length > 0 && (
        <script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        id="software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0f172a] pt-12 pb-14 overflow-hidden border-b border-white/10 text-white text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f59e0b]/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#f59e0b] font-bold text-xs uppercase tracking-wider mb-4">
            <span>{category.flag}</span>
            <span>{category.country} • {category.region} Lottery Tool</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight max-w-4xl">
            {category.h1Title}
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            {category.seoDescription}
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

          {/* Interactive Tool Component with Pre-selected Category */}
          <LuckyGeneratorWrapper initialCategoryId={category.id} />

          {/* In-Feed Ad between Tool and Content */}
          <InFeedAd />

          {/* SEO Content & Frequently Asked Questions */}
          <div className="space-y-8">
            {/* Game Rules & Overview */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-[#0f172a] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span>ℹ️</span> About {category.name} Generator & Probability
              </h2>
              <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                <p>
                  The <strong>{category.name} Lucky Number Generator</strong> is programmed to simulate the exact official lottery drawing mechanisms used in {category.country}. 
                  Whether you are preparing your ticket for the next live draw or testing historical wheeling systems, this tool produces mathematically unbiased number distributions.
                </p>
                {category.mainBalls && (
                  <p>
                    <strong>Drawing Matrix:</strong> Selects {category.mainBalls} main numbers ranging from {category.mainRange?.[0]} to {category.mainRange?.[1]}
                    {category.specialBalls ? ` along with ${category.specialBalls} ${category.specialName || 'Special Ball'} from ${category.specialRange?.[0]} to ${category.specialRange?.[1]}` : ''}.
                  </p>
                )}
              </div>
            </div>

            {/* FAQs */}
            {category.faqs && category.faqs.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span>❓</span> Frequently Asked Questions ({category.name})
                </h2>
                <div className="space-y-6">
                  {category.faqs.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-base flex items-start gap-2">
                        <span className="text-[#f59e0b] font-black">Q.</span> {faq.question}
                      </h3>
                      <p className="text-sm text-gray-600 pl-6 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Game Links */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-slate-100">
                More Popular Lottery Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.id !== category.id).map((other) => (
                  <Link
                    key={other.id}
                    href={`/lucky-number-generator/${other.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#0f172a] transition-all flex items-center gap-1.5"
                  >
                    <span>{other.flag}</span>
                    <span>{other.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Multiplex Bottom Ad */}
            <div className="my-8">
              <MultiplexAd />
            </div>
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
