'use client';

import { useEffect, useRef, useState } from 'react';
import { isBlocked, setupAICPListener } from '@/lib/aicp';

export default function BeforeContentAd() {
  const adRef = useRef<HTMLModElement>(null);
  const adPushed = useRef(false);
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
    if (blocked || adPushed.current) return;
    try {
      if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      }
    } catch (err) {
      console.error('BeforeContent AdSense Error:', err);
    }
  }, [blocked]);

  if (blocked) {
    return null;
  }

  return (
    <div className="w-full flex justify-center my-6">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8960486737984002"
        data-ad-slot="9480376912"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
