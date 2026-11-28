'use client';

import dynamic from 'next/dynamic';
import type { LotteryCategory } from '@/lib/lotteryCategories';
import type { GamePageGeneratorContext } from './LuckyGenerator';

const LuckyGenerator = dynamic(() => import('./LuckyGenerator'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8 w-full mx-auto relative z-20 flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-slate-200 font-black text-4xl">LOTTO</div>
    </div>
  ),
});

interface LuckyGeneratorWrapperProps {
  initialCategoryId?: string;
  presetCategory?: LotteryCategory;
  gamePageContext?: GamePageGeneratorContext;
}

export default function LuckyGeneratorWrapper({
  initialCategoryId,
  presetCategory,
  gamePageContext,
}: LuckyGeneratorWrapperProps) {
  return (
    <LuckyGenerator
      initialCategoryId={initialCategoryId}
      presetCategory={presetCategory}
      gamePageContext={gamePageContext}
    />
  );
}
