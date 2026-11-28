export interface CountryKeywordBundle {
  operatorName: string;
  operatorShort: string;
  regionLabel: string;
  countryTerms: string[];
}

const REGION_MAP: Record<string, CountryKeywordBundle> = {
  on: {
    operatorName: 'Ontario Lottery and Gaming (OLG)',
    operatorShort: 'OLG Ontario',
    regionLabel: 'Canada',
    countryTerms: ['OLG winning numbers', 'OLG past results', 'Ontario lottery results today', 'Lotto Max winning numbers', 'Lotto 649 results', 'Ontario 49 results', 'check OLG ticket'],
  },
  wc: {
    operatorName: 'Western Canada Lottery Corporation (WCLC)',
    operatorShort: 'WCLC Western',
    regionLabel: 'Canada',
    countryTerms: ['WCLC winning numbers', 'WCLC past results', 'Western 649 results', 'Western Max winning numbers', 'Western Pick 3 results', 'Lotto Max past results'],
  },
  bc: {
    operatorName: 'British Columbia Lottery Corporation (BCLC PlayNow)',
    operatorShort: 'BCLC PlayNow',
    regionLabel: 'Canada',
    countryTerms: ['BCLC winning numbers', 'PlayNow lottery results', 'BC 49 winning numbers', 'BC Extra results', 'Lotto Max results BC'],
  },
  qc: {
    operatorName: 'Loto-Québec',
    operatorShort: 'Loto-Québec',
    regionLabel: 'Canada',
    countryTerms: ['Loto-Québec résultats', 'Québec 49 résultats', 'Québec Max winning numbers', 'Banco Loto-Québec', 'La Quotidienne résultats', 'Lotto Max Québec'],
  },
  ac: {
    operatorName: 'Atlantic Lottery Corporation (ALC)',
    operatorShort: 'ALC Atlantic',
    regionLabel: 'Canada',
    countryTerms: ['ALC winning numbers', 'Atlantic Lottery results', 'Atlantic 49 winning numbers', 'Keno Atlantic results', 'Bucko results', 'Atlantic Tag numbers'],
  },
  'au-nsw': {
    operatorName: 'NSW Lotteries / The Lott',
    operatorShort: 'The Lott NSW',
    regionLabel: 'Australia',
    countryTerms: ['The Lott NSW results', 'Powerball Australia winning numbers', 'Oz Lotto results tonight', 'Saturday Lotto NSW', 'NSW Lotteries past results'],
  },
  'au-vic': {
    operatorName: 'Tatts / The Lott Victoria',
    operatorShort: 'Tatts Victoria',
    regionLabel: 'Australia',
    countryTerms: ['TattsLotto results tonight', 'The Lott Victoria results', 'Oz Lotto winning numbers', 'Australia Powerball results', 'Tatts past winning numbers'],
  },
  'au-qld': {
    operatorName: 'Golden Casket / The Lott Queensland',
    operatorShort: 'Golden Casket QLD',
    regionLabel: 'Australia',
    countryTerms: ['Golden Casket results', 'The Lott QLD winning numbers', 'Gold Lotto Saturday results', 'Powerball Australia QLD', 'Oz Lotto past results'],
  },
  'au-wa': {
    operatorName: 'Lotterywest',
    operatorShort: 'Lotterywest WA',
    regionLabel: 'Australia',
    countryTerms: ['Lotterywest winning numbers', 'Lotterywest Saturday Lotto', 'WA Powerball results', 'Oz Lotto Lotterywest', 'WA Cash 3 results'],
  },
  'au-sa': {
    operatorName: 'SA Lotteries / The Lott',
    operatorShort: 'SA Lotteries',
    regionLabel: 'Australia',
    countryTerms: ['SA Lotteries results', 'The Lott South Australia', 'Saturday X Lotto results', 'Powerball Australia SA', 'Oz Lotto results'],
  },
  'au-tas': {
    operatorName: 'Tatts Tasmania / The Lott',
    operatorShort: 'Tatts Tasmania',
    regionLabel: 'Australia',
    countryTerms: ['Tattersalls Tasmania results', 'The Lott Tasmania', 'TattsLotto winning numbers', 'Oz Lotto Tasmania', 'Powerball Australia results'],
  },
  eu: {
    operatorName: 'European Official Lotteries',
    operatorShort: 'Europe Official',
    regionLabel: 'Europe',
    countryTerms: ['EuroMillions results tonight', 'EuroJackpot winning numbers', 'EuroMillions past results', 'Lucky Stars numbers', 'European lottery history'],
  },
  uk: {
    operatorName: 'UK National Lottery',
    operatorShort: 'UK National Lottery',
    regionLabel: 'UK',
    countryTerms: ['UK National Lottery results', 'UK Lotto winning numbers', 'EuroMillions results UK', 'Thunderball winning numbers', 'Set For Life UK results'],
  },
  'uk-eng': {
    operatorName: 'UK National Lottery England',
    operatorShort: 'UK Lotto England',
    regionLabel: 'UK',
    countryTerms: ['UK National Lottery results tonight', 'England Lotto winning numbers', 'EuroMillions results UK', 'Thunderball results'],
  },
  'uk-sct': {
    operatorName: 'UK National Lottery Scotland',
    operatorShort: 'UK Lotto Scotland',
    regionLabel: 'UK',
    countryTerms: ['Scotland lottery results', 'UK Lotto Scotland', 'EuroMillions Scotland results', 'Thunderball winning numbers'],
  },
  'uk-wls': {
    operatorName: 'UK National Lottery Wales',
    operatorShort: 'UK Lotto Wales',
    regionLabel: 'UK',
    countryTerms: ['Wales lottery results', 'UK Lotto Wales', 'EuroMillions results tonight', 'Thunderball UK results'],
  },
  'uk-nir': {
    operatorName: 'UK National Lottery Northern Ireland',
    operatorShort: 'UK & Irish NI',
    regionLabel: 'UK',
    countryTerms: ['Northern Ireland lottery results', 'UK Lotto NI', 'Irish Lotto results', 'EuroMillions winning numbers'],
  },
  ie: {
    operatorName: 'Irish National Lottery',
    operatorShort: 'Irish Lottery',
    regionLabel: 'Ireland',
    countryTerms: ['Irish Lotto results tonight', 'National Lottery Ireland winning numbers', 'Irish Lotto Plus 1 & 2', 'Daily Million results Ireland'],
  },
  es: {
    operatorName: 'Loterías y Apuestas del Estado',
    operatorShort: 'Spain Lottery',
    regionLabel: 'Spain',
    countryTerms: ['La Primitiva resultados', 'Bonoloto hoy', 'El Gordo resultados', 'EuroMillones España', 'Spanish lottery winning numbers'],
  },
  'es-cat': {
    operatorName: 'Loteries de Catalunya',
    operatorShort: 'Catalonia Lotto',
    regionLabel: 'Spain',
    countryTerms: ['La Grossa de Catalunya', 'Lotto 6/49 Catalunya', 'Catalonia lottery results', 'EuroMillions Spain'],
  },
  it: {
    operatorName: 'SuperEnalotto / Lottomatica Italia',
    operatorShort: 'Italy Lotto',
    regionLabel: 'Italy',
    countryTerms: ['SuperEnalotto estrazione oggi', 'SuperEnalotto winning numbers', 'Italian Lotto results', '10eLotto winning numbers', 'MillionDAY Italy'],
  },
  fr: {
    operatorName: 'FDJ Loto Français',
    operatorShort: 'FDJ France',
    regionLabel: 'France',
    countryTerms: ['Loto FDJ résultats aujourd hui', 'Tirage Loto France', 'EuroMillions My Million', 'French Loto winning numbers'],
  },
  'eu-de': {
    operatorName: 'Deutscher Lotto- und Totoblock (Lotto.de)',
    operatorShort: 'Germany Lotto',
    regionLabel: 'Germany',
    countryTerms: ['Lotto 6aus49 Gewinnzahlen', 'EuroJackpot Zahlen heute', 'Spiel 77 & Super 6', 'German lottery winning numbers'],
  },
  'de-by': {
    operatorName: 'Lotto Bayern',
    operatorShort: 'Lotto Bayern',
    regionLabel: 'Germany',
    countryTerms: ['Lotto Bayern Gewinnzahlen', 'Bayern 6aus49 Ergebnisse', 'EuroJackpot Bayern', 'Keno Germany results'],
  },
  nz: {
    operatorName: 'Lotto New Zealand (MyLotto)',
    operatorShort: 'MyLotto NZ',
    regionLabel: 'New Zealand',
    countryTerms: ['MyLotto NZ results', 'Lotto NZ winning numbers', 'NZ Powerball results tonight', 'Lotto Strike numbers', 'NZ Keno results', 'Bullseye NZ results'],
  },
  za: {
    operatorName: 'Ithuba South Africa National Lottery',
    operatorShort: 'Ithuba SA Lotto',
    regionLabel: 'South Africa',
    countryTerms: ['Ithuba National Lottery results', 'SA PowerBall winning numbers', 'SA Daily Lotto results tonight', 'SA Lotto Plus 1 and 2', 'South Africa lotto past results'],
  },
  ng: {
    operatorName: 'Nigeria National Lottery',
    operatorShort: 'Nigeria Lotto',
    regionLabel: 'Nigeria',
    countryTerms: ['Nigeria lottery results today', 'Nigeria Mega Jackpot winning numbers', 'Naija lotto results', 'Nigerian national lottery history'],
  },
};

