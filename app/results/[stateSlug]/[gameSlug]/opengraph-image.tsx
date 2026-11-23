import { renderLottoOgImage } from '@/lib/lottoOgImage';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import State from '@/models/State';

export const alt = 'Lottery Game Winning Numbers & Draw History';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ stateSlug: string; gameSlug: string }> }) {
  const { stateSlug, gameSlug } = await params;
  let gameName = gameSlug.toUpperCase();
  let stateName = stateSlug.toUpperCase();
  let jackpot = '';
  let numbers: string[] = [];
  let powerBall = '';

  try {
    await connectToDatabase();
    const [state, game] = await Promise.all([
      State.findOne({ slug: stateSlug }).lean(),
      Game.findOne({ stateSlug, slug: gameSlug }).lean(),
    ]);

    if (state) stateName = state.name;
    if (game) {
      gameName = game.name;
      jackpot = game.jackpot || '';
      numbers = game.numbers || [];
      powerBall = game.powerBall || '';
    }
  } catch (e) {}

  return renderLottoOgImage({
    badge: `${stateName} Official Lottery`,
    title: `${gameName} Winning Numbers`,
    subtitle: `Draw Results & 365-Day Archive • ${stateName}`,
    jackpot: jackpot || undefined,
    numbers: numbers.length > 0 ? numbers : undefined,
    powerBall: powerBall || undefined,
    pills: ['Official Numbers', 'Draw Schedule', 'Verified Results'],
  });
}
