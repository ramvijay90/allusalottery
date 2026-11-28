import { LotteryCategory } from '@/lib/lotteryCategories';

export interface GameGeneratorPreset {
  category: LotteryCategory;
  matchedHubId?: string;
  hotNumbers: number[];
  overdueNumbers: number[];
}

const FLAG_BY_COUNTRY: Record<string, string> = {
  USA: '🇺🇸',
  US: '🇺🇸',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  Europe: '🇪🇺',
  'New Zealand': '🇳🇿',
  Africa: '🇿🇦',
  'South Africa': '🇿🇦',
};

function resolveRegion(country?: string, stateSlug?: string): LotteryCategory['region'] {
  const c = (country || 'US').toLowerCase();
  if (c === 'canada') return 'Canada';
  if (c === 'australia') return 'Australia';
  if (c === 'europe') return 'Europe';
  if (c === 'new zealand') return 'New Zealand';
  if (c === 'africa' || c === 'south africa' || stateSlug === 'ng') return 'Africa';
  return 'USA';
}

function roundUpPoolMax(maxSeen: number): number {
  const standardCeilings = [9, 10, 20, 26, 30, 35, 36, 39, 40, 42, 43, 45, 46, 47, 48, 49, 50, 52, 54, 59, 60, 69, 70, 75, 80, 90, 99];
  for (const cap of standardCeilings) {
    if (maxSeen <= cap) return cap;
  }
  return Math.max(maxSeen, 50);
}

/**
 * Resolves official ball counts, ranges, special ball pools, matching generator hub ID,
 * and historical hot/overdue numbers for any live game route (/results/[stateSlug]/[gameSlug]/lucky-numbers).
 */
