export type CategoryMode = 'standard' | 'box' | 'custom' | 'digit-random' | 'number-random' | 'previous-result';

export interface LotteryCategory {
  id: string;
  name: string;
  country: string;
  region: 'USA' | 'Europe' | 'Australia' | 'New Zealand' | 'Africa' | 'Global' | 'Kerala';
  flag: string;
  mode: CategoryMode;
  mainBalls?: number;
  mainRange?: [number, number];
  specialBalls?: number;
  specialRange?: [number, number];
  specialName?: string;
  customDigits?: number;
  // High-CPC SEO Metadata
  seoTitle: string;
  seoDescription: string;
  h1Title: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
}

export const CATEGORIES: LotteryCategory[] = [
  // --- USA LOTTERIES (High AdSense CPC $3.00 - $8.00+) ---
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
    seoTitle: 'Powerball Lucky Number Generator 2026 | USA Powerball Predictor',
    seoDescription: 'Generate official USA Powerball lucky numbers instantly. Pick 5 white balls (1-69) and 1 red Powerball (1-26) with true statistical randomness and custom lottery algorithms.',
    h1Title: 'Powerball Lucky Number Generator',
    keywords: ['powerball lucky number generator', 'usa powerball numbers', 'powerball generator', 'powerball prediction tool', 'lucky numbers for powerball tonight', 'random powerball picker'],
    faqs: [
      { question: 'How does the Powerball Lucky Number Generator work?', answer: 'The Powerball generator selects 5 unique main numbers from 1 to 69 and 1 special red Powerball number from 1 to 26 based on true cryptographic randomness.' },
      { question: 'Can I generate multiple Powerball tickets at once?', answer: 'Yes, you can generate from 1 up to 50 Powerball ticket lines in a single click, with options for even, odd, and non-repeating combinations.' }
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
    seoTitle: 'Mega Millions Lucky Number Generator 2026 | Winning Number Picker',
    seoDescription: 'Free Mega Millions lucky number generator. Pick 5 numbers (1-70) plus 1 gold Mega Ball (1-25) using advanced lottery wheeling and predictive algorithms.',
    h1Title: 'Mega Millions Lucky Number Generator',
    keywords: ['mega millions lucky number generator', 'mega millions numbers tonight', 'mega millions generator', 'mega millions prediction algorithm', 'lucky mega millions numbers'],
    faqs: [
      { question: 'What numbers are chosen for Mega Millions?', answer: 'It chooses 5 main numbers between 1 and 70, plus 1 Mega Ball between 1 and 25, simulating official drawing rules.' }
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
    seoTitle: 'Lotto America Lucky Number Generator 2026 | Star Ball Simulator',
    seoDescription: 'Generate quick pick winning numbers for Lotto America. Select 5 main balls (1-52) and 1 Star Ball (1-10) with custom filter controls.',
    h1Title: 'Lotto America Lucky Number Generator',
    keywords: ['lotto america lucky number generator', 'lotto america numbers', 'star ball generator', 'lotto america quick pick'],
    faqs: [
      { question: 'How is Lotto America structured?', answer: 'Lotto America requires 5 numbers from 1 to 52 and one red Star Ball from 1 to 10.' }
    ]
  },
  {
    id: 'cash-life',
    name: 'Cash Life',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 60],
    specialBalls: 1,
    specialRange: [1, 4],
    specialName: 'Cash Ball',
    seoTitle: 'Cash4Life Lucky Number Generator 2026 | Daily Cash Ball Picker',
    seoDescription: 'Generate Cash4Life lucky numbers for the $1,000 a day for life jackpot. Select 5 balls (1-60) and 1 Cash Ball (1-4) instantly.',
    h1Title: 'Cash4Life Lucky Number Generator',
    keywords: ['cash4life lucky number generator', 'cash life generator', 'cash ball lottery picker', 'cash4life quick pick'],
    faqs: [
      { question: 'What are Cash4Life ball ranges?', answer: '5 white balls from 1 to 60 and 1 green Cash Ball from 1 to 4.' }
    ]
  },
  {
    id: 'lucky-life',
    name: 'Lucky Life',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 48],
    specialBalls: 1,
    specialRange: [1, 18],
    specialName: 'Lucky Ball',
    seoTitle: 'Lucky for Life Number Generator 2026 | Daily $1000 Lucky Ball',
    seoDescription: 'Generate Lucky for Life combinations with 5 numbers (1-48) and 1 Lucky Ball (1-18) for top prize predictions.',
    h1Title: 'Lucky for Life Number Generator',
    keywords: ['lucky for life number generator', 'lucky for life lucky ball', 'lucky life prediction tool'],
    faqs: [
      { question: 'How does Lucky for Life work?', answer: 'Players pick 5 numbers from 1 to 48 and one Lucky Ball from 1 to 18.' }
    ]
  },
  {
    id: 'keno',
    name: 'Keno',
    country: 'United States',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 20,
    mainRange: [1, 80],
    seoTitle: 'Keno Lucky Number Generator 2026 | 20 Number Quick Pick Wheel',
    seoDescription: 'Generate 20-spot Keno numbers from 1 to 80. Fast random number picker with statistical odd/even distribution for live casino & lottery keno.',
    h1Title: 'Keno Lucky Number Generator',
    keywords: ['keno lucky number generator', 'keno 20 spot picker', 'live keno generator', 'keno quick pick'],
    faqs: [
      { question: 'How many numbers are picked in Keno?', answer: 'Keno randomly generates 20 numbers from 1 through 80.' }
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
    seoTitle: 'Cash 5 Lucky Number Generator 2026 | 5/43 Daily Lottery Tool',
    seoDescription: 'Generate daily Cash 5 winning combinations from 1 to 43. Perfect for state lotteries including Texas, Pennsylvania, and Virginia Cash 5.',
    h1Title: 'Cash 5 Lucky Number Generator',
    keywords: ['cash 5 lucky number generator', 'cash 5 quick pick', '5-43 lottery generator'],
    faqs: [
      { question: 'What is Cash 5 range?', answer: 'Selects 5 numbers from 1 to 43 without duplicates.' }
    ]
  },

  // --- EUROPE & GERMANY / UK (High European Traffic & CPC) ---
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
    seoTitle: 'EuroMillions Lucky Number Generator 2026 | Lucky Star Simulator',
    seoDescription: 'Generate EuroMillions winning numbers across the UK, France, Spain, and Europe. Pick 5 numbers (1-50) and 2 Lucky Stars (1-12) instantly.',
    h1Title: 'EuroMillions Lucky Number Generator',
    keywords: ['euromillions lucky number generator', 'euromillions generator', 'lucky stars euromillions', 'euro millions quick pick', 'euromillions prediction'],
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
    seoTitle: 'EuroJackpot Lucky Number Generator 2026 | Germany & Europe Lotto',
    seoDescription: 'Generate EuroJackpot lucky numbers for Germany and 18 European countries. Pick 5 main balls (1-50) and 2 Euro Numbers (1-12) with custom probability filters.',
    h1Title: 'EuroJackpot Lucky Number Generator',
    keywords: ['eurojackpot lucky number generator', 'eurojackpot generator germany', 'eurojackpot zahlen generator', 'eurojackpot prediction'],
    faqs: [
      { question: 'Which countries play EuroJackpot?', answer: 'Germany, Finland, Denmark, Italy, Netherlands, Spain, and 12 other European nations participate in the 5/50 + 2/12 draw.' }
    ]
  },
  {
    id: 'lotto-uk-eur',
    name: 'Lotto UK & Eur',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 59],
    seoTitle: 'UK National Lotto Lucky Number Generator 2026 | 6/59 Quick Pick',
    seoDescription: 'Generate UK Lotto lucky numbers (1 to 59). Random 6-ball combination generator for Wednesday and Saturday UK National Lottery draws.',
    h1Title: 'UK National Lotto Lucky Number Generator',
    keywords: ['uk lotto lucky number generator', 'national lottery number generator', 'uk lotto 6 59 picker'],
    faqs: [
      { question: 'What is the UK Lotto format?', answer: '6 numbers are selected from a pool of 1 to 59.' }
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
    seoTitle: 'UK Thunderball Lucky Number Generator 2026 | £500k Jackpot Tool',
    seoDescription: 'Generate Thunderball winning numbers. Choose 5 balls (1-39) and 1 Thunderball (1-14) for UK National Lottery draws.',
    h1Title: 'UK Thunderball Lucky Number Generator',
    keywords: ['thunderball lucky number generator', 'uk thunderball generator', 'thunderball prediction tool'],
    faqs: [
      { question: 'What is the Thunderball format?', answer: '5 numbers from 1 to 39 plus 1 Thunderball from 1 to 14.' }
    ]
  },
  {
    id: 'set-life',
    name: 'Set Life',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 47],
    specialBalls: 1,
    specialRange: [1, 10],
    specialName: 'Life Ball',
    seoTitle: 'Set For Life Lucky Number Generator 2026 | £10k Every Month',
    seoDescription: 'Generate Set For Life combinations with 5 numbers (1-47) and 1 Life Ball (1-10) for UK National Lottery.',
    h1Title: 'Set For Life Lucky Number Generator',
    keywords: ['set for life number generator', 'uk set for life generator', 'life ball lucky picker'],
    faqs: [
      { question: 'How is Set For Life played?', answer: 'Pick 5 numbers from 1 to 47 and 1 Life Ball from 1 to 10.' }
    ]
  },

  // --- AUSTRALIA & CANADA ---
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
    seoTitle: 'Australia Oz Powerball Lucky Number Generator 2026',
    seoDescription: 'Generate Australian Powerball winning numbers. Choose 7 main numbers (1-35) and 1 Powerball (1-20) for Thursday night Australian lottery draws.',
    h1Title: 'Australia Oz Powerball Lucky Number Generator',
    keywords: ['oz powerball lucky number generator', 'australian powerball generator', 'thursday powerball numbers australia'],
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
    seoTitle: 'Oz Lotto Lucky Number Generator 2026 | 7/47 Australian Picker',
    seoDescription: 'Generate 7 random lucky numbers from 1 to 47 for Tuesday night Australian Oz Lotto jackpots.',
    h1Title: 'Oz Lotto Lucky Number Generator',
    keywords: ['oz lotto lucky number generator', 'tuesday oz lotto generator', 'australian oz lotto picker'],
    faqs: [
      { question: 'How many numbers in Oz Lotto?', answer: '7 main numbers are drawn from 1 to 47.' }
    ]
  },
  {
    id: 'tatts',
    name: 'Tatts',
    country: 'Australia',
    region: 'Australia',
    flag: '🇦🇺',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 45],
    seoTitle: 'TattsLotto & Saturday Lotto Lucky Number Generator 2026',
    seoDescription: 'Generate 6 numbers from 1 to 45 for Australian TattsLotto and Saturday Superdraw jackpots.',
    h1Title: 'TattsLotto Lucky Number Generator',
    keywords: ['tattslotto number generator', 'saturday lotto generator australia', 'tatts lucky numbers'],
    faqs: [
      { question: 'What is TattsLotto format?', answer: '6 numbers are selected from 1 to 45.' }
    ]
  },
  {
    id: 'lotto-max',
    name: 'Lotto Max',
    country: 'Canada',
    region: 'Global',
    flag: '🇨🇦',
    mode: 'standard',
    mainBalls: 7,
    mainRange: [1, 50],
    seoTitle: 'Canada Lotto Max Lucky Number Generator 2026 | 7/50 Picker',
    seoDescription: 'Generate 7 numbers from 1 to 50 for Canadian Lotto Max draws on Tuesday and Friday nights.',
    h1Title: 'Canada Lotto Max Lucky Number Generator',
    keywords: ['lotto max lucky number generator', 'canada lotto max generator', 'lotto max quick pick'],
    faqs: [
      { question: 'How is Lotto Max played?', answer: 'Select 7 numbers from 1 to 50.' }
    ]
  },

  // --- KERALA LOTTERY & DIGIT/BOX TOOLS ---
  {
    id: '3-digit',
    name: '3 Digit',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    customDigits: 3,
    seoTitle: 'Kerala Lottery 3 Digit Lucky Number Generator 2026 | 3D Box Tool',
    seoDescription: 'Generate all combinations and lucky numbers for Kerala Lottery 3 Digit, 3D Box, and ABC board guessing. Free permutations and wheeling generator.',
    h1Title: 'Kerala Lottery 3 Digit Lucky Generator',
    keywords: ['kerala lottery 3 digit lucky number generator', '3 digit box generator', 'kl 3 digit guessing number', '3d lucky number kerala lottery'],
    faqs: [
      { question: 'How does the 3 Digit Box generator work?', answer: 'It calculates all 6 permutations for your selected 3 digits to ensure maximum box coverage in Kerala lottery draws.' }
    ]
  },
  {
    id: '4-digit',
    name: '4 Digit',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    customDigits: 4,
    seoTitle: 'Kerala Lottery 4 Digit Lucky Number Generator 2026 | 4D Box Wheel',
    seoDescription: 'Generate 4-digit lucky numbers and all 24 box permutations for Kerala Lottery 4D guessing, first prize tracking, and daily prediction patterns.',
    h1Title: 'Kerala Lottery 4 Digit Lucky Generator',
    keywords: ['kerala lottery 4 digit lucky number generator', '4 digit box generator', 'kl 4 digit prediction number', '4d lucky generator kerala'],
    faqs: [
      { question: 'How many combinations are created in 4-digit box?', answer: 'A 4-digit number with distinct digits creates 24 unique winning combinations.' }
    ]
  },
  {
    id: '5-digit',
    name: '5 Digit',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    customDigits: 5,
    seoTitle: 'Kerala Lottery 5 Digit Lucky Number Generator 2026 | 5D Box Tool',
    seoDescription: 'Generate 5-digit combinations and permutations for bumper lottery draws and advanced prediction analysis in Kerala State Lotteries.',
    h1Title: 'Kerala Lottery 5 Digit Lucky Generator',
    keywords: ['kerala lottery 5 digit lucky number generator', '5 digit box generator', '5d kerala lottery prediction'],
    faqs: [
      { question: 'When is the 5-digit generator used?', answer: 'It is ideal for bumper lottery series analysis and 5-digit permutation wheels.' }
    ]
  },
  {
    id: 'board',
    name: 'Board',
    country: 'Kerala & India',
    region: 'Kerala',
    flag: '🇮🇳',
    mode: 'box',
    seoTitle: 'Kerala Lottery Board A B C Lucky Number Generator 2026',
    seoDescription: 'Generate Position A, Position B, and Position C board combinations for Kerala Lottery daily guessing. Smart ABC board wheeling simulator.',
    h1Title: 'Kerala Lottery Board A B C Generator',
    keywords: ['kerala lottery board guessing', 'a board b board c board generator', 'kl board guessing number', 'abc board lucky number generator'],
    faqs: [
      { question: 'What is Board A, B, C guessing?', answer: 'In Kerala Lotteries, Board A represents the hundredth digit, Board B the tenth digit, and Board C the unit digit of 3-digit prize numbers.' }
    ]
  },
  {
    id: 'all-possible',
    name: 'All Possible',
    country: 'Global',
    region: 'Global',
    flag: '🌐',
    mode: 'box',
    seoTitle: 'All Possible Combinations Generator 2026 | Lottery Box Permutations',
    seoDescription: 'Generate all possible permutations and variations for any 2, 3, 4, or 5-digit lottery number. Full mathematical box combination calculator.',
    h1Title: 'All Possible Lottery Combinations Generator',
    keywords: ['all possible combinations generator', 'lottery permutations calculator', 'box number generator all possible', 'lottery combinations generator'],
    faqs: [
      { question: 'What does All Possible generate?', answer: 'It calculates every mathematically possible reordering of your entered digits without omissions.' }
    ]
  },
  {
    id: 'previous-result',
    name: 'Previous Result',
    country: 'Global',
    region: 'Global',
    flag: '📊',
    mode: 'previous-result',
    seoTitle: 'Previous Result Pattern Generator 2026 | Smart Lottery Predictor',
    seoDescription: 'Enter past winning numbers to calculate adjacent numbers, recurring mirror numbers, and algorithmic predictions for upcoming draws.',
    h1Title: 'Previous Result Lottery Pattern Predictor',
    keywords: ['previous result pattern generator', 'lottery past winning numbers algorithm', 'smart lottery prediction based on results'],
    faqs: [
      { question: 'How does the Previous Result mode work?', answer: 'It analyzes your entered past winning ticket and generates complementary adjacent and hot/cold variations.' }
    ]
  },

  // --- PICK 2 TO PICK 7 (Universal Pick Lotteries) ---
  {
    id: 'pick-2',
    name: 'Pick 2',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 2,
    mainRange: [0, 9],
    seoTitle: 'Pick 2 Lucky Number Generator 2026 | 2 Digit Daily Lottery Tool',
    seoDescription: 'Generate random 2-digit combinations (0-9) for daily Pick 2 lottery draws across the US and Canada.',
    h1Title: 'Pick 2 Lucky Number Generator',
    keywords: ['pick 2 lucky number generator', 'pick 2 generator', 'daily 2 lottery picker'],
    faqs: [{ question: 'How is Pick 2 played?', answer: 'Pick 2 selects 2 numbers between 0 and 9 with replacement.' }]
  },
  {
    id: 'pick-3',
    name: 'Pick 3',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 3,
    mainRange: [0, 9],
    seoTitle: 'Pick 3 Lucky Number Generator 2026 | Daily 3 Winning Number Picker',
    seoDescription: 'Generate Pick 3 lucky numbers (0-9) for midday and evening draws. Box, straight, and pair probability generator.',
    h1Title: 'Pick 3 Lucky Number Generator',
    keywords: ['pick 3 lucky number generator', 'pick 3 numbers today', 'pick 3 generator straight box', 'daily pick 3 predictor'],
    faqs: [{ question: 'How does Pick 3 generator work?', answer: 'It selects three digits from 0 to 9, allowing duplicates just like official lottery machines.' }]
  },
  {
    id: 'pick-4',
    name: 'Pick 4',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 4,
    mainRange: [0, 9],
    seoTitle: 'Pick 4 Lucky Number Generator 2026 | 4 Digit Midday & Evening Picker',
    seoDescription: 'Generate random 4-digit winning combinations (0-9) for daily Pick 4 lottery draws.',
    h1Title: 'Pick 4 Lucky Number Generator',
    keywords: ['pick 4 lucky number generator', 'pick 4 numbers today', 'pick 4 generator', 'daily 4 lottery tool'],
    faqs: [{ question: 'How does Pick 4 work?', answer: 'It randomly produces 4 digits from 0 to 9 with options for straight and box play.' }]
  },
  {
    id: 'pick-5',
    name: 'Pick 5',
    country: 'United States & Canada',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [0, 9],
    seoTitle: 'Pick 5 Lucky Number Generator 2026 | 5 Digit Daily Numbers Tool',
    seoDescription: 'Generate 5-digit combinations from 0 to 9 for Pick 5 games in Florida, Pennsylvania, Ohio, and Virginia.',
    h1Title: 'Pick 5 Lucky Number Generator',
    keywords: ['pick 5 lucky number generator', 'pick 5 generator', 'florida pick 5 numbers today'],
    faqs: [{ question: 'What is Pick 5 format?', answer: 'Selects 5 independent digits from 0 to 9.' }]
  },
  {
    id: 'pick-6',
    name: 'Pick 6',
    country: 'United States & Global',
    region: 'USA',
    flag: '🇺🇸',
    mode: 'standard',
    mainBalls: 6,
    mainRange: [1, 46],
    seoTitle: 'Pick 6 Lucky Number Generator 2026 | 6/46 Jackpot Number Picker',
    seoDescription: 'Generate 6 random numbers from 1 to 46 for classic Pick 6 lotto games.',
    h1Title: 'Pick 6 Lucky Number Generator',
    keywords: ['pick 6 lucky number generator', 'pick 6 generator', 'new jersey pick 6 lotto'],
    faqs: [{ question: 'How is Pick 6 played?', answer: 'Generates 6 non-repeating numbers from 1 to 46.' }]
  },
  {
    id: 'pick-7',
    name: 'Pick 7',
    country: 'Global',
    region: 'Global',
    flag: '🌐',
    mode: 'standard',
    mainBalls: 7,
    mainRange: [1, 50],
    seoTitle: 'Pick 7 Lucky Number Generator 2026 | 7 Ball Lotto Predictor',
    seoDescription: 'Generate 7 random numbers from 1 to 50 for global 7-ball lotteries.',
    h1Title: 'Pick 7 Lucky Number Generator',
    keywords: ['pick 7 lucky number generator', 'pick 7 lotto numbers'],
    faqs: [{ question: 'How is Pick 7 played?', answer: 'Generates 7 numbers from 1 to 50.' }]
  },

  // --- MIDDLE EAST & OTHER GLOBAL LOTTERIES ---
  {
    id: 'mahzooz',
    name: 'Mahzooz',
    country: 'United Arab Emirates (UAE)',
    region: 'Global',
    flag: '🇦🇪',
    mode: 'standard',
    mainBalls: 5,
    mainRange: [1, 49],
    seoTitle: 'Mahzooz UAE Lucky Number Generator 2026 | Dubai Lotto Picker',
    seoDescription: 'Generate 5 winning numbers from 1 to 49 for Mahzooz and UAE national draws.',
    h1Title: 'Mahzooz UAE Lucky Number Generator',
    keywords: ['mahzooz lucky number generator', 'uae lottery numbers generator', 'dubai lottery lucky numbers'],
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
    seoTitle: 'Fast 5 UAE Lucky Number Generator 2026 | Emirates Draw Tool',
    seoDescription: 'Generate 5 numbers from 1 to 42 for Emirates Draw Fast 5 weekly competitions.',
    h1Title: 'Fast 5 UAE Lucky Number Generator',
    keywords: ['fast 5 lucky number generator', 'emirates draw fast 5 numbers'],
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
    seoTitle: 'Easy 6 UAE Lucky Number Generator 2026 | Emirates Draw Easy 6',
    seoDescription: 'Generate 6 random numbers from 1 to 39 for Emirates Draw Easy 6.',
    h1Title: 'Easy 6 UAE Lucky Number Generator',
    keywords: ['easy 6 lucky number generator', 'emirates draw easy 6'],
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
    seoTitle: 'Mega 7 UAE Lucky Number Generator 2026 | 100M AED Grand Prize',
    seoDescription: 'Generate 7 random numbers from 1 to 37 for Emirates Draw Mega 7.',
    h1Title: 'Mega 7 UAE Lucky Number Generator',
    keywords: ['mega 7 lucky number generator', 'emirates draw mega 7 numbers'],
    faqs: [{ question: 'What is Mega 7 format?', answer: 'Selects 7 numbers from 1 to 37.' }]
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
    seoTitle: 'NZ Lotto Lucky Number Generator 2026 | New Zealand Lotto Picker',
    seoDescription: 'Generate random NZ Lotto numbers (6 balls from 1-40) for New Zealand Wednesday and Saturday night draws.',
    h1Title: 'New Zealand Lotto Lucky Number Generator',
    keywords: ['nz lotto lucky number generator', 'new zealand lotto quick pick', 'lotto nz numbers generator'],
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
    seoTitle: 'NZ Powerball Lucky Number Generator 2026 | New Zealand Jackpot Picker',
    seoDescription: 'Generate winning NZ Powerball numbers (6 balls 1-40 + 1 Powerball 1-10) for New Zealand national draws.',
    h1Title: 'New Zealand Powerball Lucky Number Generator',
    keywords: ['nz powerball lucky number generator', 'new zealand powerball picker', 'lotto nz powerball generator'],
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
    seoTitle: 'NZ Keno Lucky Number Generator 2026 | New Zealand 80-Ball Picker',
    seoDescription: 'Generate up to 10 Keno spots from 1 to 80 for New Zealand daily Lotto NZ Keno draws.',
    h1Title: 'New Zealand Keno Lucky Number Generator',
    keywords: ['nz keno lucky number generator', 'new zealand keno picker', 'keno nz quick pick'],
    faqs: [{ question: 'How does NZ Keno work?', answer: 'Twenty numbers are drawn from 1 to 80 four times daily; players pick up to 10 spots.' }]
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
    seoTitle: 'South Africa Lotto Lucky Number Generator 2026 | SA Lotto Picker',
    seoDescription: 'Generate SA Lotto, Lotto Plus 1, and Lotto Plus 2 combinations (6 balls from 1-52) for Wednesday and Saturday draws.',
    h1Title: 'South Africa Lotto Lucky Number Generator',
    keywords: ['sa lotto lucky number generator', 'south africa lotto quick pick', 'ithuba lotto numbers generator'],
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
    seoTitle: 'SA PowerBall Lucky Number Generator 2026 | South Africa PowerBall Picker',
    seoDescription: 'Generate SA PowerBall & PowerBall Plus numbers (5 balls 1-50 + 1 PowerBall 1-20) for Tuesday and Friday draws.',
    h1Title: 'South Africa PowerBall Lucky Number Generator',
    keywords: ['sa powerball lucky number generator', 'south africa powerball quick pick', 'powerball plus sa generator'],
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
    seoTitle: 'SA Daily Lotto Lucky Number Generator 2026 | South Africa 5/36 Picker',
    seoDescription: 'Generate daily South Africa Daily Lotto numbers (5 balls from 1-36) for every nightly 9 PM SAST drawing.',
    h1Title: 'South Africa Daily Lotto Lucky Number Generator',
    keywords: ['sa daily lotto lucky number generator', 'daily lotto quick pick south africa', 'daily lotto 5/36 generator'],
    faqs: [{ question: 'How does SA Daily Lotto work?', answer: 'Selects 5 numbers from 1 to 36 drawn every night with guaranteed daily payouts.' }]
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
    seoTitle: 'Nigeria Mega Jackpot Lucky Number Generator 2026 | Naija Lotto Picker',
    seoDescription: 'Generate Nigeria Mega Jackpot numbers (5 main balls 1-50 + 2 bonus balls) for Wednesday and Saturday night draws.',
    h1Title: 'Nigeria Mega Jackpot Lucky Number Generator',
    keywords: ['nigeria mega jackpot generator', 'nigeria lotto lucky numbers', 'naija mega jackpot picker'],
    faqs: [{ question: 'How does Nigeria Mega Jackpot work?', answer: 'Selects 5 main balls from 1 to 50 and 2 bonus numbers.' }]
  },

  // --- GENERAL NUMBER & CUSTOM PICKER ---
  {
    id: 'lucky-number',
    name: 'Lucky Number',
    country: 'Universal',
    region: 'Global',
    flag: '⭐',
    mode: 'number-random',
    mainRange: [1, 50],
    seoTitle: 'Lucky Number Generator 2026 | Random Winning Numbers Simulator',
    seoDescription: 'Free Universal Lucky Number Generator. Pick quick random lucky numbers with custom ranges, odd/even filters, and zero duplicate options.',
    h1Title: 'Universal Lucky Number Generator',
    keywords: ['lucky number generator', 'random number picker', 'today lucky numbers', 'winning numbers simulator', 'daily lucky number generator'],
    faqs: [
      { question: 'Can I customize the range?', answer: 'Yes! You can customize any start and end range with odd/even and duplicate filters.' }
    ]
  },
  {
    id: 'digit',
    name: 'Digit',
    country: 'Universal',
    region: 'Global',
    flag: '🔢',
    mode: 'digit-random',
    seoTitle: 'Random Digit Generator 2026 | 1 to 10 Digit Lottery Picker',
    seoDescription: 'Generate random numbers of any length from 1 digit up to 10 digits for lotteries, pin codes, and guessing numbers.',
    h1Title: 'Random Digit Lottery Generator',
    keywords: ['random digit generator', 'digit lottery picker', 'random 3 digit 4 digit picker'],
    faqs: [{ question: 'What digit lengths are supported?', answer: 'Supports any digit length from 1 through 10 digits.' }]
  },
  {
    id: 'custom',
    name: 'Custom',
    country: 'Universal',
    region: 'Global',
    flag: '⚙️',
    mode: 'custom',
    seoTitle: 'Create Your Own Lottery Generator 2026 | Custom Game Simulator',
    seoDescription: 'Build your own custom lottery rules. Set main ball count, main range, bonus special balls, and generate tickets tailored to any game in the world.',
    h1Title: 'Create Your Own Custom Lottery Generator',
    keywords: ['custom lottery generator', 'create your own lottery', 'lottery simulator custom balls', 'bonus ball lottery maker'],
    faqs: [
      { question: 'Can I simulate any world lottery?', answer: 'Yes, define any number of main balls (1-10), maximum ball range (1-100), and bonus ball rules.' }
    ]
  }
];

export function getCategoryById(id: string): LotteryCategory | undefined {
  return CATEGORIES.find(c => c.id.toLowerCase() === id.toLowerCase());
}
