export type CategoryMode =
  | 'standard'
  | 'box'
  | 'custom'
  | 'digit-random'
  | 'number-random'
  | 'previous-result'
  | 'truly-lucky'
  | 'numerology'
  | 'horoscope'
  | 'scrambler';

export interface LotteryCategory {
  id: string;
  name: string;
  country: string;
  region: 'USA' | 'Canada' | 'Europe' | 'Australia' | 'New Zealand' | 'Africa' | 'Global' | 'Kerala';
  flag: string;
  mode: CategoryMode;
  toolGroup?: 'lottery' | 'tool' | 'format' | 'digit';
  mainBalls?: number;
  mainRange?: [number, number];
  specialBalls?: number;
  specialRange?: [number, number];
  specialName?: string;
  customDigits?: number;
  // High-Volume SEO Metadata modeled after top ranking generator sites
  seoTitle: string;
  seoDescription: string;
  h1Title: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
}

const CORE_GENERATOR_KEYWORDS = [
  'lucky number generator',
  'lottery number generator',
  'lottery generator',
  'lotto number generator',
  'lottery number picker',
  'pick my lottery numbers',
  'lucky lottery numbers',
  'lottery quick pick generator',
];

function genKeywords(name: string, extra: string[] = []): string[] {
  const low = name.toLowerCase();
  return [
    ...new Set([
      `${low} lucky numbers`,
      `${low} lucky number generator`,
      `${low} number generator`,
      `${low} number picker`,
      `${low} quick pick`,
      `pick my ${low} numbers`,
      ...extra,
      ...CORE_GENERATOR_KEYWORDS,
    ]),
  ];
}