export function buildGameGeneratorPreset(params: {
  stateName: string;
  stateSlug: string;
  country?: string;
  gameName: string;
  gameSlug: string;
  history?: Array<{ numbers?: string[]; powerBall?: string }>;
}): GameGeneratorPreset {
  const { stateName, stateSlug, country, gameName, gameSlug, history = [] } = params;
  const gSlug = gameSlug.toLowerCase();
  const sSlug = stateSlug.toLowerCase();
  const gLower = gameName.toLowerCase();
  const region = resolveRegion(country, sSlug);
  const flag = sSlug === 'ng' ? '🇳🇬' : sSlug.startsWith('uk') ? '🇬🇧' : sSlug === 'ie' ? '🇮🇪' : sSlug === 'fr' ? '🇫🇷' : sSlug === 'it' ? '🇮🇹' : sSlug.startsWith('es') ? '🇪🇸' : sSlug === 'eu-de' || sSlug === 'de-by' ? '🇩🇪' : (FLAG_BY_COUNTRY[country || 'US'] || '🇺🇸');

  let mainBalls = 5;
  let mainRange: [number, number] = [1, 49];
  let specialBalls: number | undefined;
  let specialRange: [number, number] | undefined;
  let specialName: string | undefined;
  let matchedHubId: string | undefined;

  if (/^powerball-australia|^oz-powerball/.test(gSlug) || (region === 'Australia' && /powerball/.test(gLower))) {
    mainBalls = 7; mainRange = [1, 35]; specialBalls = 1; specialRange = [1, 20]; specialName = 'Powerball'; matchedHubId = 'oz-powerball';
  } else if (/^sa-powerball/.test(gSlug) || (sSlug === 'za' && /powerball/.test(gLower))) {
    mainBalls = 5; mainRange = [1, 50]; specialBalls = 1; specialRange = [1, 20]; specialName = 'PowerBall'; matchedHubId = 'sa-powerball';
  } else if (/^nz-powerball/.test(gSlug) || (sSlug === 'nz' && /powerball/.test(gLower))) {
    mainBalls = 6; mainRange = [1, 40]; specialBalls = 1; specialRange = [1, 10]; specialName = 'Powerball'; matchedHubId = 'nz-powerball';
  } else if (/powerball/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 69]; specialBalls = 1; specialRange = [1, 26]; specialName = 'Powerball'; matchedHubId = 'powerball';
  } else if (/mega-millions/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 70]; specialBalls = 1; specialRange = [1, 25]; specialName = 'Mega Ball'; matchedHubId = 'mega-millions';
  } else if (/lotto-america/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 52]; specialBalls = 1; specialRange = [1, 10]; specialName = 'Star Ball'; matchedHubId = 'lotto-america';
  } else if (/cash-?4-?life/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 60]; specialBalls = 1; specialRange = [1, 4]; specialName = 'Cash Ball'; matchedHubId = 'cash-life';
  } else if (/lucky-for-life/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 48]; specialBalls = 1; specialRange = [1, 18]; specialName = 'Lucky Ball'; matchedHubId = 'lucky-life';
  } else if (/2by2|2-by-2/.test(gSlug)) {
    mainBalls = 2; mainRange = [1, 26]; specialBalls = 2; specialRange = [1, 26]; specialName = 'White Balls'; matchedHubId = '2by2';
  } else if (/lotto-max|western-max|ontario-max|quebec-max/.test(gSlug)) {
    mainBalls = 7; mainRange = [1, 50]; matchedHubId = 'lotto-max';
  } else if (/canada-lotto-6-49|lotto-649|ontario-49|western-649|atlantic-49|quebec-49/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 49]; specialBalls = 1; specialRange = [1, 49]; specialName = 'Bonus'; matchedHubId = 'canada-649';
  } else if (/bc-49/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 49]; matchedHubId = 'bc-49';
  } else if (/daily-grand/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 49]; specialBalls = 1; specialRange = [1, 7]; specialName = 'Grand Number'; matchedHubId = 'daily-grand';
  } else if (/lottario/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 45]; matchedHubId = 'lottario';
  } else if (/euromillions|euro-millions/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 50]; specialBalls = 2; specialRange = [1, 12]; specialName = 'Lucky Star'; matchedHubId = 'euro-millions';
  } else if (/eurojackpot|euro-jackpot/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 50]; specialBalls = 2; specialRange = [1, 12]; specialName = 'Euro Number'; matchedHubId = 'euro-jackpot';
  } else if (/uk-lotto/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 59]; matchedHubId = 'lotto-uk-eur';
  } else if (/uk-49|49s/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 49]; specialBalls = 1; specialRange = [1, 49]; specialName = 'Booster'; matchedHubId = 'uk-49s';
  } else if (/thunderball/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 39]; specialBalls = 1; specialRange = [1, 14]; specialName = 'Thunderball'; matchedHubId = 'thunderball';
  } else if (/set-for-life/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 47]; specialBalls = 1; specialRange = [1, 10]; specialName = 'Life Ball'; matchedHubId = 'set-life';
  } else if (/irish-lotto/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 47]; specialBalls = 1; specialRange = [1, 47]; specialName = 'Bonus'; matchedHubId = 'irish-lotto';
  } else if (/superenalotto/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 90]; matchedHubId = 'superenalotto';
  } else if (/french-loto|loto-fr/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 49]; specialBalls = 1; specialRange = [1, 10]; specialName = 'Chance'; matchedHubId = 'french-loto';
  } else if (/la-primitiva/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 49]; specialBalls = 1; specialRange = [0, 9]; specialName = 'Reintegro'; matchedHubId = 'la-primitiva';
  } else if (/oz-lotto/.test(gSlug)) {
    mainBalls = 7; mainRange = [1, 47]; matchedHubId = 'oz-lotto';
  } else if (/tatts|saturday-lotto|gold-lotto|x-lotto/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 45]; matchedHubId = 'tatts';
  } else if (/weekday-windfall|monday-lotto|wednesday-lotto/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 45]; matchedHubId = 'monday-wednesday-lotto';
  } else if (/nz-lotto/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 40]; specialBalls = 1; specialRange = [1, 40]; specialName = 'Bonus Ball'; matchedHubId = 'nz-lotto';
  } else if (/nz-keno/.test(gSlug)) {
    mainBalls = 10; mainRange = [1, 80]; matchedHubId = 'nz-keno';
  } else if (/sa-lotto/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 52]; specialBalls = 1; specialRange = [1, 52]; specialName = 'Bonus Ball'; matchedHubId = 'sa-lotto';
  } else if (/sa-daily-lotto/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 36]; matchedHubId = 'sa-daily-lotto';
  } else if (/ng-mega-jackpot/.test(gSlug)) {
    mainBalls = 5; mainRange = [1, 50]; specialBalls = 2; specialRange = [1, 12]; specialName = 'Power Numbers'; matchedHubId = 'ng-mega-jackpot';
  } else if (/pick-?2|daily-?2|numbers-?2/.test(gSlug)) {
    mainBalls = 2; mainRange = [0, 9]; matchedHubId = 'pick-2';
  } else if (/pick-?3|cash-?3|daily-?3|dc-3|play-?3|numbers/.test(gSlug)) {
    mainBalls = 3; mainRange = [0, 9]; matchedHubId = 'pick-3';
  } else if (/pick-?4|cash-?4|daily-?4|win-?4|dc-4|play-?4/.test(gSlug)) {
    mainBalls = 4; mainRange = [0, 9]; matchedHubId = 'pick-4';
  } else if (/pick-?5|daily-?5|dc-5|play-?5/.test(gSlug)) {
    mainBalls = 5; mainRange = [0, 9]; matchedHubId = 'pick-5';
  } else if (/pick-?6/.test(gSlug)) {
    mainBalls = 6; mainRange = [1, 46]; matchedHubId = 'pick-6';
  } else if (/keno|banco/.test(gSlug)) {
    mainBalls = 20; mainRange = [1, 80]; matchedHubId = 'keno';
  } else {
    // Intelligent fallback inferred from stored database draw history
    const numericMainCounts: number[] = [];
    let maxSeen = 0;
    let minSeen = 999;
    let specialCount = 0;
    let maxSpecial = 0;

    for (const row of history.slice(0, 30)) {
      const parsed = (row.numbers || [])
        .map((n) => parseInt(String(n).replace(/[^0-9]/g, ''), 10))
        .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 999);
      if (parsed.length > 0) {
        numericMainCounts.push(parsed.length);
        for (const v of parsed) {
          if (v > maxSeen) maxSeen = v;
          if (v < minSeen) minSeen = v;
        }
      }
      if (row.powerBall) {
        const pbParts = String(row.powerBall).split(/[\s,|-]+/).filter(Boolean);
        const nums = pbParts.map((p) => parseInt(p.replace(/[^0-9]/g, ''), 10)).filter((n) => !Number.isNaN(n));
        if (nums.length > 0) {
          specialCount = Math.max(specialCount, nums.length);
          for (const sv of nums) {
            if (sv > maxSpecial) maxSpecial = sv;
          }
        }
      }
    }

    if (numericMainCounts.length > 0) {
      mainBalls = Math.min(20, Math.max(1, numericMainCounts[0]));
      const looksLikeDigits = maxSeen <= 9 && minSeen === 0;
      mainRange = looksLikeDigits ? [0, 9] : [1, roundUpPoolMax(maxSeen || 49)];
      matchedHubId = looksLikeDigits && mainBalls >= 2 && mainBalls <= 5 ? `pick-${mainBalls}` : 'lucky-number';
    }
    if (specialCount > 0 && maxSpecial > 0) {
      specialBalls = Math.min(2, specialCount);
      specialRange = [1, roundUpPoolMax(maxSpecial)];
      specialName = 'Bonus';
    }
  }

  // Extract Hot & Overdue Main Balls from recent draws (pure numeric integer pools only)
  const freq = new Map<number, number>();
  const lastSeenIdx = new Map<number, number>();
  const recentWindow = history.slice(0, 50);

  recentWindow.forEach((draw, idx) => {
    for (const raw of draw.numbers || []) {
      if (!/^\d+$/.test(String(raw).trim())) continue;
      const val = parseInt(String(raw).trim(), 10);
      if (val < mainRange[0] || val > mainRange[1]) continue;
      freq.set(val, (freq.get(val) || 0) + 1);
      if (!lastSeenIdx.has(val)) lastSeenIdx.set(val, idx);
    }
  });

  const hotNumbers = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, 6)
    .map(([num]) => num);

  const overdueCandidates: { num: number; age: number }[] = [];
  if (mainRange[1] - mainRange[0] <= 90 && recentWindow.length > 0) {
    for (let v = mainRange[0]; v <= mainRange[1]; v++) {
      overdueCandidates.push({
        num: v,
        age: lastSeenIdx.has(v) ? lastSeenIdx.get(v)! : recentWindow.length + 1,
      });
    }
  }
  const overdueNumbers = overdueCandidates
    .sort((a, b) => b.age - a.age || a.num - b.num)
    .slice(0, 6)
    .map((c) => c.num);

  const category: LotteryCategory = {
    id: `${sSlug}-${gSlug}`,
    name: `${stateName} ${gameName}`,
    country: country || 'United States',
    region,
    flag,
    mode: 'standard',
    mainBalls,
    mainRange,
    ...(specialBalls && specialRange ? { specialBalls, specialRange, specialName } : {}),
    seoTitle: `${stateName} ${gameName} Lucky Numbers & Quick Pick Generator`,
    seoDescription: `Generate lucky numbers and random quick picks for ${stateName} ${gameName} (${mainBalls} balls from ${mainRange[0]} to ${mainRange[1]}).`,
    h1Title: `${stateName} ${gameName} Lucky Number Generator`,
    keywords: [
      `${gameName} lucky number generator`,
      `${gameName} lucky numbers`,
      `${stateName} ${gameName} quick pick`,
      `pick my ${gameName} numbers`,
      'lottery number generator',
      'lottery number picker',
    ],
    faqs: [],
  };

  return {
    category,
    matchedHubId,
    hotNumbers,
    overdueNumbers,
  };
}
