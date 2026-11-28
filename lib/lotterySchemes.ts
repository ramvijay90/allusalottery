export interface SchemeGroupDefinition {
  schemeKey: string;
  label: string;
  summary: string;
  keywords: string[];
  matchRegex: RegExp;
  defaultHref: string;
  variantHints: { label: string; badge: string }[];
}

export const SCHEME_DIRECTORY: SchemeGroupDefinition[] = [
  {
    schemeKey: 'powerball',
    label: 'Powerball & Powerball Double Play',
    summary: 'Includes US Powerball ($20M–$1B+ Jackpot), Powerball Double Play ($10M Fixed Second Draw), Australia Powerball, NZ Powerball & South Africa PowerBall / Plus.',
    keywords: ['powerball', 'double play', 'powerball double play', 'power play', 'oz powerball', 'nz powerball', 'sa powerball', 'powerball plus'],
    matchRegex: /powerball|double[- ]play/i,
    defaultHref: '/results/az/powerball',
    variantHints: [
      { label: 'Powerball (Main Draw)', badge: 'Mon / Wed / Sat' },
      { label: 'Powerball Double Play', badge: '$10M Second Draw' },
      { label: 'SA PowerBall & Plus', badge: 'Tue / Fri' },
      { label: 'Australia & NZ Powerball', badge: 'Thu / Wed / Sat' },
    ],
  },
  {
    schemeKey: 'mega-millions',
    label: 'Mega Millions & Nigeria Mega Jackpot',
    summary: 'Tuesday & Friday US Mega Millions with built-in multiplier (2X–10X) plus Mega Jackpot international games.',
    keywords: ['mega millions', 'megamillions', 'megaplier', 'mega ball', 'mega jackpot'],
    matchRegex: /mega[- ]millions|mega[- ]jackpot/i,
    defaultHref: '/results/ca/mega-millions',
    variantHints: [
      { label: 'Mega Millions', badge: 'Tue / Fri US' },
      { label: 'Nigeria Mega Jackpot', badge: 'Wed / Sat' },
    ],
  },
  {
    schemeKey: 'lotto-max',
    label: 'Canada Lotto Max & Maxmillions',
    summary: 'National Canadian Lotto Max, Ontario Max, Western Max, Québec Max & Atlantic Max draws.',
    keywords: ['lotto max', 'lottomax', 'olg', 'wclc', 'bclc', 'loto-quebec', 'alc', 'maxmillions'],
    matchRegex: /lotto[- ]?max|western[- ]?max|quebec[- ]?max/i,
    defaultHref: '/results/on/lotto-max',
    variantHints: [
      { label: 'Lotto Max (National)', badge: 'Tue / Fri CA$' },
      { label: 'Ontario / Western / Québec Max', badge: 'Provincial' },
    ],
  },
  {
    schemeKey: 'lotto-649',
    label: 'Canada Lotto 6/49 & Provincial 49s',
    summary: 'Lotto 6/49 Gold Ball & Classic draws plus Ontario 49, BC 49, Western 649, Atlantic 49 & Québec 49.',
    keywords: ['649', '6/49', 'lotto 649', 'ontario 49', 'bc 49', 'western 649', 'atlantic 49', 'quebec 49', 'gold ball'],
    matchRegex: /6[- ]?49|649|ontario[- ]?49|bc[- ]?49|atlantic[- ]?49|quebec[- ]?49/i,
    defaultHref: '/results/on/canada-lotto-6-49',
    variantHints: [
      { label: 'Canada Lotto 6/49', badge: 'Gold Ball + Classic' },
      { label: 'BC 49 / Ontario 49 / Western 649', badge: 'Provincial 6/49' },
    ],
  },
  {
    schemeKey: 'euromillions-uk',
    label: 'EuroMillions, UK Lotto & EuroJackpot',
    summary: 'Pan-European EuroMillions & EuroJackpot plus UK Lotto, Thunderball, Set For Life & Irish Lotto Plus 1/2.',
    keywords: ['euromillions', 'euro millions', 'eurojackpot', 'uk lotto', 'thunderball', 'set for life', 'irish lotto', 'lotto plus'],
    matchRegex: /euro[- ]?millions|euro[- ]?jackpot|uk[- ]?lotto|thunderball|set[- ]?for[- ]?life|irish[- ]?lotto|lotto[- ]?plus/i,
    defaultHref: '/results/eu/euromillions',
    variantHints: [
      { label: 'EuroMillions', badge: 'Tue / Fri' },
      { label: 'UK Lotto & Thunderball', badge: 'UK National Lottery' },
      { label: 'Irish Lotto & Plus 1/2', badge: 'Wed / Sat' },
    ],
  },
  {
    schemeKey: 'australia-the-lott',
    label: 'Australia The Lott (Oz Lotto, Tatts & Windfall)',
    summary: 'Australian Powerball, Tuesday Oz Lotto, TattsLotto / Saturday Lotto & Weekday Windfall.',
    keywords: ['the lott', 'oz lotto', 'tatts', 'tattslotto', 'saturday lotto', 'weekday windfall', 'lotterywest', 'golden casket'],
    matchRegex: /oz[- ]?lotto|tatts|saturday[- ]?lotto|weekday[- ]?windfall|gold[- ]?lotto|x[- ]?lotto/i,
    defaultHref: '/results/au-nsw/oz-lotto',
    variantHints: [
      { label: 'Australia Powerball', badge: 'Thu Draw' },
      { label: 'Oz Lotto & TattsLotto', badge: 'Tue / Sat' },
    ],
  },
  {
    schemeKey: 'pick-3-4-daily',
    label: 'Pick 3, Pick 4 & Daily Digit Games',
    summary: 'Midday & Evening Pick 3, Pick 4, Cash 3, Cash 4, Daily 3, Daily 4, Win 4 & Quotidienne.',
    keywords: ['pick 2', 'pick 3', 'pick 4', 'pick 5', 'cash 3', 'cash 4', 'daily 3', 'daily 4', 'win 4', 'fireball'],
    matchRegex: /pick[- ]?[2345]|cash[- ]?[34]|daily[- ]?[34]|win[- ]?4|quotidienne|numbers/i,
    defaultHref: '/results/tx/pick-3',
    variantHints: [
      { label: 'Pick 3 / Cash 3 / Daily 3', badge: 'Midday & Evening' },
      { label: 'Pick 4 / Cash 4 / Daily 4', badge: 'Up to $5,000' },
    ],
  },
];

/**
 * Expands user search phrases cleanly into safe regex patterns so searching
 * e.g. "powerball" also returns "Powerball Double Play", "SA PowerBall Plus", etc.
 */
export function buildSchemeSearchRegexes(rawQuery: string): RegExp[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexSpace = escaped.replace(/\s+/g, '[-\\s]*');
  const regexes: RegExp[] = [new RegExp(flexSpace, 'i')];

  for (const scheme of SCHEME_DIRECTORY) {
    const matchedKeyword = scheme.keywords.some((k) => q.includes(k) || k.includes(q));
    if (matchedKeyword || scheme.matchRegex.test(q)) {
      regexes.push(scheme.matchRegex);
    }
  }

  return regexes;
}