export const CATEGORIES: LotteryCategory[] = [
  // --- USA LOTTERIES ---
  {
    id: 'powerball',
    name: 'Power Ball',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 69],
    specialBalls: 1,
    specialRange: [1, 26],
    specialName: 'Powerball',
    seoTitle: 'Powerball Lucky Numbers & Number Generator 2026 | Quick Pick',
    seoDescription: 'Generate Powerball lucky numbers, quick picks, and custom combinations. Pick 5 numbers from 1 to 69 plus 1 Powerball from 1 to 26 using true random or mix-and-match filters.',
    h1Title: 'Your Powerball Lucky Lottery Numbers',
    keywords: genKeywords('Powerball', ['usa powerball numbers', 'powerball prediction tool', 'lucky numbers for powerball tonight', '5 lucky numbers from 1 to 69']),
    faqs: [
      { question: 'How does the Powerball Lucky Number Generator work?', answer: 'The Powerball generator selects 5 unique main numbers from 1 to 69 and 1 special red Powerball number from 1 to 26, with options to mix in or exclude your favorite numbers.' },
      { question: 'Can I generate multiple Powerball tickets at once?', answer: 'Yes, you can generate from 1 up to 100 Powerball ticket lines in a single click, download CSV files, or filter by odd/even ratios.' }
    ]
  },
  {
    id: 'mega-millions',
    name: 'Mega Millions',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 70],
    specialBalls: 1,
    specialRange: [1, 25],
    specialName: 'Mega Ball',
    seoTitle: 'Mega Millions Lucky Numbers & Number Generator 2026 | Quick Pick',
    seoDescription: 'Free Mega Millions lucky number generator and random picker. Select 5 numbers (1-70) plus 1 Mega Ball (1-25) with include/exclude controls and instant CSV export.',
    h1Title: 'Your Mega Millions Lucky Lottery Numbers',
    keywords: genKeywords('Mega Millions', ['mega millions numbers tonight', 'mega millions prediction', '5 lucky numbers from 1 to 70']),
    faqs: [
      { question: 'What numbers are chosen for Mega Millions?', answer: 'It picks 5 main numbers between 1 and 70, plus 1 Mega Ball between 1 and 25, matching official rules.' }
    ]
  },
  {
    id: 'lotto-america',
    name: 'Lotto America',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 52],
    specialBalls: 1,
    specialRange: [1, 10],
    specialName: 'Star Ball',
    seoTitle: 'Lotto America Lucky Numbers & Quick Pick Generator 2026',
    seoDescription: 'Generate Lotto America lucky numbers with our Star Ball lottery number picker. Choose 5 white balls (1-52) and 1 Star Ball (1-10) instantly.',
    h1Title: 'Lotto America Lucky Number Generator',
    keywords: genKeywords('Lotto America', ['star ball number generator', '5 lucky numbers from 1 to 52']),
    faqs: [
      { question: 'How is Lotto America structured?', answer: 'Lotto America requires 5 numbers from 1 to 52 and one Star Ball from 1 to 10.' }
    ]
  },
  {
    id: '2by2',
    name: 'US 2by2',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 2,
    mainRange: [1, 26],
    specialBalls: 2,
    specialRange: [1, 26],
    specialName: 'White Balls',
    seoTitle: 'US 2by2 Lucky Numbers & Number Generator 2026 | Quick Pick',
    seoDescription: 'Generate daily US 2by2 lottery numbers. Randomly pick 2 Red numbers (1-26) and 2 White numbers (1-26) with instant Quick Pick rules.',
    h1Title: 'US 2by2 Lucky Number Generator',
    keywords: genKeywords('2by2', ['us 2 by 2 number generator', '2by2 quick pick']),
    faqs: [
      { question: 'What is the US 2by2 format?', answer: '2by2 selects 2 red numbers from 1 to 26 and 2 white numbers from 1 to 26 every night.' }
    ]
  },
  {
    id: 'cash-life',
    name: 'Cash 4 Life',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 60],
    specialBalls: 1,
    specialRange: [1, 4],
    specialName: 'Cash Ball',
    seoTitle: 'Cash4Life Lucky Numbers & Cash Ball Generator 2026 | Quick Pick',
    seoDescription: 'Generate Cash4Life lucky numbers and Cash Ball picks. Select 5 balls (1-60) and 1 Cash Ball (1-4) with odd/even and custom favorite number mixing.',
    h1Title: 'Cash4Life Lucky Number Generator',
    keywords: genKeywords('Cash4Life', ['cash 4 life quick pick', 'win for life number generator', 'cash ball picker']),
    faqs: [
      { question: 'What are Cash4Life ball ranges?', answer: '5 main balls from 1 to 60 and 1 Cash Ball from 1 to 4.' }
    ]
  },
  {
    id: 'lucky-life',
    name: 'Lucky for Life',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 48],
    specialBalls: 1,
    specialRange: [1, 18],
    specialName: 'Lucky Ball',
    seoTitle: 'Lucky for Life Numbers & Lucky Ball Generator 2026',
    seoDescription: 'Generate Lucky for Life lottery numbers with 5 balls (1-48) and 1 Lucky Ball (1-18) for daily $1,000 a day for life jackpots.',
    h1Title: 'Lucky for Life Number Generator',
    keywords: genKeywords('Lucky for Life', ['lucky ball number picker', '5 lucky numbers from 1 to 48']),
    faqs: [
      { question: 'How does Lucky for Life work?', answer: 'Players pick 5 numbers from 1 to 48 and one Lucky Ball from 1 to 18.' }
    ]
  },
  {
    id: 'keno',
    name: 'Keno',
    country: 'United States & Global',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 20,
    mainRange: [1, 80],
    seoTitle: 'Keno Lucky Number Generator 2026 | 20-Spot 1-80 Quick Pick',
    seoDescription: 'Generate random 20-spot or custom spot Keno numbers from 1 to 80. Fast Keno lucky number picker with no-repeat and odd/even balance options.',
    h1Title: 'Your Keno Lucky Lottery Numbers',
    keywords: genKeywords('Keno', ['keno 20 spot picker', 'keno 1 to 80 number generator', '10 80 keno numbers']),
    faqs: [
      { question: 'How many numbers are picked in Keno?', answer: 'Standard Keno draws 20 numbers from 1 through 80, and you can also switch to 10-80 or customize spots.' }
    ]
  },
  {
    id: 'cash-5',
    name: 'Cash 5',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 43],
    seoTitle: 'Cash 5 Lucky Numbers & 5/43 Generator 2026 | Quick Pick',
    seoDescription: 'Generate daily Cash 5 lottery numbers from 1 to 43 for Texas, Pennsylvania, Virginia, Colorado, and North Carolina Cash 5 draws.',
    h1Title: 'Cash 5 Lucky Number Generator',
    keywords: genKeywords('Cash 5', ['5-43 lottery generator', '5 lucky numbers from 1 to 43']),
    faqs: [
      { question: 'What is Cash 5 range?', answer: 'Selects 5 numbers from 1 to 43 without duplicates, editable to your state pool limit.' }
    ]
  },

  // --- CANADA LOTTERIES ---
  {
    id: 'lotto-max',
    name: 'Lotto Max',
    country: 'Canada',
    region: 'Canada',
    flag: '🇨🇦',
    mode: 'standard',
    mainBalls: 7,
    mainRange: [1, 50],
    seoTitle: 'Lotto Max Lucky Numbers & Number Generator 2026 | Canada Quick Pick',
    seoDescription: 'Generate Canada Lotto Max lucky numbers. Pick 7 random numbers from 1 to 50 for Tuesday and Friday OLG, WCLC, BCLC, Loto-Québec & ALC draws.',
    h1Title: 'Your Lotto Max Lucky Lottery Numbers',
    keywords: genKeywords('Lotto Max', ['canada lotto max generator', '7 lucky numbers from 1 to 50', 'olg lotto max quick pick']),
    faqs: [
      { question: 'How is Lotto Max played?', answer: 'Select 7 main numbers from 1 to 50 for every Tuesday and Friday night Canadian draw.' }
    ]
  },
  {
    id: 'canada-649',
    name: 'Lotto 6/49',
    country: 'Canada',
    region: 'Canada',
    flag: '🇨🇦',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 49],
    specialBalls: 1,
    specialRange: [1, 49],
    specialName: 'Bonus',
    seoTitle: 'Lotto 649 Lucky Numbers & 6/49 Generator 2026 | Canada Quick Pick',
    seoDescription: 'Pick 6 lucky numbers from 1 to 49 for Canada Lotto 6/49. Free OLG, BCLC, WCLC & Atlantic 6/49 random number picker with custom filters.',
    h1Title: 'Lotto 6/49 Lucky Number Generator',
    keywords: genKeywords('Lotto 649', ['649 quick pick', '6 lucky numbers from 1 to 49', 'canada 6/49 number generator']),
    faqs: [
      { question: 'What is Canada Lotto 6/49 format?', answer: 'Players choose 6 main numbers from 1 to 49; a 7th Bonus Ball (1-49) is also drawn.' }
    ]
  },
  {
    id: 'bc-49',
    name: 'BC/49',
    country: 'Canada',
    region: 'Canada',
    flag: '🇨🇦',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 49],
    seoTitle: 'BC49 Lucky Numbers & Quick Pick Generator 2026 | BCLC PlayNow',
    seoDescription: 'Generate BCLC BC/49 lucky numbers (6 numbers from 1 to 49) for Wednesday and Saturday British Columbia lottery draws.',
    h1Title: 'BC/49 Lucky Number Generator',
    keywords: genKeywords('BC49', ['bc 49 quick pick', 'bclc bc49 number generator', '6 from 49 bc lotto']),
    faqs: [
      { question: 'How does BC/49 work?', answer: 'Picks 6 numbers from 1 to 49 exclusively for British Columbia players.' }
    ]
  },
  {
    id: 'daily-grand',
    name: 'Daily Grand',
    country: 'Canada',
    region: 'Canada',
    flag: '🇨🇦',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 49],
    specialBalls: 1,
    specialRange: [1, 7],
    specialName: 'Grand Number',
    seoTitle: 'Daily Grand Lucky Numbers & Grand Number Generator 2026 | Canada',
    seoDescription: 'Generate Daily Grand lucky numbers: 5 numbers (1-49) and 1 Grand Number (1-7) for Monday & Thursday $1,000 a day for life draws.',
    h1Title: 'Daily Grand Lucky Number Generator',
    keywords: genKeywords('Daily Grand', ['daily grand quick pick canada', 'grand number generator']),
    faqs: [
      { question: 'What is the Daily Grand format?', answer: '5 main balls from 1 to 49 plus 1 Grand Number from 1 to 7.' }
    ]
  },
  {
    id: 'lottario',
    name: 'OLG Lottario',
    country: 'Canada',
    region: 'Canada',
    flag: '🇨🇦',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 45],
    seoTitle: 'Lottario Lucky Numbers & OLG Quick Pick Generator 2026',
    seoDescription: 'Generate Ontario Lottario lucky numbers (6 balls from 1 to 45) for Saturday night OLG Early Bird & Grand Prize draws.',
    h1Title: 'OLG Lottario Lucky Number Generator',
    keywords: genKeywords('Lottario', ['olg lottario quick pick', '6 lucky numbers from 1 to 45']),
    faqs: [
      { question: 'How many balls in Lottario?', answer: 'Choose 6 numbers from 1 to 45 on every Saturday night OLG ticket.' }
    ]
  },

  // --- EUROPE & UK LOTTERIES ---
  {
    id: 'euro-millions',
    name: 'Euro Millions',
    country: 'Europe',
    region: 'Europe',
    flag: '🇪🇺',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 50],
    specialBalls: 2,
    specialRange: [1, 12],
    specialName: 'Lucky Star',
    seoTitle: 'EuroMillions Lucky Numbers & Lucky Star Generator 2026 | Quick Pick',
    seoDescription: 'Free EuroMillions lucky number generator. Generate 5 main balls (1-50) plus 2 Lucky Stars (1-12) for Tuesday and Friday European jackpots.',
    h1Title: 'Your EuroMillions Lucky Lottery Numbers',
    keywords: genKeywords('EuroMillions', ['lucky stars euromillions', 'euro millions quick pick', '5 lucky numbers from 1 to 50']),
    faqs: [
      { question: 'What are the EuroMillions draw rules?', answer: 'EuroMillions selects 5 main numbers from 1 to 50 and 2 Lucky Stars from 1 to 12.' }
    ]
  },
  {
    id: 'euro-jackpot',
    name: 'Euro Jackpot',
    country: 'Germany & Europe',
    region: 'Europe',
    flag: '🇩🇪',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 50],
    specialBalls: 2,
    specialRange: [1, 12],
    specialName: 'Euro Number',
    seoTitle: 'EuroJackpot Lucky Numbers & Number Generator 2026 | Quick Pick',
    seoDescription: 'Generate EuroJackpot lucky numbers across Germany and Europe. Pick 5 numbers (1-50) and 2 Euro Numbers (1-12) with instant wheeling filters.',
    h1Title: 'Your EuroJackpot Lucky Lottery Numbers',
    keywords: genKeywords('EuroJackpot', ['eurojackpot zahlen generator', 'eurojackpot quick pick']),
    faqs: [
      { question: 'Which countries play EuroJackpot?', answer: 'Germany, Finland, Denmark, Italy, Netherlands, Spain, and 12 other European nations participate in the 5/50 + 2/12 draw.' }
    ]
  },
  {
    id: 'lotto-uk-eur',
    name: 'UK Lotto',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 59],
    seoTitle: 'UK Lotto Lucky Numbers & National Lottery Generator 2026 | 6/59',
    seoDescription: 'Generate UK National Lottery Lotto numbers (6 balls from 1 to 59) for Wednesday and Saturday draws using true randomness.',
    h1Title: 'Your UK Lotto Lucky Lottery Numbers',
    keywords: genKeywords('UK Lotto', ['national lottery number generator', 'uk lotto 6 59 picker', 'uk hotpicks generator']),
    faqs: [
      { question: 'What is the UK Lotto format?', answer: '6 main numbers are selected from a pool of 1 to 59.' }
    ]
  },
  {
    id: 'uk-49s',
    name: 'UK 49s',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 49],
    specialBalls: 1,
    specialRange: [1, 49],
    specialName: 'Booster',
    seoTitle: 'UK 49s Lucky Numbers & Quick Pick Generator 2026 | Lunchtime & Teatime',
    seoDescription: 'Generate UK 49s Lunchtime and Teatime lucky numbers (6 balls from 1 to 49 plus Booster ball). Includes mix & match favorite numbers.',
    h1Title: 'Your UK 49s Lucky Lottery Numbers',
    keywords: genKeywords('UK 49s', ['uk 49s quick pick', 'uk49s prediction generator', 'lunchtime teatime lucky numbers']),
    faqs: [
      { question: 'How does UK 49s work?', answer: 'Drawings occur twice daily (Lunchtime & Teatime) using 6 main balls (1-49) plus 1 Booster ball.' }
    ]
  },
  {
    id: 'thunderball',
    name: 'Thunderball',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 39],
    specialBalls: 1,
    specialRange: [1, 14],
    specialName: 'Thunderball',
    seoTitle: 'UK Thunderball Lucky Numbers & Quick Pick Generator 2026',
    seoDescription: 'Generate UK Thunderball winning combinations. Choose 5 main balls (1-39) and 1 Thunderball (1-14) for £500k draws.',
    h1Title: 'UK Thunderball Lucky Number Generator',
    keywords: genKeywords('Thunderball', ['uk thunderball generator', '5/39 thunderball picker']),
    faqs: [
      { question: 'What is the Thunderball format?', answer: '5 numbers from 1 to 39 plus 1 Thunderball from 1 to 14.' }
    ]
  },
  {
    id: 'set-life',
    name: 'Set For Life',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 47],
    specialBalls: 1,
    specialRange: [1, 10],
    specialName: 'Life Ball',
    seoTitle: 'Set For Life Lucky Numbers & Life Ball Generator 2026 | UK',
    seoDescription: 'Generate UK Set For Life lucky numbers with 5 main balls (1-47) and 1 Life Ball (1-10) for Monday & Thursday draws.',
    h1Title: 'Set For Life Lucky Number Generator',
    keywords: genKeywords('Set For Life', ['uk set for life generator', 'life ball lucky picker']),
    faqs: [
      { question: 'How is Set For Life played?', answer: 'Pick 5 numbers from 1 to 47 and 1 Life Ball from 1 to 10.' }
    ]
  },
  {
    id: 'irish-lotto',
    name: 'Irish Lotto',
    country: 'Ireland',
    region: 'Europe',
    flag: '🇮🇪',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 47],
    specialBalls: 1,
    specialRange: [1, 47],
    specialName: 'Bonus',
    seoTitle: 'Irish Lotto Lucky Numbers & Quick Pick Generator 2026 | 6/47',
    seoDescription: 'Generate National Lottery Ireland Irish Lotto lucky numbers (6 balls from 1 to 47) for Wednesday & Saturday draws.',
    h1Title: 'Irish Lotto Lucky Number Generator',
    keywords: genKeywords('Irish Lotto', ['ireland lottery quick pick', 'irish lotto plus 1 2 generator', '6 from 47 irish lotto']),
    faqs: [
      { question: 'What is the Irish Lotto format?', answer: '6 main numbers are picked from 1 to 47 alongside 1 Bonus ball.' }
    ]
  },
  {
    id: 'superenalotto',
    name: 'SuperEnalotto',
    country: 'Italy',
    region: 'Europe',
    flag: '🇮🇹',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 90],
    seoTitle: 'SuperEnalotto Lucky Numbers & 6/90 Generator 2026 | Italy',
    seoDescription: 'Generate Italy SuperEnalotto lucky numbers (6 numbers from 1 to 90) with random quick pick, odd/even balance & include filters.',
    h1Title: 'SuperEnalotto Lucky Number Generator',
    keywords: genKeywords('SuperEnalotto', ['superenalotto numerologia', '6 lucky numbers from 1 to 90', 'italian lotto quick pick']),
    faqs: [
      { question: 'How is SuperEnalotto played?', answer: 'Pick 6 numbers out of 90 across Italy’s Tuesday, Thursday, Friday & Saturday draws.' }
    ]
  },
  {
    id: 'french-loto',
    name: 'FDJ Loto',
    country: 'France',
    region: 'Europe',
    flag: '🇫🇷',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 49],
    specialBalls: 1,
    specialRange: [1, 10],
    specialName: 'Chance',
    seoTitle: 'French FDJ Loto Lucky Numbers & Chance Ball Generator 2026',
    seoDescription: 'Generate France FDJ Loto combinations: 5 numbers (1-49) and 1 Chance number (1-10) for Monday, Wednesday & Saturday draws.',
    h1Title: 'French FDJ Loto Lucky Number Generator',
    keywords: genKeywords('French Loto', ['fdj loto flash', 'generateur grille loto', '5/49 chance number picker']),
    faqs: [
      { question: 'What is the FDJ Loto matrix?', answer: '5 main numbers from 1 to 49 plus 1 Numéro Chance from 1 to 10.' }
    ]
  },
  {
    id: 'la-primitiva',
    name: 'La Primitiva',
    country: 'Spain',
    region: 'Europe',
    flag: '🇪🇸',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 49],
    specialBalls: 1,
    specialRange: [0, 9],
    specialName: 'Reintegro',
    seoTitle: 'La Primitiva Lucky Numbers & Reintegro Generator 2026 | Spain',
    seoDescription: 'Generate Spain La Primitiva lucky combinations (6 balls 1-49 + Reintegro 0-9) for Monday, Thursday & Saturday draws.',
    h1Title: 'Spain La Primitiva Lucky Number Generator',
    keywords: genKeywords('La Primitiva', ['generador primitiva', 'bonoloto quick pick', '6/49 spanish lotto']),
    faqs: [
      { question: 'How is La Primitiva structured?', answer: '6 balls from 1 to 49 plus 1 Reintegro digit from 0 to 9.' }
    ]
  },

  // --- AUSTRALIA LOTTERIES ---
  {
    id: 'oz-powerball',
    name: 'Oz Powerball',
    country: 'Australia',
    region: 'Australia',
    flag: '🇦🇺',
    mode: 'standard',
    mainBalls: 7,
    mainRange: [1, 35],
    specialBalls: 1,
    specialRange: [1, 20],
    specialName: 'Powerball',
    seoTitle: 'Australia Oz Powerball Lucky Numbers & Generator 2026 | The Lott',
    seoDescription: 'Generate Australian Powerball winning numbers: 7 numbers (1-35) plus 1 Powerball (1-20) for Thursday night The Lott & Lotterywest draws.',
    h1Title: 'Australia Oz Powerball Lucky Number Generator',
    keywords: genKeywords('Oz Powerball', ['australian powerball quick pick', 'the lott powerball generator', '7 lucky numbers from 1 to 35']),
    faqs: [
      { question: 'What is Australia Powerball format?', answer: '7 winning numbers from 1 to 35 and 1 Powerball from 1 to 20.' }
    ]
  },
  {
    id: 'oz-lotto',
    name: 'Oz Lotto',
    country: 'Australia',
    region: 'Australia',
    flag: '🇦🇺',
    mode: 'standard',
    mainBalls: 7,
    mainRange: [1, 47],
    seoTitle: 'Oz Lotto Lucky Numbers & 7/47 Quick Pick Generator 2026',
    seoDescription: 'Generate 7 random lucky numbers from 1 to 47 for Tuesday night Australian Oz Lotto jackpots on The Lott.',
    h1Title: 'Oz Lotto Lucky Number Generator',
    keywords: genKeywords('Oz Lotto', ['tuesday oz lotto quick pick', '7 lucky numbers from 1 to 47']),
    faqs: [
      { question: 'How many numbers in Oz Lotto?', answer: '7 main numbers are drawn from 1 to 47 every Tuesday night.' }
    ]
  },
  {
    id: 'tatts',
    name: 'TattsLotto',
    country: 'Australia',
    region: 'Australia',
    flag: '🇦🇺',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 45],
    seoTitle: 'TattsLotto & Saturday Lotto Lucky Numbers Generator 2026',
    seoDescription: 'Generate 6 lucky numbers from 1 to 45 for Australian TattsLotto, Saturday Lotto, Gold Lotto, X Lotto & Lotterywest.',
    h1Title: 'TattsLotto & Saturday Lotto Generator',
    keywords: genKeywords('TattsLotto', ['saturday lotto generator', 'tatts quick pick', '6 lucky numbers from 1 to 45']),
    faqs: [
      { question: 'What is TattsLotto format?', answer: '6 main numbers are selected from 1 to 45 every Saturday night across Australia.' }
    ]
  },
  {
    id: 'monday-wednesday-lotto',
    name: 'Weekday Windfall',
    country: 'Australia',
    region: 'Australia',
    flag: '🇦🇺',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 45],
    seoTitle: 'Monday & Wednesday Lotto / Weekday Windfall Generator 2026 | AU',
    seoDescription: 'Generate 6 lucky numbers (1-45) for Australian Weekday Windfall (formerly Monday, Wednesday & Friday Lotto).',
    h1Title: 'Weekday Windfall Lucky Number Generator',
    keywords: genKeywords('Weekday Windfall', ['monday lotto quick pick', 'wednesday lotto generator australia', '6/45 au lotto']),
    faqs: [
      { question: 'How does Weekday Windfall work?', answer: 'Picks 6 numbers from 1 to 45 drawn every Monday, Wednesday, and Friday.' }
    ]
  },

  // --- NEW ZEALAND LOTTERIES ---
  {
    id: 'nz-lotto',
    name: 'NZ Lotto',
    country: 'New Zealand',
    region: 'New Zealand',
    flag: '🇳🇿',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 40],
    specialBalls: 1,
    specialRange: [1, 40],
    specialName: 'Bonus Ball',
    seoTitle: 'NZ Lotto Lucky Numbers & MyLotto Quick Pick Generator 2026',
    seoDescription: 'Generate New Zealand Lotto numbers (6 balls from 1-40) for MyLotto Wednesday and Saturday night draws.',
    h1Title: 'New Zealand Lotto Lucky Number Generator',
    keywords: genKeywords('NZ Lotto', ['mylotto nz quick pick', '6 lucky numbers from 1 to 40']),
    faqs: [{ question: 'How is NZ Lotto played?', answer: 'Selects 6 main numbers from 1 to 40 drawn every Wednesday and Saturday in New Zealand.' }]
  },
  {
    id: 'nz-powerball',
    name: 'NZ Powerball',
    country: 'New Zealand',
    region: 'New Zealand',
    flag: '🇳🇿',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 40],
    specialBalls: 1,
    specialRange: [1, 10],
    specialName: 'Powerball',
    seoTitle: 'NZ Powerball Lucky Numbers & Quick Pick Generator 2026',
    seoDescription: 'Generate winning NZ Powerball numbers (6 balls 1-40 + 1 Powerball 1-10) for New Zealand national draws.',
    h1Title: 'New Zealand Powerball Lucky Number Generator',
    keywords: genKeywords('NZ Powerball', ['lotto nz powerball quick pick', 'mylotto powerball generator']),
    faqs: [{ question: 'What is the NZ Powerball format?', answer: 'Picks 6 Lotto balls from 1 to 40 plus 1 Powerball from 1 to 10.' }]
  },
  {
    id: 'nz-keno',
    name: 'NZ Keno',
    country: 'New Zealand',
    region: 'New Zealand',
    flag: '🇳🇿',
    mode: 'standard',
    mainBalls: 10,
    mainRange: [1, 80],
    seoTitle: 'NZ Keno Lucky Numbers & 10/80 Quick Pick Generator 2026',
    seoDescription: 'Generate up to 10 Keno spots from 1 to 80 for New Zealand daily Lotto NZ Keno draws.',
    h1Title: 'New Zealand Keno Lucky Number Generator',
    keywords: genKeywords('NZ Keno', ['keno nz quick pick', '10 lucky numbers from 1 to 80']),
    faqs: [{ question: 'How does NZ Keno work?', answer: 'Twenty numbers are drawn from 1 to 80 daily; players pick up to 10 spots.' }]
  },

  // --- AFRICA (SOUTH AFRICA & NIGERIA) LOTTERIES ---
  {
    id: 'sa-lotto',
    name: 'SA Lotto',
    country: 'South Africa',
    region: 'Africa',
    flag: '🇿🇦',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 52],
    specialBalls: 1,
    specialRange: [1, 52],
    specialName: 'Bonus Ball',
    seoTitle: 'South Africa Lotto Lucky Numbers & Ithuba Quick Pick Generator 2026',
    seoDescription: 'Generate SA Lotto, Lotto Plus 1, and Lotto Plus 2 combinations (6 balls from 1-52) for Wednesday & Saturday Ithuba draws.',
    h1Title: 'South Africa Lotto Lucky Number Generator',
    keywords: genKeywords('SA Lotto', ['south africa lotto quick pick', 'ithuba lotto generator', '6 from 52 sa lotto']),
    faqs: [{ question: 'What is the South Africa Lotto matrix?', answer: 'Selects 6 main balls from 1 to 52 plus 1 Bonus Ball.' }]
  },
  {
    id: 'sa-powerball',
    name: 'SA PowerBall',
    country: 'South Africa',
    region: 'Africa',
    flag: '🇿🇦',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 50],
    specialBalls: 1,
    specialRange: [1, 20],
    specialName: 'PowerBall',
    seoTitle: 'SA PowerBall Lucky Numbers & South Africa Quick Pick 2026',
    seoDescription: 'Generate SA PowerBall & PowerBall Plus numbers (5 balls 1-50 + 1 PowerBall 1-20) for Tuesday & Friday Ithuba draws.',
    h1Title: 'South Africa PowerBall Lucky Number Generator',
    keywords: genKeywords('SA PowerBall', ['south africa powerball quick pick', 'powerball plus sa generator']),
    faqs: [{ question: 'What is the SA PowerBall matrix?', answer: 'Picks 5 main numbers from 1 to 50 and 1 PowerBall from 1 to 20.' }]
  },
  {
    id: 'sa-daily-lotto',
    name: 'SA Daily Lotto',
    country: 'South Africa',
    region: 'Africa',
    flag: '🇿🇦',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 36],
    seoTitle: 'SA Daily Lotto Lucky Numbers & 5/36 Quick Pick Generator 2026',
    seoDescription: 'Generate nightly South Africa Daily Lotto numbers (5 balls from 1-36) for every 9 PM SAST drawing.',
    h1Title: 'South Africa Daily Lotto Lucky Number Generator',
    keywords: genKeywords('SA Daily Lotto', ['daily lotto quick pick south africa', '5 lucky numbers from 1 to 36']),
    faqs: [{ question: 'How does SA Daily Lotto work?', answer: 'Selects 5 numbers from 1 to 36 drawn every night.' }]
  },
  {
    id: 'ng-mega-jackpot',
    name: 'Nigeria Mega Jackpot',
    country: 'Nigeria',
    region: 'Africa',
    flag: '🇳🇬',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 50],
    specialBalls: 2,
    specialRange: [1, 12],
    specialName: 'Power Numbers',
    seoTitle: 'Nigeria Mega Jackpot Lucky Numbers & Naija Generator 2026',
    seoDescription: 'Generate Nigeria Mega Jackpot numbers (5 main balls 1-50 + 2 bonus balls) or switch to 5/90 Nigerian lotto numbers.',
    h1Title: 'Nigeria Mega Jackpot Lucky Number Generator',
    keywords: genKeywords('Nigeria Mega Jackpot', ['nigeria lotto lucky numbers', 'naija lotto quick pick', '5 90 nigeria lotto generator']),
    faqs: [{ question: 'How does Nigeria Mega Jackpot work?', answer: 'Selects 5 main balls from 1 to 50 and 2 bonus numbers.' }]
  },

  // --- PICK 2 TO PICK 7 & NUMBER FORMAT GENERATORS (matching lotterynumbergenerator.net) ---
  {
    id: 'pick-2',
    name: 'Pick 2',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    toolGroup: 'digit',
    mainBalls: 2,
    mainRange: [0, 9],
    seoTitle: 'Pick 2 Lucky Numbers & Daily 2 Quick Pick Generator 2026',
    seoDescription: 'Generate random 2-digit combinations (0-9) for daily Pick 2 lottery draws across the US and Canada.',
    h1Title: 'Pick 2 Lucky Number Generator',
    keywords: genKeywords('Pick 2', ['daily 2 lottery picker', '2 digit quick pick']),
    faqs: [{ question: 'How is Pick 2 played?', answer: 'Pick 2 selects 2 digits between 0 and 9 with optional duplicate control.' }]
  },
  {
    id: 'pick-3',
    name: 'Pick 3',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    toolGroup: 'digit',
    mainBalls: 3,
    mainRange: [0, 9],
    seoTitle: 'Pick 3 Lucky Numbers & Midday/Evening Generator 2026',
    seoDescription: 'Generate Pick 3 lucky numbers (0-9) for midday and evening state draws. Supports Straight and Box combination styles.',
    h1Title: 'Your Pick 3 Lucky Lottery Numbers',
    keywords: genKeywords('Pick 3', ['pick 3 numbers today', 'pick 3 generator straight box', 'cash 3 lucky numbers']),
    faqs: [{ question: 'How does Pick 3 generator work?', answer: 'It selects three digits from 0 to 9, allowing duplicates by default just like official lottery machines.' }]
  },
  {
    id: 'pick-4',
    name: 'Pick 4',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    toolGroup: 'digit',
    mainBalls: 4,
    mainRange: [0, 9],
    seoTitle: 'Pick 4 Lucky Numbers & 4-Digit Midday/Evening Generator 2026',
    seoDescription: 'Generate random 4-digit winning combinations (0-9) for daily Pick 4, Cash 4, and Win 4 state lottery draws.',
    h1Title: 'Your Pick 4 Lucky Lottery Numbers',
    keywords: genKeywords('Pick 4', ['pick 4 numbers today', 'cash 4 quick pick', 'win 4 number generator']),
    faqs: [{ question: 'How does Pick 4 work?', answer: 'It randomly produces 4 digits from 0 to 9 with optional duplicate blocking.' }]
  },
  {
    id: 'pick-5',
    name: 'Pick 5',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    toolGroup: 'digit',
    mainBalls: 5,
    mainRange: [0, 9],
    seoTitle: 'Pick 5 Lucky Numbers & 5-Digit Daily Generator 2026',
    seoDescription: 'Generate 5-digit combinations from 0 to 9 for Pick 5 games in Florida, Pennsylvania, Ohio, and Virginia.',
    h1Title: 'Pick 5 Lucky Number Generator',
    keywords: genKeywords('Pick 5', ['florida pick 5 numbers today', 'daily 5 quick pick']),
    faqs: [{ question: 'What is Pick 5 format?', answer: 'Selects 5 independent digits from 0 to 9.' }]
  },
  {
    id: 'pick-6',
    name: 'Pick 6',
    country: 'United States & Global',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 6,
    mainRange: [1, 46],
    seoTitle: 'Pick 6 Lucky Numbers & 6/46 Lotto Generator 2026',
    seoDescription: 'Generate 6 random numbers from 1 to 46 for classic Pick 6 lotto draws.',
    h1Title: 'Pick 6 Lucky Number Generator',
    keywords: genKeywords('Pick 6', ['new jersey pick 6 lotto', '6 lucky numbers from 1 to 46']),
    faqs: [{ question: 'How is Pick 6 played?', answer: 'Generates 6 non-repeating numbers from 1 to 46.' }]
  },
  {
    id: 'pick-7',
    name: 'Pick 7',
    country: 'Global',
    region: 'Global',
    flag: '🌐',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 7,
    mainRange: [1, 50],
    seoTitle: 'Pick 7 Lucky Numbers & 7/50 Lotto Generator 2026',
    seoDescription: 'Generate 7 random numbers from 1 to 50 for global 7-ball lotto draws.',
    h1Title: 'Pick 7 Lucky Number Generator',
    keywords: genKeywords('Pick 7', ['7 lucky numbers from 1 to 50']),
    faqs: [{ question: 'How is Pick 7 played?', answer: 'Generates 7 numbers from 1 to 50.' }]
  },

  // --- DEDICATED GENERATOR MODES (Mirroring lotterynumbergenerator.net Tools) ---
  {
    id: 'truly-lucky',
    name: 'Truly Lucky',
    country: 'Universal',
    region: 'Global',
    flag: '🖐️',
    mode: 'truly-lucky',
    toolGroup: 'tool',
    mainBalls: 6,
    mainRange: [1, 49],
    seoTitle: 'Truly Random Lucky Number Picker 2026 | Lucky Touch Generator',
    seoDescription: 'Interactive Truly Random Lucky Number Picker. Tap the lucky drum or hand-pick shuffled mystery balls one by one for your Powerball, Mega Millions, or Lotto ticket.',
    h1Title: 'Lucky Touch Truly Random Number Picker',
    keywords: genKeywords('Truly Random', ['truly random lucky number picker', 'lucky touch lottery picker', 'interactive lotto drum picker']),
    faqs: [{ question: 'How does the Truly Lucky Touch picker work?', answer: 'Tap "Draw Next Lucky Ball" or click shuffled mystery orbs to reveal each ball one at a time, mimicking a real lottery drawing drum.' }]
  },
  {
    id: 'numerology',
    name: 'Numerology',
    country: 'Universal',
    region: 'Global',
    flag: '🔢',
    mode: 'numerology',
    toolGroup: 'tool',
    mainBalls: 6,
    mainRange: [1, 49],
    seoTitle: 'Numero Lucky - Numerology Lucky Number Generator 2026',
    seoDescription: 'Generate Numero Lucky numbers based on Numerology, Life Path Date of Birth, and your name vibration for today’s lottery draws.',
    h1Title: 'Your Numerology Lucky Lottery Numbers',
    keywords: genKeywords('Numerology', ['numero lucky numbers', 'numerology lottery numbers based on birthday', 'life path lucky lottery numbers']),
    faqs: [{ question: 'How are Numerology lottery numbers calculated?', answer: 'Your full name and birth date are reduced to Pythagorean Life Path & Destiny core numbers and blended within your selected lottery range.' }]
  },
  {
    id: 'horoscope',
    name: 'Horoscopic',
    country: 'Universal',
    region: 'Global',
    flag: '✨',
    mode: 'horoscope',
    toolGroup: 'tool',
    mainBalls: 6,
    mainRange: [1, 49],
    seoTitle: 'Horoscopic Lucky Numbers 2026 | Zodiac Lottery Number Generator',
    seoDescription: 'Generate daily Horoscopic lucky lottery numbers tailored to your Zodiac sign (Aries to Pisces) for Powerball, Mega Millions, EuroMillions & daily picks.',
    h1Title: 'Your Horoscopic Zodiac Lucky Numbers',
    keywords: genKeywords('Horoscope', ['horoscopic lucky numbers', 'zodiac lottery number generator', 'daily horoscope lucky lotto numbers']),
    faqs: [{ question: 'Can I filter Horoscope numbers to any lottery game?', answer: 'Yes. Select your zodiac sign and customize your pool range (e.g. 1-69 for Powerball or 1-49 for Lotto 6/49).' }]
  },
  {
    id: 'scrambler',
    name: 'Scrambler',
    country: 'Universal',
    region: 'Global',
    flag: '🔀',
    mode: 'scrambler',
    toolGroup: 'tool',
    mainBalls: 6,
    mainRange: [1, 49],
    seoTitle: 'Lottery Number Scrambler 2026 | Mix & Shuffle Your Numbers',
    seoDescription: 'Free Lottery Number Scrambler. Enter your favorite lucky numbers, birthdays, or past draw digits and scramble them into fresh ticket combinations.',
    h1Title: 'Lottery Number Scrambler & Shuffler',
    keywords: genKeywords('Lottery Scrambler', ['lottery number scrambler', 'scramble my lottery numbers', 'mix and match lottery numbers']),
    faqs: [{ question: 'How does the Lottery Scrambler work?', answer: 'Paste any pool of numbers or lucky charms, set how many balls per ticket line, and generate shuffled non-repeating sets.' }]
  },

  // --- MATRIX FORMAT URLs (Matching lotterynumbergenerator.net /649, /5-90, /642, /6-45) ---
  {
    id: '6-49',
    name: '6 from 49',
    country: 'Global Format',
    region: 'Global',
    flag: '🎱',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 6,
    mainRange: [1, 49],
    seoTitle: '6 Lucky Numbers from 1 to 49 Generator 2026 | 6/49 Quick Pick',
    seoDescription: 'Pick 6 lucky numbers from 1 to 49 using our advanced random lottery generator. Ideal for Lotto 6/49, German 6aus49, Spain Primitiva & global 6/49 games.',
    h1Title: 'Your 6/49 Lucky Lottery Numbers',
    keywords: genKeywords('6 49', ['6 lucky numbers from 1 to 49', '649 number generator', '6 out of 49 random picker']),
    faqs: [{ question: 'Which lotteries use 6 from 1 to 49?', answer: 'Canada Lotto 6/49, German 6aus49, UK 49s, Spain La Primitiva, and Hong Kong Mark Six all use 6/49 or variants.' }]
  },
  {
    id: '5-90',
    name: '5 from 90',
    country: 'Global Format',
    region: 'Global',
    flag: '🎱',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 5,
    mainRange: [1, 90],
    seoTitle: '5 Lucky Numbers from 1 to 90 Generator 2026 | 5/90 Lotto Picker',
    seoDescription: 'Generate 5 lucky numbers from 1 to 90 for Ghana NLA, Nigeria Baba Ijebu, Premier Lotto, and European 5/90 lotteries.',
    h1Title: 'Your 5/90 Lucky Lottery Numbers',
    keywords: genKeywords('5 90', ['5 lucky numbers from 1 to 90', '5 90 lotto generator', 'nigeria baba ijebu 5 90 generator']),
    faqs: [{ question: 'Which lotteries use 5 from 90?', answer: 'Popular 5/90 games across Nigeria, Ghana, Togo, Côte d’Ivoire, and Italy Lotto select 5 balls from 1 to 90.' }]
  },
  {
    id: '6-45',
    name: '6 from 45',
    country: 'Global Format',
    region: 'Global',
    flag: '🎱',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 6,
    mainRange: [1, 45],
    seoTitle: '6 Lucky Numbers from 1 to 45 Generator 2026 | 6/45 Quick Pick',
    seoDescription: 'Pick 6 lucky numbers from 1 to 45 for TattsLotto, Saturday Lotto, Austrian Lotto, Korean Lotto 6/45 & global 6/45 draws.',
    h1Title: 'Your 6/45 Lucky Lottery Numbers',
    keywords: genKeywords('6 45', ['6 lucky numbers from 1 to 45', '6/45 lottery number generator']),
    faqs: [{ question: 'Where is 6 from 45 played?', answer: 'Australia Saturday/Monday/Wednesday Lotto, Austria Lotto, and South Korea 6/45 all pick 6 from 45.' }]
  },
  {
    id: '6-42',
    name: '6 from 42',
    country: 'Global Format',
    region: 'Global',
    flag: '🎱',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 6,
    mainRange: [1, 42],
    seoTitle: '6 Lucky Numbers from 1 to 42 Generator 2026 | 6/42 Quick Pick',
    seoDescription: 'Generate 6 random lucky numbers from 1 to 42 for Belgium Lotto, Philippines 6/42, and classic 6/42 lotteries.',
    h1Title: 'Your 6/42 Lucky Lottery Numbers',
    keywords: genKeywords('6 42', ['6 lucky numbers from 1 to 42', '642 number generator']),
    faqs: [{ question: 'What is the 6/42 format?', answer: 'Selects 6 unique integers from 1 through 42.' }]
  },
  {
    id: '5-50',
    name: '5 from 50',
    country: 'Global Format',
    region: 'Global',
    flag: '🎱',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 5,
    mainRange: [1, 50],
    seoTitle: '5 Lucky Numbers from 1 to 50 Generator 2026 | 5/50 Picker',
    seoDescription: 'Pick 5 lucky numbers from 1 to 50 with optional bonus ball filters for EuroMillions, EuroJackpot & South Africa PowerBall.',
    h1Title: 'Your 5/50 Lucky Lottery Numbers',
    keywords: genKeywords('5 50', ['5 lucky numbers from 1 to 50', '5/50 number picker']),
    faqs: [{ question: 'Which lotteries draw 5 from 50?', answer: 'EuroMillions, EuroJackpot, and South Africa PowerBall draw 5 main balls from 1 to 50.' }]
  },
  {
    id: '7-50',
    name: '7 from 50',
    country: 'Global Format',
    region: 'Global',
    flag: '🎱',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 7,
    mainRange: [1, 50],
    seoTitle: '7 Lucky Numbers from 1 to 50 Generator 2026 | 7/50 Quick Pick',
    seoDescription: 'Generate 7 lucky numbers from 1 to 50 cleanly for Canada Lotto Max and international 7/50 jackpots.',
    h1Title: 'Your 7/50 Lucky Lottery Numbers',
    keywords: genKeywords('7 50', ['7 lucky numbers from 1 to 50']),
    faqs: [{ question: 'Which game uses 7 from 50?', answer: 'Canada’s Lotto Max draws 7 winning balls from 1 to 50.' }]
  },
  {
    id: '10-80',
    name: '10 from 80',
    country: 'Global Format',
    region: 'Global',
    flag: '🎱',
    mode: 'standard',
    toolGroup: 'format',
    mainBalls: 10,
    mainRange: [1, 80],
    seoTitle: '10 Lucky Numbers from 1 to 80 Generator 2026 | Keno 10/80 Picker',
    seoDescription: 'Generate 10 random Keno lucky numbers from 1 to 80 with non-repeating odd/even filters.',
    h1Title: 'Your 10/80 Keno Lucky Numbers',
    keywords: genKeywords('10 80', ['10 lucky numbers from 1 to 80', '10 spot keno generator']),
    faqs: [{ question: 'Why pick 10 from 80?', answer: '10 spots from 1 to 80 is the top-prize Keno pick across US, Canadian, and NZ Keno games.' }]
  },

  // --- UAE & OTHER INTERNATIONAL ---
  {
    id: 'mahzooz',
    name: 'Mahzooz',
    country: 'United Arab Emirates (UAE)',
    region: 'Global',
    flag: '🇦🇪',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 49],
    seoTitle: 'Mahzooz UAE Lucky Numbers & Quick Pick Generator 2026',
    seoDescription: 'Generate 5 winning numbers from 1 to 49 for Mahzooz and UAE national draws.',
    h1Title: 'Mahzooz UAE Lucky Number Generator',
    keywords: genKeywords('Mahzooz', ['uae lottery numbers generator', 'dubai lottery lucky numbers']),
    faqs: [{ question: 'How does Mahzooz draw work?', answer: 'Players pick 5 numbers from 1 to 49 for weekly Saturday draws.' }]
  },
  {
    id: 'fast-5',
    name: 'Fast 5',
    country: 'United Arab Emirates (UAE)',
    region: 'Global',
    flag: '🇦🇪',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 42],
    seoTitle: 'Fast 5 UAE Lucky Numbers & Emirates Draw Generator 2026',
    seoDescription: 'Generate 5 numbers from 1 to 42 for Emirates Draw Fast 5 competitions.',
    h1Title: 'Fast 5 UAE Lucky Number Generator',
    keywords: genKeywords('Fast 5', ['emirates draw fast 5 numbers']),
    faqs: [{ question: 'What is Fast 5 format?', answer: 'Selects 5 numbers from 1 to 42.' }]
  },
  {
    id: 'easy-6',
    name: 'Easy 6',
    country: 'United Arab Emirates (UAE)',
    region: 'Global',
    flag: '🇦🇪',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 39],
    seoTitle: 'Easy 6 UAE Lucky Numbers & Emirates Draw Generator 2026',
    seoDescription: 'Generate 6 random numbers from 1 to 39 for Emirates Draw Easy 6.',
    h1Title: 'Easy 6 UAE Lucky Number Generator',
    keywords: genKeywords('Easy 6', ['emirates draw easy 6']),
    faqs: [{ question: 'What is Easy 6 format?', answer: 'Selects 6 numbers from 1 to 39.' }]
  },
  {
    id: 'mega-7',
    name: 'Mega 7',
    country: 'United Arab Emirates (UAE)',
    region: 'Global',
    flag: '🇦🇪',
    mode: 'standard',
    mainBalls: 7,
    mainRange: [1, 37],
    seoTitle: 'Mega 7 UAE Lucky Numbers & Emirates Draw Generator 2026',
    seoDescription: 'Generate 7 random numbers from 1 to 37 for Emirates Draw Mega 7.',
    h1Title: 'Mega 7 UAE Lucky Number Generator',
    keywords: genKeywords('Mega 7', ['emirates draw mega 7 numbers']),
    faqs: [{ question: 'What is Mega 7 format?', answer: 'Selects 7 numbers from 1 to 37.' }]
  },

  // --- KERALA & DIGIT / BOX / COMBINATOR TOOLS ---
  {
    id: '3-digit',
    name: '3 Digit',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    toolGroup: 'digit',
    customDigits: 3,
    seoTitle: 'Kerala Lottery 3 Digit Lucky Number Generator 2026 | 3D Box Tool',
    seoDescription: 'Generate all combinations and lucky numbers for Kerala Lottery 3 Digit, 3D Box, and ABC board guessing.',
    h1Title: 'Kerala Lottery 3 Digit Lucky Generator',
    keywords: genKeywords('Kerala 3 Digit', ['3 digit box generator', 'kl 3 digit guessing number']),
    faqs: [{ question: 'How does the 3 Digit Box generator work?', answer: 'It calculates all permutations for your selected 3 digits to cover ABC box plays.' }]
  },
  {
    id: '4-digit',
    name: '4 Digit',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    toolGroup: 'digit',
    customDigits: 4,
    seoTitle: 'Kerala Lottery 4 Digit Lucky Number Generator 2026 | 4D Box Wheel',
    seoDescription: 'Generate 4-digit lucky numbers and all 24 box permutations for Kerala Lottery 4D guessing.',
    h1Title: 'Kerala Lottery 4 Digit Lucky Generator',
    keywords: genKeywords('Kerala 4 Digit', ['4 digit box generator', 'kl 4 digit prediction number']),
    faqs: [{ question: 'How many combinations are created in 4-digit box?', answer: 'A 4-digit number with distinct digits creates 24 unique winning combinations.' }]
  },
  {
    id: '5-digit',
    name: '5 Digit',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    toolGroup: 'digit',
    customDigits: 5,
    seoTitle: 'Kerala Lottery 5 Digit Lucky Number Generator 2026 | 5D Box Tool',
    seoDescription: 'Generate 5-digit combinations and permutations for bumper lottery draws in Kerala State Lotteries.',
    h1Title: 'Kerala Lottery 5 Digit Lucky Generator',
    keywords: genKeywords('Kerala 5 Digit', ['5 digit box generator', '5d kerala lottery prediction']),
    faqs: [{ question: 'When is the 5-digit generator used?', answer: 'It is ideal for bumper lottery series analysis and 5-digit permutation wheels.' }]
  },
  {
    id: 'board',
    name: 'Board',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    toolGroup: 'digit',
    seoTitle: 'Kerala Lottery Board A B C Lucky Number Generator 2026',
    seoDescription: 'Generate Position A, Position B, and Position C board combinations for Kerala Lottery daily guessing.',
    h1Title: 'Kerala Lottery Board A B C Generator',
    keywords: genKeywords('Kerala Board ABC', ['kerala lottery board guessing', 'a board b board c board generator']),
    faqs: [{ question: 'What is Board A, B, C guessing?', answer: 'Board A, B, C represent individual digit positions of 3-digit Kerala lottery prizes.' }]
  },
  {
    id: 'all-possible',
    name: 'Combinator',
    country: 'Global',
    region: 'Global',
    flag: '🌐',
    mode: 'box',
    toolGroup: 'tool',
    seoTitle: 'Combinator - Lottery Number Combination Generator 2026 | Box Wheel',
    seoDescription: 'Lottery Number Combination Generator (Combinator). Generate all possible permutations and box combinations for any 2, 3, 4, or 5-digit pool.',
    h1Title: 'Lottery Number Combination Generator',
    keywords: genKeywords('Combination', ['number combination generator', 'combinator lottery', 'all possible combinations generator', 'lottery permutations calculator']),
    faqs: [{ question: 'What does Combinator generate?', answer: 'It calculates every mathematically possible combination of your entered digits.' }]
  },
  {
    id: 'previous-result',
    name: 'Previous Result',
    country: 'Global',
    region: 'Global',
    flag: '📊',
    mode: 'previous-result',
    toolGroup: 'tool',
    seoTitle: 'Previous Result Pattern Generator 2026 | Smart Lottery Predictor',
    seoDescription: 'Enter past winning numbers to generate complementary variations and balanced predictions for upcoming draws.',
    h1Title: 'Previous Result Lottery Pattern Predictor',
    keywords: genKeywords('Previous Result', ['previous result pattern generator', 'lottery past winning numbers algorithm']),
    faqs: [{ question: 'How does the Previous Result mode work?', answer: 'It takes your prior draw width and generates fresh non-repeating variations.' }]
  },

  // --- GENERAL NUMBER & CUSTOM PICKER ---
  {
    id: 'lucky-number',
    name: 'Lucky Number',
    country: 'Universal',
    region: 'Global',
    flag: '⭐',
    mode: 'number-random',
    toolGroup: 'tool',
    mainRange: [1, 50],
    seoTitle: 'Lucky Number Generator 2026 | Random Winning Numbers Picker',
    seoDescription: 'Free Universal Lucky Number Generator. Pick random lucky numbers with custom ranges, odd/even filters, and zero duplicate options.',
    h1Title: 'Universal Lucky Number Generator',
    keywords: genKeywords('Universal Lucky', ['random number picker', 'today lucky numbers', 'daily lucky number generator']),
    faqs: [{ question: 'Can I customize the range?', answer: 'Yes! You can customize any start and end range with odd/even and duplicate filters.' }]
  },
  {
    id: 'digit',
    name: 'Digit',
    country: 'Universal',
    region: 'Global',
    flag: '🔢',
    mode: 'digit-random',
    toolGroup: 'digit',
    seoTitle: 'Random Digit Generator 2026 | 2 to 5 Digit Lottery Picker',
    seoDescription: 'Generate random digit sequences from 2 up to 5 digits for daily lottery guessing and pick games.',
    h1Title: 'Random Digit Lottery Generator',
    keywords: genKeywords('Random Digit', ['random digit generator', 'digit lottery picker']),
    faqs: [{ question: 'What digit lengths are supported?', answer: 'Supports any length from 2 through 5 digits.' }]
  },
  {
    id: 'custom',
    name: 'Create Your Own',
    country: 'Universal',
    region: 'Global',
    flag: '⚙️',
    mode: 'custom',
    toolGroup: 'tool',
    seoTitle: 'Create Your Own Lottery Number Generator 2026 | Custom Rules',
    seoDescription: 'Create your own custom lottery number generator. Set main ball count, main pool range, bonus balls, and include/exclude favorite numbers.',
    h1Title: 'Create Your Own Custom Lottery Generator',
    keywords: genKeywords('Custom Lottery', ['create your own lottery', 'custom quick pick generator', 'custom lottery simulator']),
    faqs: [{ question: 'Can I simulate any world lottery?', answer: 'Yes, configure any main ball count, pool maximum, bonus ball rules, and personal number filters.' }]
  }
];

export function getCategoryById(id: string): LotteryCategory | undefined {
  return CATEGORIES.find(c => c.id.toLowerCase() === id.toLowerCase());
}