export function getCountryKeywordBundle(country: string | undefined, stateSlug: string, stateName: string): CountryKeywordBundle {
  const s = (stateSlug || '').toLowerCase().trim();
  if (REGION_MAP[s]) return REGION_MAP[s];

  const c = (country || 'US').toLowerCase();
  if (c === 'canada') {
    return {
      operatorName: `${stateName} Provincial Lottery`,
      operatorShort: `${stateName} Lotto`,
      regionLabel: 'Canada',
      countryTerms: [`${stateName} lottery results`, 'Lotto Max winning numbers', 'Lotto 649 past results', 'Canada lottery numbers tonight'],
    };
  }
  return {
    operatorName: `${stateName} Lottery`,
    operatorShort: `${stateName} Lottery`,
    regionLabel: 'USA',
    countryTerms: [
      `${stateName} lottery winning numbers`,
      `${stateName} lottery results today`,
      `${stateName} past winning numbers`,
      'Powerball winning numbers tonight',
      'Mega Millions past winning numbers',
      `${stateName} pick 3 winning numbers`,
      `${stateName} pick 4 results`,
    ],
  };
}

export function formatDrawSummaryLine(item: { date?: string | Date; numbers?: string[]; powerBall?: string; jackpot?: string }): string {
  if (!item?.date || !Array.isArray(item.numbers) || item.numbers.length === 0) return '';
  try {
    const d = new Date(item.date);
    const dateStr = d.toLocaleDateString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: 'numeric' });
    const nums = item.numbers.join('-');
    const pb = item.powerBall ? ` (${item.powerBall})` : '';
    return `${dateStr}: ${nums}${pb}`;
  } catch {
    return '';
  }
}

