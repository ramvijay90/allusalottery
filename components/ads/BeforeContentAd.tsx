'use client';

import { useEffect } from 'react';

export default function BeforeContentAd() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('BeforeContent AdSense Error:', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-6">
      <ins
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
