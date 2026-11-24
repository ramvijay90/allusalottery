import { renderLottoOgImage } from '@/lib/lottoOgImage';

export const alt = 'Live USA Lottery Results Today & Tonight Winning Numbers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function Image() {
  return renderLottoOgImage({
    badge: '⚡ Real-Time Global Lottery Monitor',
    title: 'Live Lottery Results Today',
    subtitle: 'Tonight\'s Winning Numbers • 50 US States • Canada • Multi-State',
    pills: ['Live Feeds', 'Instant Draw Updates', 'All 50 States'],
  });
}
