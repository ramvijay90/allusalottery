'use client';

import React, { useState, useEffect } from 'react';
import { CATEGORIES, LotteryCategory } from '@/lib/lotteryCategories';
import { RefreshCw, Copy, Trash2, Wand2, Share2, Facebook, Send, MessageCircle, ChevronDown } from 'lucide-react';

export default function LuckyGenerator() {
  const [activeCategory, setActiveCategory] = useState<LotteryCategory>(CATEGORIES[0]);

  // Standard Strategy State
  const [ticketCount, setTicketCount] = useState(1);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(70);
  const [noRepeat, setNoRepeat] = useState(true);
  const [oddMode, setOddMode] = useState(false);
  const [evenMode, setEvenMode] = useState(false);

  // Box Strategy State
  const [boxInput, setBoxInput] = useState('');
  const [comboLength, setComboLength] = useState(3);

  // Previous Result State
  const [previousResultInput, setPreviousResultInput] = useState('');

  // Digit Random State
  const [digitLength, setDigitLength] = useState(3);

  // Results State
  const [results, setResults] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Board Strategy State
  const [boards, setBoards] = useState<Record<string, string[]>>({});
  const boardNames = ['A', 'B', 'C', 'D', 'E'];
  const [activeBoardTab, setActiveBoardTab] = useState('A');
  const [boardType, setBoardType] = useState<number>(3); // 3, 4, or 5

  // Custom Category State
  const [customMainBalls, setCustomMainBalls] = useState(5);
  const [customMainMax, setCustomMainMax] = useState(69);
  const [customSpecialBalls, setCustomSpecialBalls] = useState(1);
  const [customSpecialMax, setCustomSpecialMax] = useState(26);

  // Sync category defaults safely via useEffect to prevent hydration mismatch
  useEffect(() => {
    if (activeCategory.mode === 'standard' || activeCategory.mode === 'number-random') {
      setRangeFrom(activeCategory.mainRange?.[0] || 1);
      setRangeTo(activeCategory.mainRange?.[1] || 50);
      setNoRepeat(true);
      setOddMode(false);
      setEvenMode(false);
      setTicketCount(activeCategory.mode === 'number-random' ? 5 : 1);
    }
    if (activeCategory.mode === 'box') {
      setBoxInput('');
      setComboLength(activeCategory.customDigits || 3);
    }
    if (activeCategory.mode === 'previous-result') {
      setPreviousResultInput('');
      setTicketCount(5);
      setNoRepeat(true);
      setOddMode(false);
      setEvenMode(false);
    }
    if (activeCategory.mode === 'digit-random') {
      setTicketCount(5);
      setDigitLength(3);
      setOddMode(false);
      setEvenMode(false);
    }

    // Initialize Boards for Box/Board categories
    if (activeCategory.mode === 'box') {
      const initial: Record<string, string[]> = {};
      const count = activeCategory.customDigits || (activeCategory.id === 'board' ? boardType : 3);
      for (let i = 0; i < count; i++) {
        initial[boardNames[i]] = [];
      }
      setBoards(initial);
      setActiveBoardTab('A');
      setTicketCount(activeCategory.id === 'board' ? 5 : 1);
    }

    setResults([]);
  }, [activeCategory]);

  const generateStandardLines = () => {
    const lines: { main: number[], special: number[] }[] = [];
    const isCustom = activeCategory.mode === 'custom';
    const needed = isCustom ? customMainBalls : (activeCategory.mainBalls || 5);
    const minVal = isCustom ? 1 : rangeFrom;
    const maxVal = isCustom ? customMainMax : rangeTo;

    for (let i = 0; i < ticketCount; i++) {
      let pool = [];
      for (let x = minVal; x <= maxVal; x++) {
        if (oddMode && x % 2 === 0) continue;
        if (evenMode && x % 2 !== 0) continue;
        pool.push(x);
      }

      if (pool.length < needed && noRepeat) {
        alert("Not enough pool numbers for constraints!");
        return;
      }

      let line = [];
      for (let j = 0; j < needed; j++) {
        const randIndex = Math.floor(Math.random() * pool.length);
        const val = pool[randIndex];
        line.push(val);
        if (noRepeat) {
          pool.splice(randIndex, 1);
        }
      }

      line.sort((a, b) => a - b);

      // Special
      const specialNeed = isCustom ? customSpecialBalls : (activeCategory.specialBalls || 0);

      if (specialNeed > 0) {
        let spl = [];
        const specMin = isCustom ? 1 : (activeCategory.specialRange?.[0] || 1);
        const specMax = isCustom ? customSpecialMax : (activeCategory.specialRange?.[1] || 25);

        let specPool = [];
        for (let x = specMin; x <= specMax; x++) {
          specPool.push(x);
        }

        if (specPool.length < specialNeed && noRepeat) {
          alert("Not enough bonus ball pool numbers for constraints!");
          return;
        }

        for (let j = 0; j < specialNeed; j++) {
          const randIndex = Math.floor(Math.random() * specPool.length);
          spl.push(specPool[randIndex]);
          if (noRepeat) specPool.splice(randIndex, 1);
        }
        lines.push({ main: line, special: spl });
      } else {
        lines.push({ main: line, special: [] });
      }
    }
    setResults(lines as any);
  };

  const generateNumberRandomLines = () => {
    let pool = [];
    for (let j = rangeFrom; j <= rangeTo; j++) {
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
    let currentPool = [...pool];

    for (let i = 0; i < ticketCount; i++) {
      if (noRepeat) {
        const index = Math.floor(Math.random() * currentPool.length);
        output.push(currentPool.splice(index, 1)[0]);
      } else {
        const index = Math.floor(Math.random() * currentPool.length);
        output.push(currentPool[index]);
      }
    }

    setResults([{ main: output.sort((a, b) => a - b) }]);
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

  const generateBoxLines = () => {
    if (activeCategory.mode === 'box' && activeCategory.id === 'all-possible') {
      if (!boxInput) return;
      if (boxInput.length < comboLength) {
        alert("Number pool must be at least as long as your combination digits.");
        return;
      }
      const perms = getKPermutations(boxInput, comboLength);
      setResults([{ box: perms }]);
      return;
    }
    if (activeCategory.customDigits && boxInput.length !== activeCategory.customDigits) {
      alert(`Please enter exactly ${activeCategory.customDigits} digits.`);
      return;
    }
    if (!boxInput) return;

    const perms = getKPermutations(boxInput, activeCategory.customDigits || boxInput.length);
    setResults([{ box: perms }]);
  };

  const generateBoardLines = () => {
    // 1. All Possible (Permutations) Mode
    if (activeCategory.id === 'all-possible') {
      if (!boxInput) return;
      if (boxInput.length < comboLength) {
        alert("Number pool must be at least as long as your combination digits.");
        return;
      }
      const perms = getKPermutations(boxInput, comboLength);
      setResults([{ box: perms }]);
      return;
    }

    // 2. 3, 4, 5 Digit Tab Logic (Cartesian Product - All possible)
    if (activeCategory.id !== 'board') {
      const boardKeys = Object.keys(boards).sort();
      if (boardKeys.length === 0) return;
      
      const boardEntries = boardKeys.map(k => boards[k] || []);
      if (boardEntries.some(arr => arr.length === 0)) {
        alert("Please select at least one digit for each Board!");
        return;
      }

      const cartesian = (a: string[][]): string[][] =>
        a.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as string[][]);

      const permutations = cartesian(boardEntries);
      const combinations = permutations.map(p => p.join(''));
      setResults([{ box: combinations }]);
      return;
    }

    // 3. Board Tab Logic (Cartesian Product of selected digits * ticketCount)
    const boardKeys = Object.keys(boards).sort();
    if (boardKeys.length === 0) return;

    // Identify which boards have selections
    const lockedBoardsSelections: string[][] = [];
    const lockedKeys: string[] = [];
    const allChoices: Record<string, string[]> = {};

    for (const key of boardKeys) {
      const choices = boards[key] && boards[key].length > 0 ? boards[key] : [];
      if (choices.length > 0) {
        lockedBoardsSelections.push(choices);
        lockedKeys.push(key);
      }
      allChoices[key] = choices.length > 0 ? choices : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }

    // Cartesian product of locked boards
    const cartesian = (a: string[][]): string[][] =>
      a.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as string[][]);

    const locks = lockedBoardsSelections.length > 0 ? cartesian(lockedBoardsSelections) : [[]];

    const lines: string[] = [];
    for (const lock of locks) {
      // Map the lock back to keys
      const lockMap: Record<string, string> = {};
      lock.forEach((val, idx) => {
        lockMap[lockedKeys[idx]] = val;
      });

      for (let i = 0; i < ticketCount; i++) {
        let attempts = 0;
        let validLine = null;
        while (attempts < 1000) {
          attempts++;
          let res = '';
          const usedInLine: string[] = [];

          for (const key of boardKeys) {
            // If the board is locked for this iteration, use the lock value
            if (lockMap[key] !== undefined) {
              const digit = lockMap[key];
              res += digit;
              usedInLine.push(digit);
            } else {
              // Otherwise pick randomly from 0-9
              let pool = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].filter(c => !noRepeat || !usedInLine.includes(c));
              if (pool.length === 0) break;
              const digit = pool[Math.floor(Math.random() * pool.length)];
              res += digit;
              usedInLine.push(digit);
            }
          }

          if (res.length < boardKeys.length) continue;

          // Optional constraints
          const lastDigit = parseInt(res.charAt(res.length - 1));
          const isOdd = lastDigit % 2 !== 0;
          const isEven = lastDigit % 2 === 0;

          if (oddMode && !isOdd) continue;
          if (evenMode && !isEven) continue;
          if (noRepeat && lines.includes(res)) continue;

          validLine = res;
          break;
        }
        if (validLine) lines.push(validLine);
      }
    }

    if (lines.length === 0 && ticketCount > 0) {
      alert("Failed to generate any valid lines with current constraints.");
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

        const lastDigit = parseInt(numStr.charAt(numStr.length - 1));
        const isOdd = lastDigit % 2 !== 0;
        const isEven = lastDigit % 2 === 0;

        if (oddMode && !isOdd) { attempts++; continue; }
        if (evenMode && !isEven) { attempts++; continue; }

        validNum = numStr;
        break;
      }
      if (validNum) output.push(validNum);
    }
    setResults([{ box: output }]);
  };

  const generatePreviousResultLines = () => {
    if (!previousResultInput || previousResultInput.length < 2 || previousResultInput.length > 5) {
      alert("Please enter a Previous Result between 2 and 5 digits long.");
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

      const isOdd = num % 2 !== 0;
      const isEven = num % 2 === 0;

      if (oddMode && !isOdd) continue;
      if (evenMode && !isEven) continue;

      const strVal = num.toString().padStart(width, '0');
      if (noRepeat && output.includes(strVal)) continue;

      output.push(strVal);
    }

    setResults([{ box: output }]);
  };

  const toggleDigit = (board: string, digit: string) => {
    setBoards(prev => {
      const current = prev[board] || [];
      const next = current.includes(digit) ? current.filter(d => d !== digit) : [...current, digit];
      return { ...prev, [board]: next.sort() };
    });
  };

  const generate = () => {
    if (activeCategory.mode === 'digit-random') generateDigitRandomLines();
    else if (activeCategory.mode === 'number-random') generateNumberRandomLines();
    else if (activeCategory.mode === 'previous-result') generatePreviousResultLines();
    else if (activeCategory.mode === 'box') generateBoardLines();
    else generateStandardLines();
    setCopied(false);
    setShowShareOptions(false);
  };

  const getFormattedResults = () => {
    if (results.length === 0) return '';
    const title = "Lucky Number Generator";
    const categoryHeader = `Generate Numbers: ${activeCategory.name}`;
    let content = '';

    if (activeCategory.mode === 'box' || activeCategory.mode === 'digit-random' || activeCategory.mode === 'previous-result') {
      content = results[0]?.box?.join(', ') || '';
    } else {
      content = results.map(r =>
        r.main.join(' - ') + (r.special?.length ? ` [${r.special.join(' - ')}]` : '')
      ).join('\n');
    }

    return `${title}\n${categoryHeader}\n\n${content}\n\nGenerated by All USA Lottery`;
  };

  const handleCopy = () => {
    const text = getFormattedResults();
    if (!text) return;

    // Use modern API if available (HTTPS or localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(err => console.error(err));
    } else {
      // Fallback for HTTP (like 192.168.1.9)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
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
            text: text,
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        alert("Native sharing not supported on this browser.");
      }
      return;
    }

    let shareUrl = '';
    if (platform === 'whatsapp') shareUrl = `https://wa.me/?text=${encodedText}`;
    else if (platform === 'telegram') shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    window.open(shareUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 mb-20 max-w-4xl mx-auto -mt-40 relative z-20">
      <div className="flex flex-wrap justify-center gap-2 mb-6 pb-4 border-b border-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setResults([]); setActiveCategory(cat); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory.id === cat.id
              ? 'bg-[#0f172a] text-[#f59e0b] shadow-md shadow-slate-900/10'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Settings Panel */}
        <div className="lg:col-span-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
          <h3 className="text-sm font-black text-[#0f172a] mb-4 flex items-center justify-center gap-2">
            <Wand2 size={16} className="text-[#f59e0b]" /> {activeCategory.name}
          </h3>

          {(activeCategory.mode === 'standard' || activeCategory.mode === 'number-random' || activeCategory.mode === 'previous-result' || activeCategory.id === 'board') && (
            <div className="w-full space-y-4">
              {activeCategory.id === 'board' && (
                <div className="flex flex-col items-center pb-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Board Count</label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => {
                          setBoardType(num);
                          const initial: Record<string, string[]> = {};
                          for (let i = 0; i < num; i++) {
                            initial[boardNames[i]] = [];
                          }
                          setBoards(initial);
                          setActiveBoardTab('A');
                          setResults([]);
                        }}
                        className={`w-10 h-10 rounded-xl font-black text-sm transition-all border-2 ${boardType === num
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

              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">
                  {activeCategory.mode === 'standard' ? 'Tickets' : (activeCategory.id === 'board' ? 'Numbers to Generate' : 'Numbers')}
                </label>
                <input
                  type="number" min="1" max="1000"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                  className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>

              {activeCategory.id === 'board' && (
                <div className="w-full space-y-4 py-2">
                  {Object.keys(boards).sort().map((boardKey) => (
                    <div key={boardKey} className="w-full bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-6 flex flex-col items-center shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Board {boardKey}</span>
                      
                      <div className="flex flex-col items-center gap-1.5 w-full">
                        {/* Row 1: 0-5 */}
                        <div className="flex justify-center gap-1.5 w-full">
                          {['0', '1', '2', '3', '4', '5'].map(num => (
                            <button
                              key={num}
                              onClick={() => toggleDigit(boardKey, num)}
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-base transition-all border-2 ${boards[boardKey]?.includes(num)
                                ? 'bg-[#f59e0b] border-amber-500 text-white shadow-md'
                                : 'bg-white border-slate-50 text-slate-300 hover:border-slate-200'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        {/* Row 2: 6-9 */}
                        <div className="flex justify-center gap-1.5 w-full">
                          {['6', '7', '8', '9'].map(num => (
                            <button
                              key={num}
                              onClick={() => toggleDigit(boardKey, num)}
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-base transition-all border-2 ${boards[boardKey]?.includes(num)
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
                  ))}
                </div>
              )}

              {activeCategory.mode === 'previous-result' ? (
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
                    <input type="number" value={rangeFrom} onChange={e => setRangeFrom(parseInt(e.target.value) || 0)} className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none" />
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">To</label>
                    <input type="number" value={rangeTo} onChange={e => setRangeTo(parseInt(e.target.value) || 0)} className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-1 flex flex-col items-center">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={noRepeat} onChange={e => setNoRepeat(e.target.checked)} className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">No Repeats</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={oddMode} onChange={e => { setOddMode(e.target.checked); if (e.target.checked) setEvenMode(false); }} className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]" />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Odd</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={evenMode} onChange={e => { setEvenMode(e.target.checked); if (e.target.checked) setOddMode(false); }} className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]" />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Even</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeCategory.mode === 'digit-random' && (
            <div className="w-full space-y-3">
              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Numbers</label>
                <input
                  type="number" min="1" max="1000"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                  className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Digits (2-5)</label>
                <input
                  type="number" min="2" max="5"
                  value={digitLength}
                  onChange={(e) => {
                    let val = parseInt(e.target.value) || 3;
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
                    <input type="checkbox" checked={oddMode} onChange={e => { setOddMode(e.target.checked); if (e.target.checked) setEvenMode(false); }} className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]" />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Odd</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={evenMode} onChange={e => { setEvenMode(e.target.checked); if (e.target.checked) setOddMode(false); }} className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]" />
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">Even</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeCategory.mode === 'custom' && (
            <div className="w-full space-y-4">
              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Numbers to Generate</label>
                <input
                  type="number" min="1" max="100"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                  className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-xl p-3 pt-5 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-100 px-3 py-0.5 rounded text-[9px] font-black text-[#0f172a] uppercase tracking-widest text-center whitespace-nowrap">Main Pool</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Pick Main Ball</label>
                    <input type="number" min="1" max="100" value={customMainBalls} onChange={e => setCustomMainBalls(parseInt(e.target.value) || 1)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#f59e0b]/50" />
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Range From 1 To</label>
                    <input type="number" min="1" max="1000" value={customMainMax} onChange={e => setCustomMainMax(parseInt(e.target.value) || 1)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#f59e0b]/50" />
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-xl p-3 pt-5 relative mt-6">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-100 px-3 py-0.5 rounded text-[9px] font-bold text-[#b91c1c] uppercase tracking-widest text-center whitespace-nowrap">Bonus Pool</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Pick Bonus Ball</label>
                    <input type="number" min="0" max="50" value={customSpecialBalls} onChange={e => setCustomSpecialBalls(parseInt(e.target.value) || 0)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#f59e0b]/50" />
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Range From 1 To</label>
                    <input type="number" min="1" max="1000" value={customSpecialMax} onChange={e => setCustomSpecialMax(parseInt(e.target.value) || 1)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#f59e0b]/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 flex flex-col items-center border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={noRepeat} onChange={e => setNoRepeat(e.target.checked)} className="w-3.5 h-3.5 rounded text-[#f59e0b] focus:ring-[#f59e0b]" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 uppercase">No Matches Within Pools</span>
                </label>
              </div>
            </div>
          )}

          {activeCategory.mode === 'box' && activeCategory.id !== 'all-possible' && activeCategory.id !== 'board' && (
            <div className="w-full space-y-4">
              {Object.keys(boards).sort().map((boardKey) => (
                <div key={boardKey} className="w-full bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-6 flex flex-col items-center shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Board {boardKey}</span>
                  
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    {/* Row 1: 0-5 */}
                    <div className="flex justify-center gap-1.5 w-full">
                      {['0', '1', '2', '3', '4', '5'].map(num => (
                        <button
                          key={num}
                          onClick={() => toggleDigit(boardKey, num)}
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-base transition-all border-2 ${boards[boardKey]?.includes(num)
                            ? 'bg-[#f59e0b] border-amber-500 text-white shadow-md'
                            : 'bg-white border-slate-50 text-slate-300 hover:border-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    {/* Row 2: 6-9 */}
                    <div className="flex justify-center gap-1.5 w-full">
                      {['6', '7', '8', '9'].map(num => (
                        <button
                          key={num}
                          onClick={() => toggleDigit(boardKey, num)}
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-base transition-all border-2 ${boards[boardKey]?.includes(num)
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
              ))}
            </div>
          )}

          {activeCategory.mode === 'box' && activeCategory.id === 'all-possible' && (
            <div className="w-full grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Base Numbers</label>
                <input
                  type="text"
                  maxLength={10}
                  value={boxInput}
                  onChange={(e) => setBoxInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 123"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 font-black text-2xl text-center tracking-[0.3em] shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all font-mono"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Digits</label>
                <input
                  type="number"
                  min="2"
                  max={boxInput.length > 2 ? Math.min(boxInput.length, 10) : 10}
                  value={comboLength}
                  onChange={(e) => setComboLength(parseInt(e.target.value) || 2)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 font-black text-2xl text-center shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all font-mono"
                />
              </div>
            </div>
          )}

          <div className="w-full flex justify-center pt-4">
            <button
              onClick={generate}
              className="bg-[#f59e0b] hover:bg-amber-500 text-[#0f172a] font-black py-3.5 px-12 rounded-full shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
            >
              <RefreshCw size={14} className="" /> {activeCategory.id === 'all-possible' ? 'GENERATE BOX' : 'GENERATE'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-9 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Results</h3>
            <div className="flex gap-1.5">
              <button onClick={() => setResults([])} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all" title="Clear">
                <Trash2 size={16} />
              </button>
              <button onClick={handleCopy} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all border border-slate-200">
                <Copy size={12} /> {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 sm:p-6 min-h-[300px] shadow-sm flex flex-col">
            {results.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-200">
                <Wand2 size={48} className="opacity-10 animate-spin-slow" />
              </div>
            ) : (
              <div className="space-y-6">
                {(activeCategory.mode === 'box' || activeCategory.mode === 'digit-random' || activeCategory.mode === 'previous-result') && results[0]?.box && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">
                      {(activeCategory.mode === 'digit-random' || activeCategory.mode === 'previous-result') ? 'Generated' : 'Found'} {results[0].box.length} {(activeCategory.mode === 'digit-random' || activeCategory.mode === 'previous-result') ? 'Numbers' : 'Combinations'}
                    </div>
                    <div
                      className="w-full grid gap-1.5"
                      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
                    >
                      {results[0].box.map((comb: string, i: number) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 text-[#0f172a] font-black py-1.5 rounded-xl text-sm md:text-base tracking-[0.1em] hover:bg-slate-100 transition-colors text-center shadow-sm whitespace-nowrap overflow-hidden">
                          {comb}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activeCategory.mode === 'standard' || activeCategory.mode === 'number-random' || activeCategory.mode === 'custom') && results.map((ticket, i) => (
                  <div key={i} className="flex flex-row items-center justify-start sm:justify-center gap-1 sm:gap-3 px-2 py-3 sm:px-4 sm:py-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto custom-scrollbar">
                    {(activeCategory.mode === 'standard' || activeCategory.mode === 'custom') && (
                      <span className="text-[9px] font-black text-slate-300 w-4 sm:w-6 flex-shrink-0 text-center">#{i + 1}</span>
                    )}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {ticket?.main && ticket.main.map((n: number, idx: number) => (
                        <div key={`m-${idx}`} className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-xs md:text-base text-slate-700 shadow-inner">
                          {n}
                        </div>
                      ))}
                    </div>
                    {ticket.special && ticket.special.length > 0 && (
                      <div className="flex items-center gap-1 ml-0.5 pl-1 sm:ml-1 sm:pl-2 border-l-2 border-dashed border-slate-200 flex-shrink-0">
                        {ticket.special.map((n: number, idx: number) => (
                          <div key={`s-${idx}`} title={activeCategory.specialName} className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-amber-600 border border-white flex items-center justify-center font-bold text-xs md:text-base text-[#0f172a] shadow">
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
              <div className="mt-auto pt-8 flex flex-col items-center gap-4 border-t border-slate-50 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-[1px] w-8 bg-slate-100"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Share results</span>
                  <div className="h-[1px] w-8 bg-slate-100"></div>
                </div>
                
                <div className="flex gap-6">
                  <button onClick={() => shareSocial('whatsapp')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#25d366] text-white flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-all">
                      <MessageCircle size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">WhatsApp</span>
                  </button>
                  <button onClick={() => shareSocial('telegram')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-all">
                      <Send size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Telegram</span>
                  </button>
                  <button onClick={() => shareSocial('facebook')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#1877f2] text-white flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-all">
                      <Facebook size={24} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Facebook</span>
                  </button>
                  <button onClick={() => shareSocial('native')} className="flex flex-col items-center gap-2 group">
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
