'use client';

import { useEffect } from 'react';

export default function MultiplexAd() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense Error:', err);
    }
  }, []);

  return (
    <div className="my-10 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="autorelaxed"
        data-ad-client="ca-pub-8960486737984002"
        data-ad-slot="4307601978"
      />
    </div>
  );
}
