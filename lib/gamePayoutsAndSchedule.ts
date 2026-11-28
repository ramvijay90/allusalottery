export interface PrizeTier {
  match: string;
  prize: string;
  odds: string;
  multiplierEligible?: boolean;
}

export interface RelatedSchemeVariant {
  label: string;
  slug: string;
  badge: string;
}

export interface GamePayoutAndScheduleInfo {
  gameLabel: string;
  drawDaysTime: string;
  cutoffNote: string;
  multiplierNote: string;
  supportsCashOption: boolean;
  overallOdds?: string;
  tiers: PrizeTier[];
  relatedVariants: RelatedSchemeVariant[];
  seoKeywordBoosters: string[];
}

/**
 * Computes a conservative pre-tax lump-sum cash estimate (~46% benchmark) solely as
 * informational context on multi-million annuity jackpots.
 */
export function estimateCashOptionLabel(jackpotStr?: string): string | null {
  if (!jackpotStr) return null;
  const clean = jackpotStr.trim();
  const m = clean.match(/(\$|A\$|CA\$|NZ\$|€|£|R)\s*([\d,.]+)\s*(Million|Billion|M|B)/i);
  if (!m) return null;
  const currency = m[1];
  const rawNum = parseFloat(m[2].replace(/,/g, ''));
  if (Number.isNaN(rawNum) || rawNum <= 0) return null;
  const unitRaw = m[3].toUpperCase();
  const isBillion = unitRaw === 'BILLION' || unitRaw === 'B';
  const millionsValue = isBillion ? rawNum * 1000 : rawNum;
  const estCashMillions = Math.round(millionsValue * 0.46 * 10) / 10;
  return `Est. Cash Value (~${currency}${estCashMillions}M pre-tax benchmark)`;
}

