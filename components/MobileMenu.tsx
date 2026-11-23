'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent scrolling when menu is open
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="flex md:hidden items-center" suppressHydrationWarning>
      <button 
        onClick={toggleMenu}
        className="text-[#0f172a] p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none relative z-50"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col h-screen overflow-y-auto">
          <nav className="flex flex-col gap-6 text-xl font-black text-[#0f172a] uppercase tracking-wide mt-4">
            <Link href="/live-results" onClick={closeMenu} className="hover:text-red-600 text-red-600 transition-colors border-b border-slate-100 pb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              Live Results
            </Link>
            <Link href="/?country=US#states" onClick={closeMenu} className="hover:text-[#f59e0b] transition-colors border-b border-slate-100 pb-4">
              USA States
            </Link>
            <Link href="/?country=Canada#states" onClick={closeMenu} className="hover:text-[#f59e0b] transition-colors border-b border-slate-100 pb-4">
              Canada Provinces
            </Link>
            <Link href="/lucky-number-generator" onClick={closeMenu} className="hover:text-[#f59e0b] transition-colors border-b border-slate-100 pb-4">
              Lucky Number
            </Link>
            <Link href="/about" onClick={closeMenu} className="hover:text-[#f59e0b] transition-colors border-b border-slate-100 pb-4">
              About
            </Link>

            <Link href="/#states" onClick={closeMenu} className="mt-8 bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-4 rounded-xl text-center font-black shadow-lg shadow-slate-900/20 active:scale-95 transition-all text-sm">
              CHECK LATEST RESULTS
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
