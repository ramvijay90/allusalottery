'use client';

import { useEffect } from 'react';

export default function InFeedAd() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('In-feed AdSense Error:', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-8">
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '336px', height: '280px' }}
        data-ad-client="ca-pub-8960486737984002"
        data-ad-slot="4060189960"
      />
    </div>
  );
}
