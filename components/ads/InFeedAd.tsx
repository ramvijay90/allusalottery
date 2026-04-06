'use client';

import { useEffect, useRef } from 'react';

export default function InFeedAd() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('In-feed AdSense Error:', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-8">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8960486737984002"
        data-ad-slot="4060189960"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
