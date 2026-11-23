import { renderLottoOgImage } from '@/lib/lottoOgImage';
import { getCategoryById } from '@/lib/lotteryCategories';

export const alt = 'Lucky Number Generator Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryById(slug);

  const name = category ? category.name : slug.toUpperCase();
  const country = category ? category.country : 'USA';
  const flag = category ? category.flag : '🎯';

  return renderLottoOgImage({
    badge: `${flag} ${country} Lottery Prediction Tool`,
    title: `${name} Lucky Number Generator`,
    subtitle: `2026 Statistical Prediction Algorithms & Unbiased Wheeling`,
    pills: [`${name} Quick Picks`, 'Cryptographic RNG', 'Free Number Simulator'],
  });
}
