import { renderLottoOgImage } from '@/lib/lottoOgImage';

export const alt = 'USA Lottery Results Today & Winning Numbers 2026';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function Image() {
  return renderLottoOgImage({
    badge: '🌐 Official Lottery Results Hub',
    title: 'Live Lottery Results & Winning Numbers',
    subtitle: 'USA • Canada • Australia • UK & Europe • All States & Jackpots',
    pills: ['Live Draws', 'Jackpot Estimates', 'Draw Archives'],
  });
}
