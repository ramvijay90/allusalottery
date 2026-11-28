'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CATEGORIES, CategoryMode, LotteryCategory } from '@/lib/lotteryCategories';
import {
  RefreshCw,
  Copy,
  Trash2,
  Wand2,
  Share2,
  Facebook,
  Send,
  MessageCircle,
  ChevronDown,
  Download,
  Sparkles,
  Flame,
  Clock,
  Shuffle,
  Calendar,
  Hand,
} from 'lucide-react';

export interface GamePageGeneratorContext {
  stateName: string;
  stateSlug: string;
  gameName: string;
  gameSlug: string;
  hotNumbers?: number[];
  overdueNumbers?: number[];
  matchedHubId?: string;
}

interface LuckyGeneratorProps {
  initialCategoryId?: string;
  presetCategory?: LotteryCategory;
  gamePageContext?: GamePageGeneratorContext;
}

const TOOL_MODE_TABS = [
  { id: 'powerball', mode: 'standard' as CategoryMode, label: 'Quick Pick', href: '/lucky-number-generator' },
  { id: 'truly-lucky', mode: 'truly-lucky' as CategoryMode, label: 'Truly Lucky', href: '/lucky-number-generator/truly-lucky' },
  { id: 'numerology', mode: 'numerology' as CategoryMode, label: 'Numerology', href: '/lucky-number-generator/numerology' },
  { id: 'horoscope', mode: 'horoscope' as CategoryMode, label: 'Horoscopic', href: '/lucky-number-generator/horoscope' },
  { id: 'scrambler', mode: 'scrambler' as CategoryMode, label: 'Scrambler', href: '/lucky-number-generator/scrambler' },
  { id: 'all-possible', mode: 'box' as CategoryMode, label: 'Combinator', href: '/lucky-number-generator/all-possible' },
  { id: 'custom', mode: 'custom' as CategoryMode, label: 'Create Own', href: '/lucky-number-generator/custom' },
];

const REGION_TABS = [
  { id: 'All', label: 'All Lotteries' },
  { id: 'USA', label: '🇺🇸 USA' },
  { id: 'Canada', label: '🇨🇦 Canada' },
  { id: 'Europe', label: '🇪🇺 Europe & UK' },
  { id: 'Australia', label: '🇦🇺 Australia' },
  { id: 'NZ_AF', label: '🇳🇿 NZ & Africa' },
  { id: 'Format', label: '🎱 Formats (6/49, 5/90)' },
  { id: 'Digit', label: '🔢 Digit & Box' },
];

