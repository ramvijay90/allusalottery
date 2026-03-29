'use client';

import React, { useState, useEffect } from 'react';
import { CATEGORIES, LotteryCategory } from '@/lib/lotteryCategories';
import { RefreshCw, Copy, Trash2, Wand2 } from 'lucide-react';

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

  // Results State
  const [results, setResults] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Board Strategy State (e.g., A: ['1', '2'], B: ['3'])
  const [boards, setBoards] = useState<Record<string, string[]>>({});
  const boardNames = ['A', 'B', 'C', 'D', 'E'];

  // Sync category defaults safely via useEffect to prevent hydration mismatch
  useEffect(() => {
    if (activeCategory.mode === 'standard') {
      setRangeFrom(activeCategory.mainRange?.[0] || 1);
      setRangeTo(activeCategory.mainRange?.[1] || 50);
      setNoRepeat(true);
      setOddMode(false);
      setEvenMode(false);
    }
    if (activeCategory.mode === 'box') {
      setBoxInput('');
    }

    // Initialize Boards for digit modes
    if (activeCategory.id.includes('digit') || activeCategory.id === 'board') {
      const initial: Record<string, string[]> = {};
      const count = activeCategory.customDigits || 3;
      for (let i = 0; i < count; i++) {
        initial[boardNames[i]] = [];
      }
      setBoards(initial);
    }

    setResults([]);
  }, [activeCategory]);

  const generateStandardLines = () => {
    const lines = [];
    const needed = activeCategory.mainBalls || 5;

    for (let i = 0; i < ticketCount; i++) {
      let pool = [];
      for (let x = rangeFrom; x <= rangeTo; x++) {
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
      if (activeCategory.specialBalls) {
        let spl = [];
        for (let j = 0; j < activeCategory.specialBalls; j++) {
          const min = activeCategory.specialRange?.[0] || 1;
          const max = activeCategory.specialRange?.[1] || 25;
          spl.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        lines.push({ main: line, special: spl });
      } else {
        lines.push({ main: line, special: [] });
      }
    }
    setResults(lines);
  };

  const getPermutations = (str: string): string[] => {
    if (str.length <= 1) return [str];
    const perms = new Set<string>();
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const remaining = str.slice(0, i) + str.slice(i + 1);
      for (const perm of getPermutations(remaining)) {
        perms.add(char + perm);
      }
    }
    return Array.from(perms);
  };

  const generateBoxLines = () => {
    if (activeCategory.mode === 'box' && activeCategory.id === 'all-possible') {
      if (!boxInput) return;
      const perms = getPermutations(boxInput);
      setResults([{ box: perms }]);
      return;
    }
    if (activeCategory.customDigits && boxInput.length !== activeCategory.customDigits) {
      alert(`Please enter exactly ${activeCategory.customDigits} digits.`);
      return;
    }
    if (!boxInput) return;

    const perms = getPermutations(boxInput);
    setResults([{ box: perms }]);
  };

  const generateBoardLines = () => {
    const activeBoardKeys = Object.keys(boards);
    if (activeBoardKeys.length === 0) return;
    if (activeBoardKeys.some(k => boards[k].length === 0)) {
      alert("Please select at least one digit for each board.");
      return;
    }

    // Cartesian Product of boards
    const f = (a: string[][]): string[][] => a.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]] as string[][]);
    const combinations = f(activeBoardKeys.map(k => boards[k]));
    setResults([{ box: combinations.map(c => c.join('')) }]);
  };

  const toggleDigit = (board: string, digit: string) => {
    setBoards(prev => {
      const current = prev[board] || [];
      const next = current.includes(digit) ? current.filter(d => d !== digit) : [...current, digit];
      return { ...prev, [board]: next.sort() };
    });
  };

  const generate = () => {
    if ((activeCategory.id.includes('digit') || activeCategory.id === 'board') && activeCategory.id !== 'all-possible') generateBoardLines();
    else if (activeCategory.mode === 'box') generateBoxLines();
    else generateStandardLines();
    setCopied(false);
  };

  const handleCopy = () => {
    if (results.length === 0) return;
    let text = '';

    if (activeCategory.mode === 'box') {
      text = results[0].box.join(', ');
    } else {
      text = results.map(r =>
        r.main.join(' - ') + (r.special?.length ? ` [${r.special.join(' - ')}]` : '')
      ).join('\n');
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

          {activeCategory.mode === 'standard' && (
            <div className="w-full space-y-3">
              <div className="flex flex-col items-center">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Numbers</label>
                <input
                  type="number" min="1" max="50"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                  className="w-16 bg-white border border-slate-200 rounded-lg py-1 font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                />
              </div>
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

          {(activeCategory.id.includes('digit') || activeCategory.id === 'board') && activeCategory.id !== 'all-possible' && (
            <div className="w-full space-y-6">
              {Object.keys(boards).map(boardKey => (
                <div key={boardKey} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Board {boardKey}</span>
                    <span className="text-[9px] font-bold text-slate-400 italic">{boards[boardKey].length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                      <button
                        key={num}
                        onClick={() => toggleDigit(boardKey, num)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all border ${boards[boardKey].includes(num)
                            ? 'bg-[#f59e0b] border-amber-600 text-[#0f172a] shadow-sm'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeCategory.mode === 'box' && !activeCategory.id.includes('digit') && (
            <div className="w-full space-y-4">
              <div className="flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Enter Number</label>
                <input
                  type="text"
                  maxLength={10}
                  value={boxInput}
                  onChange={(e) => setBoxInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={`e.g. 123`}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 font-black text-2xl text-center tracking-[0.3em] shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all font-mono"
                />
              </div>
            </div>
          )}

          <div className="w-full flex justify-center pt-4">
            <button
              onClick={generate}
              className="bg-[#f59e0b] hover:bg-amber-500 text-[#0f172a] font-black py-3.5 px-12 rounded-full shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
            >
              <RefreshCw size={14} className={results.length > 0 ? '' : ''} /> {activeCategory.id === 'all-possible' ? 'GENERATE BOX' : 'GENERATE'}
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

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 min-h-[300px] shadow-sm flex flex-col">
            {results.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-200">
                <Wand2 size={48} className="opacity-10 animate-spin-slow" />
              </div>
            ) : (
              <div className="space-y-6">
                {activeCategory.mode === 'box' && results[0]?.box && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">
                      Found {results[0].box.length} Combinations
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {results[0].box.map((comb: string, i: number) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 text-[#0f172a] font-black px-4 py-2 rounded-xl text-lg tracking-[0.1em] hover:bg-slate-100 transition-colors">
                          {comb}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeCategory.mode === 'standard' && results.map((ticket, i) => (
                  <div key={i} className="flex flex-wrap items-center justify-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-[10px] font-black text-slate-300 w-8">#{i + 1}</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {ticket?.main && ticket.main.map((n: number, idx: number) => (
                        <div key={`m-${idx}`} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-base text-slate-700 shadow-inner">
                          {n}
                        </div>
                      ))}
                    </div>
                    {ticket.special && ticket.special.length > 0 && (
                      <div className="flex items-center gap-2 ml-2 pl-4 border-l border-dashed border-slate-200">
                        {ticket.special.map((n: number, idx: number) => (
                          <div key={`s-${idx}`} title={activeCategory.specialName} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-amber-600 border border-white flex items-center justify-center font-bold text-base text-[#0f172a] shadow">
                            {n}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
