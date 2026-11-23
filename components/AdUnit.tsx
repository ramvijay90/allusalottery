'use client';

import { useEffect, useRef, useState } from 'react';
import { isBlocked, setupAICPListener } from '@/lib/aicp';

interface AdUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'autorelaxed';
  layoutKey?: string;
  className?: string;
}

export default function AdUnit({
  slotId,
  format = 'auto',
  layoutKey,
  className = '',
}: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const isPushedRef = useRef(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(isBlocked());
    const cleanup = setupAICPListener();

    const handleStorageChange = () => {
      setBlocked(isBlocked());
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      cleanup();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (blocked || isPushedRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const pushAd = () => {
      if (isPushedRef.current) return;
      try {
        if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isPushedRef.current = true;
        }
      } catch (err) {
        console.error('AdSense Error:', err);
      }
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            pushAd();
            observer.disconnect();
          }
        },
        { rootMargin: '300px' }
      );

      observer.observe(container);
      return () => observer.disconnect();
    } else {
      pushAd();
    }

    // MutationObserver to hide unfilled ads without collapsing layout height
    let mutationObserver: MutationObserver | null = null;
    if (adRef.current && 'MutationObserver' in window) {
      mutationObserver = new MutationObserver(() => {
        if (adRef.current?.getAttribute('data-ad-status') === 'unfilled') {
          if (containerRef.current) {
            containerRef.current.style.visibility = 'hidden';
          }
        }
      });
      mutationObserver.observe(adRef.current, {
        attributes: true,
        attributeFilter: ['data-ad-status'],
      });
    }

    return () => {
      mutationObserver?.disconnect();
    };
  }, [blocked]);

  if (blocked) {
    return null;
  }

  const minHeightClass =
    format === 'autorelaxed'
      ? 'min-h-[280px]'
      : format === 'fluid'
      ? 'min-h-[140px]'
      : 'min-h-[250px]';

  return (
    <div
      ref={containerRef}
      className={`ad-container my-6 w-full text-center overflow-hidden flex flex-col items-center justify-center rounded-2xl bg-slate-50/50 border border-slate-100/60 p-2 ${minHeightClass} ${className}`}
      style={{ contain: 'layout paint' }}
    >
      <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-semibold">
        Advertisement
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle w-full"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-8960486737984002"
        data-ad-slot={slotId}
        data-ad-format={format === 'rectangle' ? undefined : format}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive="true"
      />
    </div>
  );
}
