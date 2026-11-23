'use client';

import dynamic from 'next/dynamic';

const LuckyGenerator = dynamic(() => import('./LuckyGenerator'), { 
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8 w-full mx-auto relative z-20 flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-slate-100 font-black text-4xl">LOTTO</div>
    </div>
  )
});

interface LuckyGeneratorWrapperProps {
  initialCategoryId?: string;
}

export default function LuckyGeneratorWrapper({ initialCategoryId }: LuckyGeneratorWrapperProps) {
  return <LuckyGenerator initialCategoryId={initialCategoryId} />;
}