export function buildGameKeywords(params: {
  stateName: string;
  stateSlug: string;
  country?: string;
  gameName: string;
  gameSlug: string;
  year: number;
}): string[] {
  const { stateName, stateSlug, country, gameName, gameSlug, year } = params;
  const bundle = getCountryKeywordBundle(country, stateSlug, stateName);
  const gLower = gameName.toLowerCase();

  const gameSpecific: string[] = [
    `${gameName} winning numbers`,
    `${gameName} winning numbers tonight`,
    `${gameName} past winning numbers`,
    `${gameName} results today`,
    `${gameName} numbers last 6 months`,
    `${gameName} lottery history ${year}`,
    `${stateName} ${gameName} results`,
    `${stateName} ${gameName} winning numbers ${year}`,
    `${gameName} chart ${year}`,
    `${gameName} hot and cold numbers`,
    `${gameName} overdue pending numbers`,
    `check ${gameName} numbers`,
  ];

  // Add extra high-volume aliases by game type
  if (/powerball/i.test(gLower)) {
    gameSpecific.push(`${gameName} power play results`, `${gameName} payout tiers`, `${gameName} next jackpot`);
  } else if (/mega\s*millions/i.test(gLower)) {
    gameSpecific.push('mega millions past winning numbers', 'mega millions lottery history', 'mega millions numbers last 6 months', 'mega millions multiplier');
  } else if (/pick\s*[2345]|cash\s*[345]|quotidienne|daily\s*[345]/i.test(gLower)) {
    gameSpecific.push(`${stateName} ${gameName} midday evening`, `${stateName} ${gameName} past results`, `${gameName} straight box payout`, `${gameName} lucky numbers`);
  } else if (/keno|banco/i.test(gLower)) {
    gameSpecific.push(`${gameName} live draws today`, `${gameName} 20 winning numbers`, `${gameName} multiplier results`);
  } else if (/lotto\s*max|6\/?49/i.test(gLower)) {
    gameSpecific.push(`${gameName} maxmillions`, `${gameName} encore tag extra`, `${gameName} gold ball jackpot`);
  } else if (/euromillions|eurojackpot/i.test(gLower)) {
    gameSpecific.push(`${gameName} lucky stars`, `${gameName} prize breakdown`, `${gameName} raffle millionaire maker`);
  } else if (/oz\s*lotto|tatts|saturday\s*lotto|weekday/i.test(gLower)) {
    gameSpecific.push(`the lott ${gameName}`, `${gameName} dividends today`, `${gameName} supplementary numbers`);
  }

  return [...new Set([...gameSpecific, ...bundle.countryTerms])];
}