const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 – Apr 19', lucky: [1, 9, 17, 21, 36, 45, 54] },
  { id: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 – May 20', lucky: [2, 6, 15, 24, 33, 42, 60] },
  { id: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 – Jun 20', lucky: [3, 5, 14, 23, 32, 41, 59] },
  { id: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 – Jul 22', lucky: [2, 7, 11, 20, 29, 38, 47] },
  { id: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 – Aug 22', lucky: [1, 4, 10, 19, 28, 37, 64] },
  { id: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 – Sep 22', lucky: [5, 14, 23, 32, 41, 50, 68] },
  { id: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 – Oct 22', lucky: [6, 15, 24, 33, 42, 51, 69] },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 – Nov 21', lucky: [8, 9, 18, 27, 36, 45, 63] },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 – Dec 21', lucky: [3, 12, 21, 30, 39, 48, 57] },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 – Jan 19', lucky: [4, 8, 13, 22, 31, 40, 58] },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 – Feb 18', lucky: [4, 7, 11, 22, 29, 44, 61] },
  { id: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 – Mar 20', lucky: [3, 7, 12, 16, 25, 34, 52] },
];

function parseNumberList(input: string, minVal: number, maxVal: number): number[] {
  return Array.from(
    new Set(
      input
        .split(/[\s,;|-]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n) && n >= minVal && n <= maxVal)
    )
  );
}

function reducePythagorean(num: number): number {
  let n = Math.abs(num);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return n || 1;
}

function computeNumerologySeeds(fullName: string, birthDate: string, minVal: number, maxVal: number): number[] {
  const letters = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  let nameSum = 0;
  for (const ch of letters) {
    nameSum += ((ch.charCodeAt(0) - 65) % 9) + 1;
  }
  const dateDigits = birthDate.replace(/[^0-9]/g, '').split('').map((d) => parseInt(d, 10));
  const lifeSum = dateDigits.reduce((a, b) => a + b, 0);

  const core1 = reducePythagorean(lifeSum || 7);
  const core2 = reducePythagorean(nameSum || 9);
  const dayNum = parseInt(birthDate.split('-')[2] || '0', 10);
  const monthNum = parseInt(birthDate.split('-')[1] || '0', 10);

  const candidates = [
    core1,
    core2,
    core1 + core2,
    dayNum,
    monthNum,
    dayNum + monthNum,
    (core1 * 7) % (maxVal - minVal + 1) + minVal,
    (core2 * 9) % (maxVal - minVal + 1) + minVal,
  ];

  return Array.from(new Set(candidates.filter((n) => n >= minVal && n <= maxVal)));
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getCategoryRegionGroup(cat: LotteryCategory): string {
  if (cat.toolGroup === 'digit' || cat.region === 'Kerala') return 'Digit';
  if (cat.toolGroup === 'format' || cat.toolGroup === 'tool') return 'Format';
  if (cat.region === 'New Zealand' || cat.region === 'Africa') return 'NZ_AF';
  if (cat.region === 'Global') return 'Format';
  return cat.region;
}

export default function LuckyGenerator({ initialCategoryId, presetCategory, gamePageContext }: LuckyGeneratorProps) {
  const defaultCat = presetCategory
    ? presetCategory
    : initialCategoryId
      ? (CATEGORIES.find((c) => c.id.toLowerCase() === initialCategoryId.toLowerCase()) || CATEGORIES[0])
      : CATEGORIES[0];

  const [activeCategory] = useState<LotteryCategory>(defaultCat);
  const [localModeOverride, setLocalModeOverride] = useState<CategoryMode>(defaultCat.mode);
  const activeMode: CategoryMode = presetCategory ? localModeOverride : activeCategory.mode;

  // Region tab for clickable lottery URL bar on Hub pages
  const [regionTab, setRegionTab] = useState<string>(() => {
    if (presetCategory) return 'All';
    if (!initialCategoryId) return 'USA';
    return getCategoryRegionGroup(defaultCat);
  });

  // Standard / Shared Parameters
  const [ticketCount, setTicketCount] = useState(1);
  const [mainPickCount, setMainPickCount] = useState(defaultCat.mainBalls || 5);
  const [rangeFrom, setRangeFrom] = useState(defaultCat.mainRange?.[0] ?? 1);
  const [rangeTo, setRangeTo] = useState(defaultCat.mainRange?.[1] ?? 70);
  const [noRepeat, setNoRepeat] = useState(() => {
    const r = defaultCat.mainRange;
    return !(r && r[0] === 0 && r[1] === 9);
  });
  const [oddMode, setOddMode] = useState(false);
  const [evenMode, setEvenMode] = useState(false);

  // Include / Exclude Mix-and-Match (inspired by lotterynumbergenerator.net)
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  // Truly Lucky Touch Drum state
  const [drumPool, setDrumPool] = useState<number[]>([]);
  const [pickedTouchMain, setPickedTouchMain] = useState<number[]>([]);
  const [pickedTouchSpecial, setPickedTouchSpecial] = useState<number[]>([]);

  // Numerology state
  const [numName, setNumName] = useState('');
  const [numDob, setNumDob] = useState('1992-07-14');

  // Horoscope state
  const [zodiacId, setZodiacId] = useState('aries');

  // Scrambler state
  const [scramblerInput, setScramblerInput] = useState('3, 7, 11, 14, 19, 24, 28, 33, 39, 44, 49, 55, 62');
  const [scramblerPickLen, setScramblerPickLen] = useState(defaultCat.mainBalls || 6);

  // Box Strategy State
  const [boxInput, setBoxInput] = useState('');
  const [comboLength, setComboLength] = useState(3);

  // Previous Result State
  const [previousResultInput, setPreviousResultInput] = useState('');

  // Digit Random State
  const [digitLength, setDigitLength] = useState(3);

  // Results & UI Feedback State
  const [results, setResults] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Board Strategy State
  const [boards, setBoards] = useState<Record<string, string[]>>({});
  const boardNames = ['A', 'B', 'C', 'D', 'E'];
  const [activeBoardTab, setActiveBoardTab] = useState('A');
  const [boardType, setBoardType] = useState<number>(3);

  // Custom Category State
  const [customMainBalls, setCustomMainBalls] = useState(5);
  const [customMainMax, setCustomMainMax] = useState(69);
  const [customSpecialBalls, setCustomSpecialBalls] = useState(1);
  const [customSpecialMax, setCustomSpecialMax] = useState(26);

  // Sync defaults cleanly when category changes
  useEffect(() => {
    const rFrom = activeCategory.mainRange?.[0] ?? 1;
    const rTo = activeCategory.mainRange?.[1] ?? 50;
    const isZeroNinePick = rFrom === 0 && rTo === 9;

    setMainPickCount(activeCategory.mainBalls || 6);
    setRangeFrom(rFrom);
    setRangeTo(rTo);
    setNoRepeat(!isZeroNinePick);
    setOddMode(false);
    setEvenMode(false);
    setTicketCount(activeCategory.mode === 'number-random' ? 5 : 1);
    setScramblerPickLen(activeCategory.mainBalls || 6);

    if (activeCategory.mode === 'box') {
      setBoxInput('');
      setComboLength(activeCategory.customDigits || 3);
      const initial: Record<string, string[]> = {};
      const count = activeCategory.customDigits || (activeCategory.id === 'board' ? boardType : 3);
      for (let i = 0; i < count; i++) {
        initial[boardNames[i]] = [];
      }
      setBoards(initial);
      setActiveBoardTab('A');
      setTicketCount(activeCategory.id === 'board' ? 5 : 1);
    }

    setPickedTouchMain([]);
    setPickedTouchSpecial([]);
    setResults([]);
  }, [activeCategory]);

  // Keep Truly Lucky drum shuffled for the current pool range (when <= 90 balls)
  useEffect(() => {
    if (activeMode === 'truly-lucky') {
      const size = rangeTo - rangeFrom + 1;
      if (size > 0 && size <= 99) {
        const nums = Array.from({ length: size }, (_, i) => rangeFrom + i);
        setDrumPool(shuffleArray(nums));
      } else {
        setDrumPool([]);
      }
      setPickedTouchMain([]);
      setPickedTouchSpecial([]);
    }
  }, [activeMode, rangeFrom, rangeTo]);

  const filteredCategoryLinks = useMemo(() => {
    if (regionTab === 'All') return CATEGORIES;
    return CATEGORIES.filter((cat) => getCategoryRegionGroup(cat) === regionTab);
  }, [regionTab]);

  const generateSpecialBalls = (isCustom: boolean): number[] => {
    const specialNeed = isCustom ? customSpecialBalls : (activeCategory.specialBalls || 0);
    if (specialNeed <= 0) return [];
    const specMin = isCustom ? 1 : (activeCategory.specialRange?.[0] ?? 1);
    const specMax = isCustom ? customSpecialMax : (activeCategory.specialRange?.[1] ?? 25);
    const specPool: number[] = [];
    for (let x = specMin; x <= specMax; x++) specPool.push(x);

    if (specPool.length < specialNeed && noRepeat) return [];
    const spl: number[] = [];
    const mutable = [...specPool];
    for (let j = 0; j < specialNeed; j++) {
      const idx = Math.floor(Math.random() * mutable.length);
      spl.push(mutable[idx]);
      if (noRepeat) mutable.splice(idx, 1);
    }
    return spl.sort((a, b) => a - b);
  };

  const generateStandardLines = (extraSeeds: number[] = []) => {
    const lines: { main: number[]; special: number[] }[] = [];
    const isCustom = activeMode === 'custom';
    const needed = isCustom ? customMainBalls : (mainPickCount || activeCategory.mainBalls || 5);
    const minVal = isCustom ? 1 : rangeFrom;
    const maxVal = isCustom ? customMainMax : rangeTo;

    const included = [...extraSeeds, ...parseNumberList(includeInput, minVal, maxVal)];
    const excluded = new Set(parseNumberList(excludeInput, minVal, maxVal));

    const basePool: number[] = [];
    for (let x = minVal; x <= maxVal; x++) {
      if (excluded.has(x)) continue;
      if (oddMode && x % 2 === 0) continue;
      if (evenMode && x % 2 !== 0) continue;
      basePool.push(x);
    }

    if (basePool.length < needed && noRepeat) {
      alert('Not enough numbers in the pool for these include/exclude or odd/even filters!');
      return;
    }

    for (let i = 0; i < ticketCount; i++) {
      let pool = [...basePool];
      const line: number[] = [];

      // Mix user/numerology/zodiac included lucky numbers first
      const validIncluded = Array.from(new Set(included)).filter((n) => pool.includes(n));
      for (const inc of shuffleArray(validIncluded).slice(0, needed)) {
        line.push(inc);
        if (noRepeat) {
          pool = pool.filter((p) => p !== inc);
        }
      }

      while (line.length < needed && pool.length > 0) {
        const randIndex = Math.floor(Math.random() * pool.length);
        const val = pool[randIndex];
        line.push(val);
        if (noRepeat) {
          pool.splice(randIndex, 1);
        }
      }

      if (minVal === 0 && maxVal === 9) {
        // Keep draw order intact for Pick 2/3/4/5 digit draws
        lines.push({ main: line, special: generateSpecialBalls(isCustom) });
      } else {
        line.sort((a, b) => a - b);
        lines.push({ main: line, special: generateSpecialBalls(isCustom) });
      }
    }
    setResults(lines);
  };

  const generateNumberRandomLines = () => {
    const excluded = new Set(parseNumberList(excludeInput, rangeFrom, rangeTo));
    const pool: number[] = [];
    for (let j = rangeFrom; j <= rangeTo; j++) {
      if (excluded.has(j)) continue;
      if (oddMode && j % 2 === 0) continue;
      if (evenMode && j % 2 !== 0) continue;
      pool.push(j);
    }
    if (pool.length === 0) {
      alert(`No valid numbers exist in the range ${rangeFrom}-${rangeTo} with these constraints.`);
      return;
    }
    if (pool.length < ticketCount && noRepeat) {
      alert(`Cannot generate ${ticketCount} unique numbers from a pool of ${pool.length}.`);
      return;
    }

    const output: number[] = [];
    const currentPool = [...pool];

    for (let i = 0; i < ticketCount; i++) {
      const index = Math.floor(Math.random() * currentPool.length);
      if (noRepeat) {
        output.push(currentPool.splice(index, 1)[0]);
      } else {
        output.push(currentPool[index]);
      }
    }

    setResults([{ main: output.sort((a, b) => a - b) }]);
  };

  const generateScramblerLines = () => {
    const rawNums = Array.from(
      new Set(
        scramblerInput
          .split(/[\s,;|-]+/)
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n))
      )
    );

    if (rawNums.length < 2) {
      alert('Please enter at least 2 numbers separated by spaces or commas to scramble.');
      return;
    }
    const perLine = Math.min(Math.max(1, scramblerPickLen), rawNums.length);
    const lines: { main: number[]; special: number[] }[] = [];

    for (let i = 0; i < ticketCount; i++) {
      const shuffled = shuffleArray(rawNums).slice(0, perLine).sort((a, b) => a - b);
      lines.push({ main: shuffled, special: [] });
    }
    setResults(lines);
  };

  const generateNumerologyLines = () => {
    const seeds = computeNumerologySeeds(numName, numDob, rangeFrom, rangeTo);
    generateStandardLines(seeds);
  };

  const generateHoroscopeLines = () => {
    const sign = ZODIAC_SIGNS.find((s) => s.id === zodiacId) || ZODIAC_SIGNS[0];
    const validSeeds = sign.lucky.filter((n) => n >= rangeFrom && n <= rangeTo);
    generateStandardLines(validSeeds);
  };

  const commitTouchLine = (main: number[], special: number[]) => {
    const sortedMain = rangeFrom === 0 && rangeTo === 9 ? main : [...main].sort((a, b) => a - b);
    setResults((prev) => [{ main: sortedMain, special }, ...prev]);
  };

  const handleTouchBallSelect = (num: number) => {
    if (pickedTouchMain.includes(num)) return;
    const needed = mainPickCount || activeCategory.mainBalls || 6;
    const nextMain = [...pickedTouchMain, num];

    if (nextMain.length >= needed) {
      const spl = generateSpecialBalls(false);
      commitTouchLine(nextMain, spl);
      setPickedTouchMain([]);
      setPickedTouchSpecial([]);
      setDrumPool(shuffleArray(drumPool));
      setShowShareOptions(false);
    } else {
      setPickedTouchMain(nextMain);
    }
  };

  const handleDrawNextRandomTouchBall = () => {
    const needed = mainPickCount || activeCategory.mainBalls || 6;
    const remainingPool =
      drumPool.length > 0
        ? drumPool.filter((n) => !pickedTouchMain.includes(n))
        : Array.from({ length: Math.max(1, rangeTo - rangeFrom + 1) }, (_, i) => rangeFrom + i).filter(
            (n) => !pickedTouchMain.includes(n)
          );

    if (remainingPool.length === 0) return;
    const pick = remainingPool[Math.floor(Math.random() * remainingPool.length)];
    const nextMain = [...pickedTouchMain, pick];

    if (nextMain.length >= needed) {
      const spl = generateSpecialBalls(false);
      commitTouchLine(nextMain, spl);
      setPickedTouchMain([]);
      setPickedTouchSpecial([]);
      if (drumPool.length > 0) setDrumPool(shuffleArray(drumPool));
    } else {
      setPickedTouchMain(nextMain);
    }
  };

  const getKPermutations = (str: string, k: number): string[] => {
    if (k === 0) return [''];
    if (k === 1) return Array.from(new Set(str.split('')));

    const perms = new Set<string>();
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const remaining = str.slice(0, i) + str.slice(i + 1);
      for (const perm of getKPermutations(remaining, k - 1)) {
        perms.add(char + perm);
      }
    }
    return Array.from(perms);
  };

  const generateBoardLines = () => {
    if (activeCategory.id === 'all-possible') {
      if (!boxInput) return;
      if (boxInput.length < comboLength) {
        alert('Number pool must be at least as long as your combination digits.');
        return;
      }
      const perms = getKPermutations(boxInput, comboLength);
      setResults([{ box: perms }]);
      return;
    }

    if (activeCategory.id !== 'board') {
      const boardKeys = Object.keys(boards).sort();
      if (boardKeys.length === 0) return;

      const boardEntries = boardKeys.map((k) => boards[k] || []);
      if (boardEntries.some((arr) => arr.length === 0)) {
        alert('Please select at least one digit for each Board!');
        return;
      }

      const cartesian = (a: string[][]): string[][] =>
        a.reduce((acc, b) => acc.flatMap((d) => b.map((e) => [...d, e])), [[]] as string[][]);

      const permutations = cartesian(boardEntries);
      setResults([{ box: permutations.map((p) => p.join('')) }]);
      return;
    }

    const boardKeys = Object.keys(boards).sort();
    if (boardKeys.length === 0) return;

    const lockedBoardsSelections: string[][] = [];
    const lockedKeys: string[] = [];

    for (const key of boardKeys) {
      const choices = boards[key] && boards[key].length > 0 ? boards[key] : [];
      if (choices.length > 0) {
        lockedBoardsSelections.push(choices);
        lockedKeys.push(key);
      }
    }

    const cartesian = (a: string[][]): string[][] =>
      a.reduce((acc, b) => acc.flatMap((d) => b.map((e) => [...d, e])), [[]] as string[][]);

    const locks = lockedBoardsSelections.length > 0 ? cartesian(lockedBoardsSelections) : [[]];
    const lines: string[] = [];

    for (const lock of locks) {
      const lockMap: Record<string, string> = {};
      lock.forEach((val, idx) => {
        lockMap[lockedKeys[idx]] = val;
      });

      for (let i = 0; i < ticketCount; i++) {
        let attempts = 0;
        let validLine: string | null = null;
        while (attempts < 1000) {
          attempts++;
          let res = '';
          const usedInLine: string[] = [];

          for (const key of boardKeys) {
            if (lockMap[key] !== undefined) {
              res += lockMap[key];
              usedInLine.push(lockMap[key]);
            } else {
              const pool = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].filter(
                (c) => !noRepeat || !usedInLine.includes(c)
              );
              if (pool.length === 0) break;
              const digit = pool[Math.floor(Math.random() * pool.length)];
              res += digit;
              usedInLine.push(digit);
            }
          }

          if (res.length < boardKeys.length) continue;
          const lastDigit = parseInt(res.charAt(res.length - 1), 10);
          if (oddMode && lastDigit % 2 === 0) continue;
          if (evenMode && lastDigit % 2 !== 0) continue;
          if (noRepeat && lines.includes(res)) continue;

          validLine = res;
          break;
        }
        if (validLine) lines.push(validLine);
      }
    }

    if (lines.length === 0 && ticketCount > 0) {
      alert('Failed to generate any valid lines with current constraints.');
      return;
    }

    setResults([{ box: lines }]);
  };

  const generateDigitRandomLines = () => {
    const output: string[] = [];
    for (let i = 0; i < ticketCount; i++) {
      let attempts = 0;
      let validNum = '';
      while (attempts < 1000) {
        let numStr = '';
        for (let j = 0; j < digitLength; j++) {
          numStr += Math.floor(Math.random() * 10).toString();
        }
        const lastDigit = parseInt(numStr.charAt(numStr.length - 1), 10);
        if (oddMode && lastDigit % 2 === 0) {
          attempts++;
          continue;
        }
        if (evenMode && lastDigit % 2 !== 0) {
          attempts++;
          continue;
        }
        validNum = numStr;
        break;
      }
      if (validNum) output.push(validNum);
    }
    setResults([{ box: output }]);
  };

  const generatePreviousResultLines = () => {
    if (!previousResultInput || previousResultInput.length < 2 || previousResultInput.length > 5) {
      alert('Please enter a Previous Result between 2 and 5 digits long.');
      return;
    }

    const width = previousResultInput.length;
    const maxVal = Math.pow(10, width) - 1;
    const output: string[] = [];

    let possibleSpace = maxVal + 1;
    if (oddMode || evenMode) possibleSpace /= 2;
    if (noRepeat && ticketCount > possibleSpace) {
      alert(`Cannot generate ${ticketCount} unique numbers with these constraints.`);
      return;
    }

    let attempts = 0;
    while (output.length < ticketCount && attempts < 100000) {
      attempts++;
      const num = Math.floor(Math.random() * (maxVal + 1));
      if (oddMode && num % 2 === 0) continue;
      if (evenMode && num % 2 !== 0) continue;
      const strVal = num.toString().padStart(width, '0');
      if (noRepeat && output.includes(strVal)) continue;
      output.push(strVal);
    }

    setResults([{ box: output }]);
  };

  const toggleDigit = (board: string, digit: string) => {
    setBoards((prev) => {
      const current = prev[board] || [];
      const next = current.includes(digit) ? current.filter((d) => d !== digit) : [...current, digit];
      return { ...prev, [board]: next.sort() };
    });
  };

  const appendMixNumbers = (nums: number[]) => {
    const existing = parseNumberList(includeInput, rangeFrom, rangeTo);
    const merged = Array.from(new Set([...existing, ...nums])).slice(0, mainPickCount || 5);
    setIncludeInput(merged.join(', '));
  };

  const generate = () => {
    if (activeMode === 'digit-random') generateDigitRandomLines();
    else if (activeMode === 'number-random') generateNumberRandomLines();
    else if (activeMode === 'previous-result') generatePreviousResultLines();
    else if (activeMode === 'box') generateBoardLines();
    else if (activeMode === 'scrambler') generateScramblerLines();
    else if (activeMode === 'numerology') generateNumerologyLines();
    else if (activeMode === 'horoscope') generateHoroscopeLines();
    else if (activeMode === 'truly-lucky') {
      const spl = generateSpecialBalls(false);
      const needed = mainPickCount || activeCategory.mainBalls || 6;
      const pool: number[] = [];
      for (let x = rangeFrom; x <= rangeTo; x++) pool.push(x);
      const chosen = [...pickedTouchMain];
      const remaining = shuffleArray(pool.filter((x) => !chosen.includes(x)));
      while (chosen.length < needed && remaining.length > 0) {
        chosen.push(remaining.shift()!);
      }
      commitTouchLine(chosen, spl);
      setPickedTouchMain([]);
    } else {
      generateStandardLines();
    }

    setCopied(false);
    setShowShareOptions(false);
  };

  const getFormattedResults = () => {
    if (results.length === 0) return '';
    const title = 'Lucky Number Generator';
    const categoryHeader = `Game: ${activeCategory.name}`;
    let content = '';

    if (activeMode === 'box' || activeMode === 'digit-random' || activeMode === 'previous-result') {
      content = results[0]?.box?.join(', ') || '';
    } else {
      content = results
        .map((r) => r.main.join(' - ') + (r.special?.length ? ` [${r.special.join(' - ')}]` : ''))
        .join('\n');
    }

    return `${title}\n${categoryHeader}\n\n${content}\n\nGenerated by All USA Lottery`;
  };

  const handleDownloadCsv = () => {
    if (results.length === 0) return;
    let csv = `Line,Main Numbers,Special Ball\n`;
    if (activeMode === 'box' || activeMode === 'digit-random' || activeMode === 'previous-result') {
      const boxItems: string[] = results[0]?.box || [];
      csv = `Index,Combination\n` + boxItems.map((b, i) => `${i + 1},${b}`).join('\n');
    } else {
      csv += results
        .map((r, i) => `${i + 1},"${r.main.join(' ')}","${r.special?.join(' ') || ''}"`)
        .join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeCategory.id}-lucky-numbers.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const text = getFormattedResults();
    if (!text) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch((err) => console.error(err));
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      textArea.remove();
    }

    setCopied(true);
    setShowShareOptions(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSocial = async (platform: 'whatsapp' | 'telegram' | 'facebook' | 'native') => {
    const text = getFormattedResults();
    const url = window.location.href;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    if (platform === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Lucky Numbers - ${activeCategory.name}`,
            text,
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        alert('Native sharing not supported on this browser.');
      }
      return;
    }

    let shareUrl = '';
    if (platform === 'whatsapp') shareUrl = `https://wa.me/?text=${encodedText}`;
    else if (platform === 'telegram') shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    window.open(shareUrl, '_blank');
  };

  const showBallPoolControls =
    activeMode === 'standard' ||
    activeMode === 'number-random' ||
    activeMode === 'truly-lucky' ||
    activeMode === 'numerology' ||
    activeMode === 'horoscope';

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-8 mb-8 w-full mx-auto relative z-20 space-y-6">
      {/* 1. Top Generator Mode URL Tabs (Quick Pick, Truly Lucky, Numerology, Horoscopic, Scrambler, Combinator, Create Own) */}
      {!presetCategory ? (
        <div className="space-y-4 pb-5 border-b border-slate-100">
          <nav aria-label="Generator Mode Tabs" className="flex flex-wrap justify-center gap-2">
            {TOOL_MODE_TABS.map((tab) => {
              const isTabActive =
                (!initialCategoryId && tab.id === 'powerball') ||
                (initialCategoryId?.toLowerCase() === tab.id) ||
                (tab.id === 'powerball' && activeCategory.mode === 'standard' && !TOOL_MODE_TABS.some((t) => t.id === initialCategoryId));

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                    isTabActive
                      ? 'bg-[#f59e0b] text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* 2. Region Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {REGION_TABS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegionTab(r.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                  regionTab === r.id
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* 3. Separate Lottery URL Tabs (<Link href="/lucky-number-generator/[slug]">) */}
          <nav aria-label="Pick Your Lotto URLs" className="flex flex-wrap justify-center gap-2 max-h-[210px] overflow-y-auto pt-1 custom-scrollbar">
            {filteredCategoryLinks.map((cat) => {
              const isCurrent = activeCategory.id === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/lucky-number-generator/${cat.id}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#0f172a] text-[#f59e0b] shadow-md shadow-slate-900/10'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  <span>{cat.flag}</span>
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ) : (
        /* Game-Page Mode Switcher (keeps preset pool active while toggling Quick Pick / Truly Lucky / Numerology / Horoscope / Scrambler) */
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-2">
            {[
              { mode: 'standard' as CategoryMode, label: 'Quick Pick' },
              { mode: 'truly-lucky' as CategoryMode, label: 'Truly Lucky Touch' },
              { mode: 'numerology' as CategoryMode, label: 'Numerology' },
              { mode: 'horoscope' as CategoryMode, label: 'Horoscopic' },
              { mode: 'scrambler' as CategoryMode, label: 'Scrambler' },
            ].map((m) => (
              <button
                key={m.mode}
                type="button"
                onClick={() => {
                  setLocalModeOverride(m.mode);
                  setResults([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  activeMode === m.mode
                    ? 'bg-[#0f172a] text-[#f59e0b] border-[#0f172a] shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {gamePageContext?.matchedHubId && (
            <Link
              href={`/lucky-number-generator/${gamePageContext.matchedHubId}`}
              className="text-xs font-black text-amber-700 hover:text-amber-900 underline underline-offset-4"
            >
              Open Global {activeCategory.name} Generator &rarr;
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Panel */}
        <div className="lg:col-span-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#0f172a] flex items-center justify-center gap-2 text-center">
            <Wand2 size={16} className="text-[#f59e0b]" /> {activeCategory.name}
          </h3>

          {/* Hot & Overdue Quick Mix Buttons on Game Result Pages */}
          {gamePageContext && (gamePageContext.hotNumbers?.length || gamePageContext.overdueNumbers?.length) && showBallPoolControls ? (
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Real 2026 Draw Insights (Click to Mix In)
              </div>
              {gamePageContext.hotNumbers && gamePageContext.hotNumbers.length > 0 && (
                <button
                  type="button"
                  onClick={() => appendMixNumbers(gamePageContext.hotNumbers!.slice(0, 2))}
                  className="w-full text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Flame size={12} />
                  <span>Mix Hot: {gamePageContext.hotNumbers.slice(0, 4).join(', ')}</span>
                </button>
              )}
              {gamePageContext.overdueNumbers && gamePageContext.overdueNumbers.length > 0 && (
                <button
                  type="button"
                  onClick={() => appendMixNumbers(gamePageContext.overdueNumbers!.slice(0, 2))}
                  className="w-full text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Clock size={12} />
                  <span>Mix Overdue: {gamePageContext.overdueNumbers.slice(0, 4).join(', ')}</span>
                </button>
              )}
            </div>
          ) : null}

          {/* Numerology Inputs */}
          {activeMode === 'numerology' && (
            <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2.5">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={numName}
                  onChange={(e) => setNumName(e.target.value)}
                  placeholder="e.g. Alex Taylor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  <Calendar size={11} className="text-[#f59e0b]" />
                  <span>Birth Date</span>
                </label>
                <input
                  type="date"
                  value={numDob}
                  onChange={(e) => setNumDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>
            </div>
          )}

          {/* Horoscope Sign Selector */}
          {activeMode === 'horoscope' && (
            <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
              <label className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <Sparkles size={11} className="text-[#f59e0b]" />
                <span>Select Zodiac Sign</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {ZODIAC_SIGNS.map((sign) => (
                  <button
                    key={sign.id}
                    type="button"
                    onClick={() => setZodiacId(sign.id)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all flex flex-col items-center ${
                      zodiacId === sign.id
                        ? 'bg-[#0f172a] text-[#f59e0b] border-[#0f172a]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-sm">{sign.symbol}</span>
                    <span>{sign.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scrambler Inputs */}
          {activeMode === 'scrambler' && (
            <div className="w-full space-y-3">
              <div>
                <label className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  <Shuffle size={11} className="text-[#f59e0b]" />
                  <span>Your Numbers Pool to Scramble</span>
                </label>
                <textarea
                  rows={3}
                  value={scramblerInput}
                  onChange={(e) => setScramblerInput(e.target.value)}
                  placeholder="Enter numbers separated by commas or spaces..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tickets</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-20 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Balls / Line</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={scramblerPickLen}
                    onChange={(e) => setScramblerPickLen(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 6)))}
                    className="w-20 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Standard / Shared Pool Controls */}
          {(showBallPoolControls || activeMode === 'previous-result' || activeCategory.id === 'board') && (
            <div className="w-full space-y-4">
              {activeCategory.id === 'board' && (
                <div className="flex flex-col items-center pb-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Board Count</label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setBoardType(num);
                          const initial: Record<string, string[]> = {};
                          for (let i = 0; i < num; i++) initial[boardNames[i]] = [];
                          setBoards(initial);
                          setActiveBoardTab('A');
                          setResults([]);
                        }}
                        className={`w-10 h-10 rounded-xl font-black text-sm transition-all border-2 ${
                          boardType === num
                            ? 'bg-[#0f172a] border-[#0f172a] text-[#f59e0b] shadow-md'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeMode !== 'truly-lucky' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">
                      {activeMode === 'standard' || activeMode === 'numerology' || activeMode === 'horoscope' ? 'Tickets' : 'Numbers'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                    />
                  </div>
                  {showBallPoolControls && activeMode !== 'number-random' && (
                    <div className="flex flex-col items-center">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">
                        Balls / Line
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={mainPickCount}
                        onChange={(e) => setMainPickCount(Math.min(25, Math.max(1, parseInt(e.target.value, 10) || 5)))}
                        className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeCategory.id === 'board' && (
                <div className="w-full space-y-4 py-2">
                  <div className="w-full flex flex-col items-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Select Board</label>
                    <div className="relative w-full">
                      <select
                        value={activeBoardTab}
                        onChange={(e) => setActiveBoardTab(e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl py-2 px-4 font-black text-sm text-center shadow-sm focus:outline-none appearance-none cursor-pointer pr-10"
                      >
                        {Object.keys(boards).sort().map((key) => (
                          <option key={key} value={key}>
                            Board {key}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <ChevronDown size={16} className="text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">Choose a Number (0 - 9)</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => toggleDigit(activeBoardTab, num)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base transition-all border-2 ${
                            boards[activeBoardTab]?.includes(num)
                              ? 'bg-[#f59e0b] border-amber-500 text-white shadow-md'
                              : 'bg-white border-slate-50 text-slate-300 hover:border-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeMode === 'previous-result' ? (
                <div className="flex flex-col items-center pt-2">
                  <label className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-1 text-center">Previous Result</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={previousResultInput}
                    onChange={(e) => setPreviousResultInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 123"
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 font-black text-center tracking-[0.2em] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                  />
                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">2 to 5 Digits</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">From</label>
                    <input
                      type="number"
                      value={rangeFrom}
                      onChange={(e) => setRangeFrom(parseInt(e.target.value, 10) || 0)}
                      className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">To</label>
                    <input
                      type="number"
                      value={rangeTo}
                      onChange={(e) => setRangeTo(parseInt(e.target.value, 10) || 1)}
                      className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Include / Exclude Mix-and-Match Controls (mirroring lotterynumbergenerator.net) */}
              {showBallPoolControls && activeMode !== 'truly-lucky' && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Mix Your Lucky Numbers (Include)
                    </label>
                    <input
                      type="text"
                      value={includeInput}
                      onChange={(e) => setIncludeInput(e.target.value)}
                      placeholder="e.g. 7, 14, 21"
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Exclude Numbers
                    </label>
                    <input
                      type="text"
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      placeholder="e.g. 13, 66"
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                    />
                  </div>
                </div>
              )}

              {activeMode !== 'truly-lucky' && (
                <div className="space-y-1.5 pt-1 flex flex-col items-center">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={noRepeat}
                      onChange={(e) => setNoRepeat(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]"
                    />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">No Repeats</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={oddMode}
                        onChange={(e) => {
                          setOddMode(e.target.checked);
                          if (e.target.checked) setEvenMode(false);
                        }}
                        className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]"
                      />
                      <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Odd</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={evenMode}
                        onChange={(e) => {
                          setEvenMode(e.target.checked);
                          if (e.target.checked) setOddMode(false);
                        }}
                        className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]"
                      />
                      <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Even</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMode === 'digit-random' && (
            <div className="w-full space-y-3">
              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Numbers</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Digits (2-5)</label>
                <input
                  type="number"
                  min="2"
                  max="5"
                  value={digitLength}
                  onChange={(e) => {
                    let val = parseInt(e.target.value, 10) || 3;
                    if (val < 2) val = 2;
                    if (val > 5) val = 5;
                    setDigitLength(val);
                  }}
                  className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>
              <div className="space-y-1.5 pt-1 flex flex-col items-center">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={oddMode}
                      onChange={(e) => {
                        setOddMode(e.target.checked);
                        if (e.target.checked) setEvenMode(false);
                      }}
                      className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]"
                    />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Odd</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={evenMode}
                      onChange={(e) => {
                        setEvenMode(e.target.checked);
                        if (e.target.checked) setOddMode(false);
                      }}
                      className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]"
                    />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Even</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'custom' && (
            <div className="w-full space-y-4">
              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Tickets to Generate</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-xl p-3 pt-5 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-100 px-3 py-0.5 rounded text-[9px] font-black text-[#0f172a] uppercase tracking-widest text-center whitespace-nowrap">
                  Main Pool
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Pick Main Ball</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customMainBalls}
                      onChange={(e) => setCustomMainBalls(parseInt(e.target.value, 10) || 1)}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Range From 1 To</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={customMainMax}
                      onChange={(e) => setCustomMainMax(parseInt(e.target.value, 10) || 1)}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-xl p-3 pt-5 relative mt-6">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-100 px-3 py-0.5 rounded text-[9px] font-bold text-[#b91c1c] uppercase tracking-widest text-center whitespace-nowrap">
                  Bonus Pool
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Pick Bonus Ball</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={customSpecialBalls}
                      onChange={(e) => setCustomSpecialBalls(parseInt(e.target.value, 10) || 0)}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Range From 1 To</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={customSpecialMax}
                      onChange={(e) => setCustomSpecialMax(parseInt(e.target.value, 10) || 1)}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 flex flex-col items-center border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={noRepeat}
                    onChange={(e) => setNoRepeat(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]"
                  />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">No Matches Within Pools</span>
                </label>
              </div>
            </div>
          )}

          {activeMode === 'box' && activeCategory.id !== 'all-possible' && activeCategory.id !== 'board' && (
            <div className="w-full space-y-4">
              {Object.keys(boards).sort().map((boardKey) => (
                <div key={boardKey} className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-6 flex flex-col items-center shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Board {boardKey}</span>
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex justify-center gap-2 w-full">
                      {['0', '1', '2', '3', '4', '5'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => toggleDigit(boardKey, num)}
                          className={`w-6 h-14 sm:w-8 sm:h-16 rounded-full flex items-center justify-center font-black text-sm sm:text-lg transition-all border-2 ${
                            boards[boardKey]?.includes(num)
                              ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/30'
                              : 'bg-white border-slate-100/50 text-slate-300 hover:border-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center gap-2 w-full">
                      {['6', '7', '8', '9'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => toggleDigit(boardKey, num)}
                          className={`w-6 h-14 sm:w-8 sm:h-16 rounded-full flex items-center justify-center font-black text-sm sm:text-lg transition-all border-2 ${
                            boards[boardKey]?.includes(num)
                              ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/30'
                              : 'bg-white border-slate-100/50 text-slate-300 hover:border-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeMode === 'box' && activeCategory.id === 'all-possible' && (
            <div className="w-full grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Base Numbers</label>
                <input
                  type="text"
                  maxLength={10}
                  value={boxInput}
                  onChange={(e) => setBoxInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 123"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 font-black text-2xl text-center tracking-[0.3em] shadow-sm focus:outline-none font-mono"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Digits</label>
                <input
                  type="number"
                  min="2"
                  max={boxInput.length > 2 ? Math.min(boxInput.length, 10) : 10}
                  value={comboLength}
                  onChange={(e) => setComboLength(parseInt(e.target.value, 10) || 2)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 font-black text-2xl text-center shadow-sm focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          <div className="w-full pt-2 mt-auto space-y-2">
            {activeMode === 'truly-lucky' && (
              <button
                type="button"
                onClick={handleDrawNextRandomTouchBall}
                className="w-full bg-[#0f172a] hover:bg-slate-800 text-[#f59e0b] font-black py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Hand size={15} />
                <span>Draw Next Ball ({pickedTouchMain.length}/{mainPickCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={generate}
              className="w-full bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 text-xs sm:text-sm uppercase tracking-wider cursor-pointer border border-amber-600/20"
            >
              <RefreshCw size={16} className="text-slate-950" />
              <span>
                {activeCategory.id === 'all-possible'
                  ? 'Generate Combinations'
                  : activeMode === 'truly-lucky'
                    ? 'Auto-Complete Line'
                    : activeMode === 'scrambler'
                      ? 'Scramble Numbers'
                      : 'Generate Numbers'}
              </span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Results</h3>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setResults([]);
                  setPickedTouchMain([]);
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                title="Clear"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={results.length === 0}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all border border-slate-200"
              >
                <Download size={12} /> CSV
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={results.length === 0}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all border border-slate-200"
              >
                <Copy size={12} /> {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Interactive Mystery Drum Grid for Truly Lucky Touch Picker */}
          {activeMode === 'truly-lucky' && drumPool.length > 0 && (
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-[#0f172a] uppercase tracking-wider">
                  Lucky Touch Drum — Tap {Math.max(0, (mainPickCount || 6) - pickedTouchMain.length)} More Orbs
                </span>
                {pickedTouchMain.length > 0 && (
                  <span className="text-xs font-black text-amber-700">
                    Picked: {pickedTouchMain.join(' • ')}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {drumPool.map((num) => {
                  const chosen = pickedTouchMain.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleTouchBallSelect(num)}
                      className={`w-8 h-8 rounded-full font-black text-xs transition-all border ${
                        chosen
                          ? 'bg-[#0f172a] text-[#f59e0b] border-[#0f172a] scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-500'
                      }`}
                    >
                      {chosen ? num : '?'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 sm:p-6 min-h-[300px] shadow-sm flex flex-col">
            {results.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-2 text-slate-400">
                <Wand2 size={44} className="opacity-20 text-amber-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Click &quot;Generate Numbers&quot; to create unbiased winning lines
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeMode === 'box' || activeMode === 'digit-random' || activeMode === 'previous-result') && results[0]?.box && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">
                      {activeMode === 'digit-random' || activeMode === 'previous-result' ? 'Generated' : 'Found'}{' '}
                      {results[0].box.length}{' '}
                      {activeMode === 'digit-random' || activeMode === 'previous-result' ? 'Numbers' : 'Combinations'}
                    </div>
                    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {results[0].box.map((comb: string, i: number) => (
                        <div
                          key={i}
                          className="bg-slate-50 border border-slate-100 text-[#0f172a] font-black py-1.5 rounded-xl text-sm md:text-base tracking-[0.1em] hover:bg-slate-100 transition-colors text-center shadow-sm whitespace-nowrap overflow-hidden"
                        >
                          {comb}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeMode !== 'box' &&
                  activeMode !== 'digit-random' &&
                  activeMode !== 'previous-result' &&
                  results.map((ticket, i) => (
                    <div
                      key={i}
                      className="flex flex-row items-center justify-start sm:justify-center gap-1 sm:gap-3 px-2 py-3 sm:px-4 sm:py-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto custom-scrollbar"
                    >
                      <span className="text-[9px] font-black text-slate-300 w-5 flex-shrink-0 text-center">#{i + 1}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {ticket?.main &&
                          ticket.main.map((n: number, idx: number) => (
                            <div
                              key={`m-${idx}`}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-xs md:text-base text-slate-800 shadow-inner"
                            >
                              {n}
                            </div>
                          ))}
                      </div>
                      {ticket.special && ticket.special.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-1 pl-2 border-l-2 border-dashed border-slate-200 flex-shrink-0">
                          {ticket.special.map((n: number, idx: number) => (
                            <div
                              key={`s-${idx}`}
                              title={activeCategory.specialName || 'Bonus'}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-amber-600 border border-white flex items-center justify-center font-bold text-xs md:text-base text-[#0f172a] shadow"
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {results.length > 0 && showShareOptions && (
              <div className="mt-8 pt-6 flex flex-col items-center gap-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-[1px] w-8 bg-slate-100"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Share results</span>
                  <div className="h-[1px] w-8 bg-slate-100"></div>
                </div>

                <div className="flex gap-6">
                  <button type="button" onClick={() => shareSocial('whatsapp')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#25d366] text-white flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-all">
                      <MessageCircle size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">WhatsApp</span>
                  </button>
                  <button type="button" onClick={() => shareSocial('telegram')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-all">
                      <Send size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Telegram</span>
                  </button>
                  <button type="button" onClick={() => shareSocial('facebook')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#1877f2] text-white flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-all">
                      <Facebook size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Facebook</span>
                  </button>
                  <button type="button" onClick={() => shareSocial('native')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-all">
                      <Share2 size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Share Via</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
