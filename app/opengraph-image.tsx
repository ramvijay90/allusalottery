import { renderLottoOgImage } from '@/lib/lottoOgImage';

export const alt = 'USA Lottery Results Today & Winning Numbers 2026';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return renderLottoOgImage({
    badge: '🇺🇸 Official USA & Canada Lottery Hub',
    title: 'USA Lottery Results & Winning Numbers',
    subtitle: 'Powerball • Mega Millions • Lotto Max • 50 State Lotteries',
    pills: ['Live Draws', 'Jackpot Estimates', 'Draw Archives'],
  });
}