export function getGamePayoutAndSchedule(
  gameSlug: string,
  gameName: string,
  stateSlug?: string,
  country?: string
): GamePayoutAndScheduleInfo {
  const gSlug = gameSlug.toLowerCase();
  const cLower = (country || 'US').toLowerCase();
  const sSlug = (stateSlug || '').toLowerCase();

  if (gSlug === 'powerball-double-play') {
    return {
      gameLabel: 'Powerball Double Play',
      drawDaysTime: 'Mon, Wed & Sat at 11:29 PM ET (immediately after main Powerball)',
      cutoffNote: 'Included automatically in participating states when Double Play add-on ($1) is selected.',
      multiplierNote: 'Fixed $10 Million top prize; Power Play multiplier does not apply to Double Play draws.',
      supportsCashOption: false,
      overallOdds: '1 in 24.87',
      tiers: [
        { match: '5 White Balls + Powerball', prize: '$10,000,000 Fixed Jackpot', odds: '1 in 292,201,338' },
        { match: '5 White Balls Only', prize: '$500,000', odds: '1 in 11,688,054' },
        { match: '4 White Balls + Powerball', prize: '$50,000', odds: '1 in 913,129' },
        { match: '4 White Balls Only', prize: '$500', odds: '1 in 36,525' },
        { match: '3 White Balls + Powerball', prize: '$500', odds: '1 in 14,494' },
        { match: '3 White Balls Only', prize: '$20', odds: '1 in 580' },
        { match: '2 White Balls + Powerball', prize: '$20', odds: '1 in 701' },
        { match: '1 White Ball + Powerball', prize: '$10', odds: '1 in 92' },
        { match: 'Powerball Only', prize: '$7', odds: '1 in 38' },
      ],
      relatedVariants: [{ label: 'Main Powerball Draw', slug: 'powerball', badge: 'Primary Jackpot' }],
      seoKeywordBoosters: ['powerball double play payouts', 'double play prize tiers', 'powerball double play odds', 'powerball winning numbers'],
    };
  }

  if (gSlug === 'powerball' && cLower === 'us') {
    return {
      gameLabel: 'Powerball',
      drawDaysTime: 'Monday, Wednesday & Saturday at 10:59 PM ET',
      cutoffNote: 'Ticket sales close 1–2 hours prior depending on state regulations (California excludes Power Play).',
      multiplierNote: 'Optional Power Play ($1 extra) boosts non-jackpot prizes 2X, 3X, 4X, 5X or 10X (when jackpot <= $150M). Optional Double Play available in select states.',
      supportsCashOption: true,
      overallOdds: '1 in 24.87',
      tiers: [
        { match: '5 White Balls + Powerball', prize: 'Grand Jackpot', odds: '1 in 292,201,338' },
        { match: '5 White Balls Only', prize: '$1,000,000 ($2M w/ Power Play)', odds: '1 in 11,688,054', multiplierEligible: true },
        { match: '4 White Balls + Powerball', prize: '$50,000', odds: '1 in 913,129', multiplierEligible: true },
        { match: '4 White Balls Only', prize: '$100', odds: '1 in 36,525', multiplierEligible: true },
        { match: '3 White Balls + Powerball', prize: '$100', odds: '1 in 14,494', multiplierEligible: true },
        { match: '3 White Balls Only', prize: '$7', odds: '1 in 580', multiplierEligible: true },
        { match: '2 White Balls + Powerball', prize: '$7', odds: '1 in 701', multiplierEligible: true },
        { match: '1 White Ball + Powerball', prize: '$4', odds: '1 in 92', multiplierEligible: true },
        { match: 'Powerball Only', prize: '$4', odds: '1 in 38', multiplierEligible: true },
      ],
      relatedVariants: [{ label: 'Powerball Double Play', slug: 'powerball-double-play', badge: '$10M Second Draw' }],
      seoKeywordBoosters: ['powerball payouts', 'powerball odds', 'power play multiplier', 'powerball cash option', 'did anyone win powerball'],
    };
  }

  if (gSlug === 'mega-millions' || gSlug === 'megamillions') {
    return {
      gameLabel: 'Mega Millions',
      drawDaysTime: 'Tuesday & Friday at 11:00 PM ET',
      cutoffNote: 'Sales close 15–60 minutes before draw depending on jurisdiction.',
      multiplierNote: 'Includes built-in Multiplier (2X, 3X, 4X, 5X, or 10X) automatically multiplying all non-jackpot prize tiers.',
      supportsCashOption: true,
      overallOdds: '1 in 23',
      tiers: [
        { match: '5 White Balls + Mega Ball', prize: 'Grand Jackpot', odds: '1 in 290,472,336' },
        { match: '5 White Balls Only', prize: '$1,000,000 Base (Up to $10M w/ 10X)', odds: '1 in 12,629,232', multiplierEligible: true },
        { match: '4 White Balls + Mega Ball', prize: '$10,000 Base (Up to $100K)', odds: '1 in 893,761', multiplierEligible: true },
        { match: '4 White Balls Only', prize: '$500 Base (Up to $5,000)', odds: '1 in 38,859', multiplierEligible: true },
        { match: '3 White Balls + Mega Ball', prize: '$200 Base (Up to $2,000)', odds: '1 in 13,965', multiplierEligible: true },
        { match: '3 White Balls Only', prize: '$10 Base (Up to $100)', odds: '1 in 607', multiplierEligible: true },
        { match: '2 White Balls + Mega Ball', prize: '$10 Base (Up to $100)', odds: '1 in 693', multiplierEligible: true },
        { match: '1 White Ball + Mega Ball', prize: '$7 Base (Up to $70)', odds: '1 in 89', multiplierEligible: true },
        { match: 'Mega Ball Only', prize: '$5 Base (Up to $50)', odds: '1 in 35', multiplierEligible: true },
      ],
      relatedVariants: [],
      seoKeywordBoosters: ['mega millions payouts', 'mega millions odds', 'mega millions cash option', 'did anyone win mega millions'],
    };
  }

  if (gSlug === 'cash-4-life' || gSlug === 'cash4life') {
    return {
      gameLabel: 'Cash4Life',
      drawDaysTime: 'Nightly (7 days a week) at 9:00 PM ET',
      cutoffNote: 'Top two tiers offer lifetime payments or lump-sum cash payouts.',
      multiplierNote: 'No multiplier add-on needed; fixed multi-tier lifetime & cash payouts.',
      supportsCashOption: false,
      overallOdds: '1 in 8',
      tiers: [
        { match: '5 Balls + Cash Ball', prize: '$1,000/Day for Life ($7M Cash)', odds: '1 in 21,846,048' },
        { match: '5 Balls Only', prize: '$1,000/Week for Life ($1M Cash)', odds: '1 in 7,282,016' },
        { match: '4 Balls + Cash Ball', prize: '$2,500', odds: '1 in 79,440' },
        { match: '4 Balls Only', prize: '$500', odds: '1 in 26,480' },
        { match: '3 Balls + Cash Ball', prize: '$100', odds: '1 in 1,471' },
      ],
      relatedVariants: [],
      seoKeywordBoosters: ['cash4life payouts', 'cash4life odds', 'cash ball prize tiers'],
    };
  }

  if (gSlug === 'lotto-max' || gSlug === 'lottomax') {
    return {
      gameLabel: 'Lotto Max',
      drawDaysTime: 'Tuesday & Friday at 10:30 PM ET (OLG, WCLC, BCLC, Loto-Québec, ALC)',
      cutoffNote: 'All Canadian lottery winnings are 100% tax-free from CRA; Maxmillions unlock at CA$50M+.',
      multiplierNote: 'Maxmillions ($1M extra draws) plus regional Encore / Extra / Tag add-ons available per province.',
      supportsCashOption: false,
      overallOdds: '1 in 7',
      tiers: [
        { match: '7 of 7 Numbers', prize: 'Main Jackpot (CA$10M–CA$80M)', odds: '1 in 33,294,800' },
        { match: '6 of 7 + Bonus', prize: 'Pari-mutuel Share (~2.5% Pool)', odds: '1 in 4,756,400' },
        { match: '6 of 7 Numbers', prize: 'Pari-mutuel Share (~2.5% Pool)', odds: '1 in 113,248' },
        { match: '5 of 7 + Bonus', prize: 'Pari-mutuel Cash Prize', odds: '1 in 37,749' },
        { match: '3 of 7 Numbers', prize: 'CA$20 Fixed / Free Play', odds: '1 in 8.5' },
      ],
      relatedVariants: [{ label: 'Canada Lotto 6/49', slug: 'canada-lotto-6-49', badge: 'Gold Ball Draw' }],
      seoKeywordBoosters: ['lotto max payouts', 'lotto max odds', 'maxmillions results', 'check olg lotto max'],
    };
  }

  if (gSlug.includes('6-49') || gSlug.includes('649')) {
    return {
      gameLabel: gameName,
      drawDaysTime: 'Wednesday & Saturday at 10:30 PM ET (Canada National Draw)',
      cutoffNote: 'Includes Classic $5M Fixed Jackpot (6/49) plus guaranteed Gold Ball draw.',
      multiplierNote: 'Gold Ball progressive jackpot + Encore / Extra / Tag add-ons.',
      supportsCashOption: false,
      overallOdds: '1 in 6.6',
      tiers: [
        { match: '6 of 6 Main Balls', prize: 'CA$5,000,000 Classic Jackpot', odds: '1 in 13,983,816' },
        { match: 'Gold Ball Draw', prize: 'CA$1M White Ball / CA$10M–$68M Gold Ball', odds: 'Guaranteed Winner Every Draw' },
        { match: '5 of 6 + Bonus', prize: 'Pari-mutuel Cash Prize', odds: '1 in 2,330,636' },
        { match: '5 of 6 Main Balls', prize: 'Pari-mutuel Cash Prize', odds: '1 in 55,491' },
        { match: '3 of 6 Main Balls', prize: 'CA$10', odds: '1 in 56.7' },
      ],
      relatedVariants: [{ label: 'Canada Lotto Max', slug: 'lotto-max', badge: '7/50 Jackpot' }],
      seoKeywordBoosters: ['lotto 649 payouts', 'gold ball prize breakdown', 'lotto 649 odds'],
    };
  }

  if (gSlug.includes('euromillions') || gSlug.includes('euro-millions')) {
    return {
      gameLabel: 'EuroMillions',
      drawDaysTime: 'Tuesday & Friday at 8:45 PM CET / 7:45 PM GMT',
      cutoffNote: 'Played across 9 European countries; UK entries include Millionaire Maker code.',
      multiplierNote: '13 prize tiers starting from 2 Main Numbers; tax-free in UK/Ireland/most nations.',
      supportsCashOption: false,
      overallOdds: '1 in 13',
      tiers: [
        { match: '5 Main + 2 Lucky Stars', prize: '€17M–€250M Jackpot', odds: '1 in 139,838,160' },
        { match: '5 Main + 1 Lucky Star', prize: 'Pari-mutuel (~€200K+)', odds: '1 in 6,991,908' },
        { match: '5 Main Numbers', prize: 'Pari-mutuel (~€20K+)', odds: '1 in 3,107,515' },
        { match: '4 Main + 2 Lucky Stars', prize: 'Pari-mutuel (~€1,500+)', odds: '1 in 621,503' },
        { match: '2 Main Numbers', prize: '~€4 / £2.50–£3.30', odds: '1 in 22' },
      ],
      relatedVariants: [{ label: 'EuroJackpot', slug: 'eurojackpot', badge: 'Pan-Europe' }],
      seoKeywordBoosters: ['euromillions prize breakdown', 'euromillions odds', 'lucky stars payouts'],
    };
  }

  if (gSlug === 'powerball-australia' || (cLower === 'australia' && /powerball/i.test(gameName))) {
    return {
      gameLabel: 'Powerball Australia',
      drawDaysTime: 'Every Thursday at 8:30 PM AEST (The Lott / Lotterywest)',
      cutoffNote: 'Australian lottery prizes are tax-free with 9 official dividend divisions.',
      multiplierNote: '7 Main Numbers (1–35) + 1 Powerball (1–20); PowerHit entries guarantee the Powerball.',
      supportsCashOption: false,
      overallOdds: '1 in 44',
      tiers: [
        { match: 'Div 1: 7 Main + Powerball', prize: 'A$4M–A$200M Division 1 Pool', odds: '1 in 134,490,400' },
        { match: 'Div 2: 7 Main Numbers', prize: 'Pari-mutuel Pool', odds: '1 in 7,078,442' },
        { match: 'Div 3: 6 Main + Powerball', prize: 'Pari-mutuel Pool', odds: '1 in 686,176' },
        { match: 'Div 9: 2 Main + Powerball', prize: 'Minimum Dividend Payout', odds: '1 in 66' },
      ],
      relatedVariants: [{ label: 'Oz Lotto', slug: 'oz-lotto', badge: 'Tuesday Draw' }],
      seoKeywordBoosters: ['powerball australia dividends', 'the lott prize breakdown', 'powerball divisions australia'],
    };
  }

  if (gSlug === 'sa-powerball' || gSlug === 'sa-powerball-plus') {
    return {
      gameLabel: gameName,
      drawDaysTime: 'Tuesday & Friday at 9:00 PM SAST (Ithuba National Lottery)',
      cutoffNote: 'All South African National Lottery winnings are exempt from personal income tax under SARS rules.',
      multiplierNote: 'Divisions 1–9 payout across 5 main balls (1–50) + PowerBall (1–20).',
      supportsCashOption: false,
      overallOdds: '1 in 18',
      tiers: [
        { match: 'Div 1: 5 Balls + PowerBall', prize: 'Rolling Jackpot', odds: '1 in 42,375,200' },
        { match: 'Div 2: 5 Main Balls', prize: 'Pari-mutuel Division 2', odds: '1 in 2,230,274' },
        { match: 'Div 3: 4 Balls + PowerBall', prize: 'Pari-mutuel Division 3', odds: '1 in 188,334' },
        { match: 'Div 9: PowerBall Only', prize: 'Fixed/Pari-mutuel Payout', odds: '1 in 35' },
      ],
      relatedVariants: [
        gSlug === 'sa-powerball'
          ? { label: 'SA PowerBall Plus', slug: 'sa-powerball-plus', badge: 'Second Draw' }
          : { label: 'SA PowerBall', slug: 'sa-powerball', badge: 'Main Draw' },
      ],
      seoKeywordBoosters: ['sa powerball dividends', 'ithuba powerball payouts', 'sa powerball plus results'],
    };
  }

  if (/pick-?3|cash-?3|daily-?3|dc-?3|play-?3/.test(gSlug)) {
    return {
      gameLabel: gameName,
      drawDaysTime: 'Midday & Evening Draws Daily',
      cutoffNote: '3 digits (0–9) with Straight, Box (3-Way / 6-Way), Front/Back Pair & Fireball/Wild Ball options.',
      multiplierNote: 'Standard fixed $1 play top payout is $500 (Straight) or $80–$160 (Box).',
      supportsCashOption: false,
      overallOdds: '1 in 167 (6-Way Box) to 1 in 1,000 (Straight)',
      tiers: [
        { match: 'Exact Order (Straight)', prize: '$500 (on $1 play)', odds: '1 in 1,000' },
        { match: 'Any Order (6-Way Box)', prize: '$80 (on $1 play)', odds: '1 in 167' },
        { match: 'Any Order (3-Way Box)', prize: '$160 (on $1 play)', odds: '1 in 333' },
        { match: 'Front / Back Pair', prize: '$50 (on $1 play)', odds: '1 in 100' },
      ],
      relatedVariants: [{ label: `${gameName.replace(/3/g, '4')} (4-Digit)`, slug: gSlug.replace(/3/g, '4'), badge: 'Up to $5,000' }],
      seoKeywordBoosters: [`${gameName} straight box payout`, `${gameName} odds`, `${gameName} fireball payout`],
    };
  }

  if (/pick-?4|cash-?4|daily-?4|win-?4|dc-?4|play-?4/.test(gSlug)) {
    return {
      gameLabel: gameName,
      drawDaysTime: 'Midday & Evening Draws Daily',
      cutoffNote: '4 digits (0–9) offering Straight ($5,000), 24-Way Box ($200) & 4/6/12-Way Box payouts.',
      multiplierNote: 'Select states include Fireball / Wild Ball add-on to double winning chances.',
      supportsCashOption: false,
      overallOdds: '1 in 417 (24-Way Box) to 1 in 10,000 (Straight)',
      tiers: [
        { match: 'Exact Order (Straight)', prize: '$5,000 (on $1 play)', odds: '1 in 10,000' },
        { match: 'Any Order (24-Way Box)', prize: '$200 (on $1 play)', odds: '1 in 417' },
        { match: 'Any Order (12-Way Box)', prize: '$400 (on $1 play)', odds: '1 in 833' },
        { match: 'Any Order (6-Way Box)', prize: '$800 (on $1 play)', odds: '1 in 1,667' },
        { match: 'Any Order (4-Way Box)', prize: '$1,200 (on $1 play)', odds: '1 in 2,500' },
      ],
      relatedVariants: [{ label: `${gameName.replace(/4/g, '3')} (3-Digit)`, slug: gSlug.replace(/4/g, '3'), badge: 'Daily 3' }],
      seoKeywordBoosters: [`${gameName} straight box payout`, `${gameName} prize odds`],
    };
  }

  // Universal clean fallback derived accurately for state & international games
  const variantMatches: RelatedSchemeVariant[] = [];
  if (sSlug === 'za' && gSlug === 'sa-lotto') {
    variantMatches.push(
      { label: 'SA Lotto Plus 1', slug: 'sa-lotto-plus-1', badge: 'Plus 1 Draw' },
      { label: 'SA Lotto Plus 2', slug: 'sa-lotto-plus-2', badge: 'Plus 2 Draw' }
    );
  } else if (sSlug === 'ie' && gSlug === 'irish-lotto') {
    variantMatches.push(
      { label: 'Irish Lotto Plus 1', slug: 'lotto-plus-1', badge: '€1M Draw' },
      { label: 'Irish Lotto Plus 2', slug: 'lotto-plus-2', badge: '€250K Draw' }
    );
  }

  return {
    gameLabel: gameName,
    drawDaysTime: `Verified Scheduled Official ${gameName} Drawings`,
    cutoffNote: 'Always verify draw closing times and prize division rules with the issuing official lottery commission.',
    multiplierNote: 'Supports official prize tiers, bonus/supplementary draws, and historical frequency tracking.',
    supportsCashOption: /million|billion/i.test(gameName) || cLower === 'us',
    tiers: [
      { match: 'Match All Winning Numbers', prize: 'Top Prize / Jackpot', odds: 'See Official Gazette' },
      { match: 'Match Second Tier / Bonus', prize: 'Secondary Cash Tier', odds: 'Published After Each Draw' },
      { match: 'Partial Number Matches', prize: 'Fixed Cash / Free Ticket', odds: 'Tiered by Jurisdiction' },
    ],
    relatedVariants: variantMatches,
    seoKeywordBoosters: [`${gameName} prize payouts`, `${gameName} winning odds`, `${gameName} next drawing time`],
  };
}
