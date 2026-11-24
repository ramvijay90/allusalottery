import { cache } from 'react';
import connectToDatabase from '@/lib/db';
import State from '@/models/State';
import Game from '@/models/Game';
import Result from '@/models/Result';

export const STATE_ALIASES: Record<string, string> = {
  arizona: 'az',
  arkansas: 'ar',
  california: 'ca',
  colorado: 'co',
  connecticut: 'ct',
  delaware: 'de',
  florida: 'fl',
  georgia: 'ga',
  idaho: 'id',
  illinois: 'il',
  indiana: 'in',
  iowa: 'ia',
  kansas: 'ks',
  kentucky: 'ky',
  louisiana: 'la',
  maine: 'me',
  maryland: 'md',
  massachusetts: 'ma',
  michigan: 'mi',
  minnesota: 'mn',
  mississippi: 'ms',
  missouri: 'mo',
  montana: 'mt',
  nebraska: 'ne',
  newhampshire: 'nh',
  newjersey: 'nj',
  newmexico: 'nm',
  newyork: 'ny',
  northcarolina: 'nc',
  northdakota: 'nd',
  ohio: 'oh',
  oklahoma: 'ok',
  oregon: 'or',
  pennsylvania: 'pa',
  rhodeisland: 'ri',
  southcarolina: 'sc',
  southdakota: 'sd',
  tennessee: 'tn',
  texas: 'tx',
  vermont: 'vt',
  virginia: 'va',
  washington: 'wa',
  westvirginia: 'wv',
  wisconsin: 'wi',
  wyoming: 'wy',
  ontario: 'on',
  quebec: 'qc',
  britishcolumbia: 'bc',
  atlanticcanada: 'ac',
  atlantic: 'ac',
  westerncanada: 'wc',
  western: 'wc',
  'au-nsw': 'au-nsw',
  'au-vic': 'au-vic',
  'au-qld': 'au-qld',
  'au-wa': 'au-wa',
  'au-sa': 'au-sa',
  'au-tas': 'au-tas'
};

export const GAME_ALIASES: Record<string, string> = {
  lottomax: 'lotto-max',
  megamillions: 'mega-millions',
  powerball: 'powerball',
  'power-ball': 'powerball',
  lotto649: 'canada-lotto-6-49',
  'lotto-6-49': 'canada-lotto-6-49',
  'canada-lotto649': 'canada-lotto-6-49',
};

export function cleanJackpot(jackpotStr?: string): string {
  if (!jackpotStr) return '';
  let text = jackpotStr.trim();
  if (!text || text.toLowerCase() === 'official' || text.toLowerCase() === 'official result') return '';

  text = text.replace(/^CAS(?=\d)/i, 'CA$');

  const caMatch = text.match(/(?:CA\s?\$?|CAD\s?\$?)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (caMatch && caMatch[0].length >= 3) {
    let res = caMatch[0].trim();
    if (/^CA(?!\$)/i.test(res)) res = res.replace(/^CA/i, 'CA$');
    return res;
  }

  const usMatch = text.match(/(?:US\s?\$?|AU\s?\$?|\$)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (usMatch && usMatch[0].length >= 2) {
    return usMatch[0].trim();
  }

  const millionMatch = text.match(/[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (millionMatch) {
    return `$${millionMatch[0].trim()}`;
  }

  return text.length > 18 ? text.slice(0, 16) + '...' : text;
}

export function resolveAliases(stateSlug: string, gameSlug: string) {
  const cleanState = (stateSlug || '').toLowerCase().trim();
  const cleanGame = (gameSlug || '').toLowerCase().trim();
  const resolvedState = STATE_ALIASES[cleanState.replace(/[^a-z0-9-]/g, '')] || cleanState;
  const resolvedGame = GAME_ALIASES[cleanGame.replace(/[^a-z0-9-]/g, '')] || GAME_ALIASES[cleanGame] || cleanGame;
  return { resolvedState, resolvedGame };
}

export const getGameData = cache(async (stateSlug: string, gameSlug: string) => {
    await connectToDatabase();
    const state = await State.findOne({ slug: stateSlug }).lean();
    if (!state) return null;

    const game = await Game.findOne({ stateSlug, slug: gameSlug }).lean();
    if (!game) return null;

    const isTopGame = !!game.jackpot || 
                      ['powerball', 'megamillions', 'lottomax', 'powerball-australia', 'oz-lotto'].includes(game.slug.toLowerCase()) ||
                      game.name.match(/Powerball|Mega Millions|Lotto Max|Oz Lotto/i);

    let cutoffDate: Date;
    if (isTopGame) {
      cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);
    } else {
      cutoffDate = new Date('2026-01-01T00:00:00Z');
    }

    let history = await Result.find({
        gameId: game._id,
        date: { $gte: cutoffDate }
    })
        .sort({ date: -1 })
        .limit(50)
        .lean();

    if (history.length === 0) {
        history = await Result.find({
            gameId: game._id
        })
            .sort({ date: -1 })
            .limit(50)
            .lean();
    }

    const siblingGames = await Game.find({ stateSlug, slug: { $ne: gameSlug } })
        .select('name slug lastDrawDate numbers jackpot')
        .sort({ name: 1 })
        .limit(8)
        .lean();

    const initialHistoryData = history.length > 0 
        ? history 
        : (game.numbers && game.numbers.length > 0 ? [{
            date: game.lastDrawDate ? new Date(game.lastDrawDate).toISOString() : new Date().toISOString(),
            numbers: game.numbers,
            jackpot: game.jackpot || '',
            powerBall: game.powerBall || ''
        }] : []);

    return {
        state: JSON.parse(JSON.stringify(state)),
        game: JSON.parse(JSON.stringify(game)),
        history: JSON.parse(JSON.stringify(initialHistoryData)),
        siblingGames: JSON.parse(JSON.stringify(siblingGames)),
        cutoffDate: cutoffDate.toISOString()
    };
});
