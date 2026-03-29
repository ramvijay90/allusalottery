'use client';

import { useEffect } from 'react';

export default function AfterContentAd() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AfterContent AdSense Error:', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-6">
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '336px', height: '280px' }}
        data-ad-client="ca-pub-8960486737984002"
        data-ad-slot="5157988520"
      />
    </div>
  );
}
