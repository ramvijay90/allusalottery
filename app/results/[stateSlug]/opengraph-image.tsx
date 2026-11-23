import { renderLottoOgImage } from '@/lib/lottoOgImage';
import connectToDatabase from '@/lib/db';
import State from '@/models/State';

export const alt = 'State Lottery Results Today Live | Official Winning Numbers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ stateSlug: string }> }) {
  const { stateSlug } = await params;
  let stateName = stateSlug.toUpperCase();
  let country = 'USA';

  try {
    await connectToDatabase();
    const state = await State.findOne({ slug: stateSlug }).lean();
    if (state) {
      stateName = state.name;
      country = state.country || 'USA';
    }
  } catch (e) {}

  return renderLottoOgImage({
    badge: `Official ${country} Lottery Drawing`,
    title: `${stateName} Lottery Results Today`,
    subtitle: `Live Winning Numbers • Daily Drawings • Latest Jackpot Payouts`,
    pills: [`${stateName} Lotteries`, 'Live Updates', 'Verified Draw History'],
  });
}
