import type { Metadata } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Lock, Trophy, Zap } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://allusalottery.com'),
  title: 'All USA Lottery - Live Real-Time Winning Numbers & Results',
  description: 'Fast, accurate, and live lottery results for USA and Canada. Get the latest winning numbers for Powerball, Mega Millions, Lotto America, Cash4Life, and state lotteries immediately after drawing.',
  keywords: [
    'USA Lottery', 'Mega Millions', 'Powerball', 'Winning Numbers', 'State Lottery Results', 
    'Lottery Jackpots', 'Lotto Numbers', 'Lucky Number Generator', 'Canada Lottery', 'Lotto Max',
    'live lottery results', 'pick 3 pick 4 numbers', 'tonight\'s winning numbers', 'allusalottery'
  ],
  openGraph: {
    title: 'All USA Lottery - Real-Time Winning Numbers & Jackpots',
    description: 'The most professional platform for live lottery results in the US & Canada.',
    url: 'https://allusalottery.com',
    siteName: 'All USA Lottery',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'All USA Lottery Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All USA Lottery - Live Results & Jackpots',
    description: 'Get the latest winning numbers for Mega Millions, Powerball, and all state lotteries instantly.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=3' },
      { url: '/icon.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/icon.png?v=3" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
      </head>
      <body suppressHydrationWarning className={`${jakarta.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <Script 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8960486737984002" 
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {/* Header */}
        <header className="glass sticky top-0 z-50 border-b border-slate-200/50">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-[#f59e0b] font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-[#0f172a] leading-none">LOTTO</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#f59e0b] leading-none">GLOBAL</span>
              </div>
            </Link>

            <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-600 uppercase tracking-wide">
              <Link href="/live-results" className="hover:text-red-600 text-red-500 transition-colors relative group flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE RESULTS
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/?country=US#states" className="hover:text-[#0f172a] transition-colors relative group">
                USA
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f59e0b] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/?country=Canada#states" className="hover:text-[#0f172a] transition-colors relative group">
                CANADA
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f59e0b] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/lucky-number-generator" className="hover:text-[#0f172a] transition-colors relative group">
                LUCKY NUMBER
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f59e0b] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/about" className="hover:text-[#0f172a] transition-colors relative group">
                ABOUT
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f59e0b] transition-all group-hover:w-full"></span>
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/#states" className="hidden md:block bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all text-center">
                Check Results
              </Link>
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#0f172a] py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="col-span-2">
                <div className="text-2xl font-black text-white mb-6 tracking-tighter flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#f59e0b] rounded-lg"></div>
                  ALL<span className="text-[#f59e0b]">USA</span>LOTTERY
                </div>
                <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
                  The professional destination for accurate, instant, and reliable lottery results across North America.
                </p>
              </div>
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Navigation</h4>
                <ul className="space-y-4 text-slate-400 text-sm font-bold">
                  <li><Link href="/?country=US#states" className="hover:text-white transition-colors">USA States</Link></li>
                  <li><Link href="/?country=Canada#states" className="hover:text-white transition-colors">Canada Provinces</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Legal</h4>
                <ul className="space-y-4 text-slate-400 text-sm font-bold">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                  <li><Link href="/#jackpots" className="hover:text-white transition-colors">Top Jackpots</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} ALLUSALOTTERY.COM. ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-6">
                <Link href="/contact" className="text-slate-600 hover:text-[#f59e0b] text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Support: mahmahesh1980@gmail.com</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
