export type CategoryMode = 'standard' | 'box' | 'custom' | 'digit-random' | 'number-random' | 'previous-result';

export interface LotteryCategory {
  id: string;
  name: string;
  mode: CategoryMode;
  mainBalls?: number;
  mainRange?: [number, number];
  specialBalls?: number;
  specialRange?: [number, number];
  specialName?: string;
  // For 'box' modes
  customDigits?: number;
}

export const CATEGORIES: LotteryCategory[] = [
  { id: 'mega-millions', name: 'Mega Millions', mode: 'standard', mainBalls: 5, mainRange: [1, 70], specialBalls: 1, specialRange: [1, 25], specialName: 'Mega Ball' },
  { id: 'lucky-number', name: 'Lucky Number', mode: 'number-random', mainRange: [1, 50] },
  { id: 'powerball', name: 'Power Ball', mode: 'standard', mainBalls: 5, mainRange: [1, 69], specialBalls: 1, specialRange: [1, 26], specialName: 'Powerball' },
  { id: 'lotto-america', name: 'Lotto America', mode: 'standard', mainBalls: 5, mainRange: [1, 52], specialBalls: 1, specialRange: [1, 10], specialName: 'Star Ball' },
  { id: 'cash-life', name: 'Cash Life', mode: 'standard', mainBalls: 5, mainRange: [1, 60], specialBalls: 1, specialRange: [1, 4], specialName: 'Cash Ball' },
  { id: 'lucky-life', name: 'Lucky Life', mode: 'standard', mainBalls: 5, mainRange: [1, 48], specialBalls: 1, specialRange: [1, 18], specialName: 'Lucky Ball' },
  { id: 'keno', name: 'Keno', mode: 'standard', mainBalls: 20, mainRange: [1, 80] },
  { id: 'lotto-max', name: 'Lotto Max', mode: 'standard', mainBalls: 7, mainRange: [1, 50] },
  { id: 'cash-5', name: 'Cash 5', mode: 'standard', mainBalls: 5, mainRange: [1, 43] },
  { id: 'pick-2', name: 'Pick 2', mode: 'standard', mainBalls: 2, mainRange: [0, 9] },
  { id: 'pick-3', name: 'Pick 3', mode: 'standard', mainBalls: 3, mainRange: [0, 9] },
  { id: 'pick-4', name: 'Pick 4', mode: 'standard', mainBalls: 4, mainRange: [0, 9] },
  { id: 'pick-5', name: 'Pick 5', mode: 'standard', mainBalls: 5, mainRange: [0, 9] },
  { id: 'pick-6', name: 'Pick 6', mode: 'standard', mainBalls: 6, mainRange: [1, 46] },
  { id: 'pick-7', name: 'Pick 7', mode: 'standard', mainBalls: 7, mainRange: [1, 50] },
  { id: 'oz-powerball', name: 'Oz Powerball', mode: 'standard', mainBalls: 7, mainRange: [1, 35], specialBalls: 1, specialRange: [1, 20], specialName: 'Powerball' },
  { id: 'oz-lotto', name: 'Oz Lotto', mode: 'standard', mainBalls: 7, mainRange: [1, 47] },
  { id: 'tatts', name: 'Tatts', mode: 'standard', mainBalls: 6, mainRange: [1, 45] },
  { id: 'monday', name: 'Monday', mode: 'standard', mainBalls: 6, mainRange: [1, 45] },
  { id: 'wednesday', name: 'Wednesday', mode: 'standard', mainBalls: 6, mainRange: [1, 45] },
  { id: 'euro-millions', name: 'Euro Millions', mode: 'standard', mainBalls: 5, mainRange: [1, 50], specialBalls: 2, specialRange: [1, 12], specialName: 'Lucky Star' },
  { id: 'euro-jackpot', name: 'Euro Jackpot', mode: 'standard', mainBalls: 5, mainRange: [1, 50], specialBalls: 2, specialRange: [1, 12], specialName: 'Euro Number' },
  { id: 'set-life', name: 'Set Life', mode: 'standard', mainBalls: 5, mainRange: [1, 47], specialBalls: 1, specialRange: [1, 10], specialName: 'Life Ball' },
  { id: 'thunderball', name: 'Thunderball', mode: 'standard', mainBalls: 5, mainRange: [1, 39], specialBalls: 1, specialRange: [1, 14], specialName: 'Thunderball' },
  { id: 'lotto-uk-eur', name: 'Lotto UK & Eur', mode: 'standard', mainBalls: 6, mainRange: [1, 59] },
  { id: 'mahzooz', name: 'Mahzooz', mode: 'standard', mainBalls: 5, mainRange: [1, 49] },
  { id: 'fast-5', name: 'Fast 5', mode: 'standard', mainBalls: 5, mainRange: [1, 42] },
  { id: 'easy-6', name: 'Easy 6', mode: 'standard', mainBalls: 6, mainRange: [1, 39] },
  { id: 'mega-7', name: 'Mega 7', mode: 'standard', mainBalls: 7, mainRange: [1, 37] },
  { id: 'digit', name: 'Digit', mode: 'digit-random' },
  { id: '3-digit', name: '3 Digit', mode: 'box', customDigits: 3 },
  { id: '4-digit', name: '4 Digit', mode: 'box', customDigits: 4 },
  { id: '5-digit', name: '5 Digit', mode: 'box', customDigits: 5 },
  { id: 'all-possible', name: 'All Possible', mode: 'box' },
  { id: 'previous-result', name: 'Previous Result', mode: 'previous-result' },
  { id: 'board', name: 'Board', mode: 'box' },
  { id: 'custom', name: 'Custom', mode: 'custom' }
];
