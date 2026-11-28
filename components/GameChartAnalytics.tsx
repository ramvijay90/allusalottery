'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronRight, Download, Filter, Flame, Hash, Sparkles, TrendingUp, Zap, Clock, Grid, BarChart3, HelpCircle, Copy, Share2, Check, MessageCircle, Send, X, Mail } from 'lucide-react';

interface HistoryItem {
  date: string;
  numbers: string[];
  jackpot: string;
  powerBall?: string;
}

interface GameChartAnalyticsProps {
  initialHistory: HistoryItem[];
  gameName: string;
  stateName: string;
  gameId: string;
  cutoffDate: string;
  defaultTab?: 'latest' | 'monthly' | 'weekly' | 'yearly' | 'pending' | 'frequency' | 'table';
}

// Timezone: America/New_York (Eastern Time) matches the official draw time for US & Canadian national lotteries
function formatDateUTC(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      ...options,
    });
  } catch (e) {
    return dateStr;
  }
}

function formatWeekdayUTC(dateStr: string, format: 'short' | 'long' = 'short'): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      weekday: format,
    });
  } catch (e) {
    return '';
  }
}

// Clean messy/duplicated scraped jackpot strings (e.g. "CAS65 MillionUS$45.95 Million...")
function cleanJackpot(jackpotStr?: string): string {
  if (!jackpotStr) return '';
  let text = jackpotStr.trim();
  if (!text || text.toLowerCase() === 'official' || text.toLowerCase() === 'official result') return '';

  // Fix common scrape/OCR typo: CAS65 -> CA$65
  text = text.replace(/^CAS(?=\d)/i, 'CA$');

  // 1. Canadian Dollar pattern: CA$65 Million, CAD $12 Million, etc.
  const caMatch = text.match(/(?:CA\s?\$?|CAD\s?\$?)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (caMatch && caMatch[0].length >= 3) {
    let res = caMatch[0].trim();
    if (/^CA(?!\$)/i.test(res)) res = res.replace(/^CA/i, 'CA$');
    return res;
  }

  // 2. US Dollar pattern: US$45.95 Million, $2.65 Million, etc.
  const usMatch = text.match(/(?:US\s?\$?|\$)\s*[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (usMatch && usMatch[0].length >= 2) {
    return usMatch[0].trim();
  }

  // 3. Fallback: match any standalone value with Million/Billion
  const millionMatch = text.match(/[\d,.]+\s*(?:Trillion|Billion|Million|Thousand)/i);
  if (millionMatch) {
    return `$${millionMatch[0].trim()}`;
  }

  return text.length > 18 ? text.slice(0, 16) + '...' : text;
}

// Clean balls array to keep valid digits or alphanumeric card/sign/raffle tokens (filters out diff tags like +1, -1, +3)
function cleanNumbersList(numbers?: string[]): string[] {
  if (!Array.isArray(numbers)) return [];
  return numbers
    .map((n) => String(n).trim())
    .filter((n) => n.length > 0 && n.length <= 20 && !/^[+-]\d+$/.test(n) && !/^official$/i.test(n));
}

export default function GameChartAnalytics({
  initialHistory,
  gameName,
  stateName,
  gameId,
  cutoffDate,
  defaultTab = 'latest',
}: GameChartAnalyticsProps) {
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    (initialHistory || []).map((item) => ({
      ...item,
      numbers: cleanNumbersList(item.numbers),
      powerBall: item.powerBall && String(item.powerBall).trim().length > 0 ? String(item.powerBall).trim() : undefined,
    }))
  );

  // Sync if initialHistory prop changes
  useEffect(() => {
    if (Array.isArray(initialHistory) && initialHistory.length > 0) {
      setHistory(
        initialHistory.map((item) => ({
          ...item,
          numbers: cleanNumbersList(item.numbers),
          powerBall: item.powerBall && String(item.powerBall).trim().length > 0 ? String(item.powerBall).trim() : undefined,
        }))
      );
    }
  }, [initialHistory]);
  const [activeTab, setActiveTab] = useState<'latest' | 'monthly' | 'weekly' | 'yearly' | 'pending' | 'frequency' | 'table'>(defaultTab);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedWeekday, setSelectedWeekday] = useState<string>('all');
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingYear, setLoadingYear] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; text: string; url: string }>({
    title: '',
    text: '',
    url: '',
  });

  // Robust Clipboard Copy (Supports both HTTPS and HTTP LAN IP like 192.168.1.8)
  const copyTextToClipboard = (text: string) => {
    if (typeof window === 'undefined') return;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (err) {
      console.warn('Fallback copy failed', err);
    }
  };

  // Copy Chart Results / Analytics to Clipboard
  const handleCopy = (customText?: string) => {
    const latest = history[0];
    const defaultText = latest
      ? `📊 ${stateName} ${gameName} Results & Chart 2026\nDraw Date: ${formatDateUTC(latest.date, { month: 'short', day: 'numeric', year: 'numeric' })}\nWinning Numbers: ${latest.numbers.join(' - ')}${latest.powerBall ? ' [' + latest.powerBall + ']' : ''}\nJackpot: ${cleanJackpot(latest.jackpot) || 'Official Draw'}\nView Full Chart: ${typeof window !== 'undefined' ? window.location.href : 'https://allusalottery.com'}`
      : `${stateName} ${gameName} Chart & Results 2026`;

    const textToCopy = customText || defaultText;
    copyTextToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Direct Share
  const handleShareWhatsApp = (customMessage?: string) => {
    const latest = history[0];
    const defaultMessage = `📊 *${stateName} ${gameName} Winning Chart 2026*\nDate: ${latest ? formatDateUTC(latest.date, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}\nNumbers: ${latest ? latest.numbers.join(' - ') : ''}${latest?.powerBall ? ' [' + latest.powerBall + ']' : ''}\nJackpot: ${cleanJackpot(latest?.jackpot) || 'Official'}\n\nCheck live charts & stats here:\n${typeof window !== 'undefined' ? window.location.href : 'https://allusalottery.com'}`;
    const text = customMessage || defaultMessage;
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // Universal Share Trigger (Desktop: Pop up Available Apps Tray | Mobile: Native Share or Apps Tray)
  const handleOpenShareModal = (customText?: string) => {
    const latest = history[0];
    const defaultText = latest
      ? `📊 ${stateName} ${gameName} Winning Chart 2026\nDate: ${formatDateUTC(latest.date, { month: 'short', day: 'numeric', year: 'numeric' })}\nNumbers: ${latest.numbers.join(' - ')}${latest.powerBall ? ' [' + latest.powerBall + ']' : ''}\nJackpot: ${cleanJackpot(latest.jackpot) || 'Official'}`
      : `${stateName} ${gameName} Chart & Results 2026`;
    const text = customMessage(customText) || defaultText;
    const url = typeof window !== 'undefined' ? window.location.href : 'https://allusalottery.com';

    setShareData({
      title: `${stateName} ${gameName} Winning Numbers & Chart 2026`,
      text,
      url,
    });

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);
    // On mobile devices with native share sheet support, trigger native share first
    if (isMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      navigator.share({
        title: `${stateName} ${gameName} Chart 2026`,
        text: text,
        url: url,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          setShowShareModal(true);
        }
      });
    } else {
      // On desktop or mobile fallback, open the rich Available Apps tray
      setShowShareModal(true);
    }
  };

  const customMessage = (txt?: string) => txt;

  const handleShareNative = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareData.title || `${stateName} ${gameName} Results Chart 2026`,
          text: shareData.text || `Check the latest ${stateName} ${gameName} winning chart!`,
          url: shareData.url || (typeof window !== 'undefined' ? window.location.href : ''),
        });
      } catch (err) {}
    } else {
      setShowShareModal(true);
    }
  };

  const handleCopyLink = () => {
    const url = shareData.url || (typeof window !== 'undefined' ? window.location.href : '');
    copyTextToClipboard(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // 1. Core Analytics Calculations (Using UTC to Guarantee Identical SSR & Client Output)
  const analytics = useMemo(() => {
    const freqMap: Record<string, number> = {};
    const bonusFreqMap: Record<string, number> = {};
    let totalDraws = history.length;

    // Grouping structures
    const monthlyGroups: Record<string, HistoryItem[]> = {};
    const yearlyGroups: Record<string, HistoryItem[]> = {};
    const weekdayGroups: Record<string, HistoryItem[]> = {
      Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: []
    };

    history.forEach((draw) => {
      const d = new Date(draw.date);
      const yKey = `${d.getUTCFullYear()}`;
      const mKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const wDay = formatWeekdayUTC(draw.date, 'short');

      // Monthly & Yearly
      if (!monthlyGroups[mKey]) monthlyGroups[mKey] = [];
      monthlyGroups[mKey].push(draw);

      if (!yearlyGroups[yKey]) yearlyGroups[yKey] = [];
      yearlyGroups[yKey].push(draw);

      // Weekday
      if (weekdayGroups[wDay]) {
        weekdayGroups[wDay].push(draw);
      }

      // Ball Frequencies
      draw.numbers.forEach((num) => {
        freqMap[num] = (freqMap[num] || 0) + 1;
      });
      if (draw.powerBall) {
        bonusFreqMap[draw.powerBall] = (bonusFreqMap[draw.powerBall] || 0) + 1;
      }
    });

    const sortedFreq = Object.entries(freqMap)
      .map(([number, count]) => ({ number, count, percent: totalDraws > 0 ? Math.round((count / totalDraws) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    const hotNumbers = sortedFreq.slice(0, 6);
    const coldNumbers = [...sortedFreq].reverse().slice(0, 6);

    // 2. Pending / Overdue Numbers Calculation (Like Klsite PendingChart)
    // Find how many draws have elapsed since each number was last seen
    const pendingMap: Record<string, { drawsAgo: number; lastDate: string }> = {};
    
    // Sort draws descending
    const descDraws = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Check all numbers that have ever appeared
    Object.keys(freqMap).forEach((num) => {
      const index = descDraws.findIndex((d) => d.numbers.includes(num));
      if (index !== -1) {
        pendingMap[num] = {
          drawsAgo: index,
          lastDate: descDraws[index].date,
        };
      }
    });

    const pendingList = Object.entries(pendingMap)
      .map(([number, info]) => ({ number, ...info }))
      .sort((a, b) => b.drawsAgo - a.drawsAgo); // most overdue first

    return {
      hotNumbers,
      coldNumbers,
      sortedFreq,
      monthlyGroups,
      yearlyGroups,
      weekdayGroups,
      pendingList,
      totalDraws,
    };
  }, [history]);

  // Deep Archive Years list from current year down to 2005
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    // Add years from loaded history
    history.forEach(item => {
      const yr = `${new Date(item.date).getUTCFullYear()}`;
      yearsSet.add(yr);
    });
    // Add full historical options from 2026 down to 2005
    for (let y = 2026; y >= 2005; y--) {
      yearsSet.add(`${y}`);
    }
    return Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [history]);

  // Handle Year Change & Lazy Fetch Historical Year Data
  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    if (year === 'all') return;

    // Check if we already have draws for this year in memory
    const hasDrawsForYear = history.some((item) => {
      const d = new Date(item.date);
      return `${d.getUTCFullYear()}` === year;
    });

    if (!hasDrawsForYear) {
      setLoadingYear(true);
      try {
        const res = await fetch(`/api/history?gameId=${gameId}&year=${year}&limit=365`);
        const yearResults: HistoryItem[] = await res.json();
        if (Array.isArray(yearResults) && yearResults.length > 0) {
          setHistory((prev) => {
            const existingDates = new Set(prev.map(p => p.date.substring(0, 10)));
            const cleanYearResults = yearResults.map(y => ({
              ...y,
              numbers: cleanNumbersList(y.numbers),
              powerBall: y.powerBall && /^\d+$/.test(String(y.powerBall).trim()) ? String(y.powerBall).trim() : undefined,
            }));
            const newItems = cleanYearResults.filter(y => !existingDates.has(y.date.substring(0, 10)));
            return [...prev, ...newItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          });
        }
      } catch (e) {
        console.error('Failed to fetch historical year draws:', e);
      } finally {
        setLoadingYear(false);
      }
    }
  };

  // Filtered draws based on year filter, month filter, and number search (UTC based)
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const d = new Date(item.date);
      const yKey = `${d.getUTCFullYear()}`;
      const mKey = String(d.getUTCMonth() + 1).padStart(2, '0');
      
      const matchesYear = selectedYear === 'all' || yKey === selectedYear;
      const matchesMonth = selectedMonth === 'all' || mKey === selectedMonth;
      const matchesSearch =
        !searchNumber.trim() ||
        item.numbers.some((n) => n.includes(searchNumber.trim())) ||
        (item.powerBall && item.powerBall.includes(searchNumber.trim()));

      return matchesYear && matchesMonth && matchesSearch;
    });
  }, [history, selectedYear, selectedMonth, searchNumber]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/history?gameId=${gameId}&page=${nextPage}&limit=30&cutoff=${cutoffDate}`);
      const newResults = await res.json();

      if (newResults.length === 0) {
        setHasMore(false);
      } else {
        setHistory([...history, ...newResults]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section suppressHydrationWarning className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden mb-16 relative">
      {/* Universal Share Apps Modal (Desktop & Mobile) */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Share2 size={18} className="text-[#f59e0b]" />
                  <span>Share {stateName} {gameName}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose an app below to share latest numbers & charts
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* App Share Grid (Desktop & Mobile) */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + '\n' + shareData.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform mb-1.5">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-black text-emerald-950">WhatsApp</span>
                <span className="text-[10px] text-emerald-600 font-bold">Chat</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform mb-1.5">
                  <Send size={22} />
                </div>
                <span className="text-xs font-black text-sky-950">Telegram</span>
                <span className="text-[10px] text-sky-600 font-bold">Channel</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform mb-1.5">
                  <span className="text-2xl font-black font-serif">f</span>
                </div>
                <span className="text-xs font-black text-blue-950">Facebook</span>
                <span className="text-[10px] text-blue-600 font-bold">Post</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-110 transition-transform mb-1.5">
                  <span className="text-lg font-black">𝕏</span>
                </div>
                <span className="text-xs font-black text-slate-900">X (Twitter)</span>
                <span className="text-[10px] text-slate-500 font-bold">Tweet</span>
              </a>

              {/* Reddit */}
              <a
                href={`https://reddit.com/submit?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FF4500] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform mb-1.5 font-black text-xl">
                  r/
                </div>
                <span className="text-xs font-black text-orange-950">Reddit</span>
                <span className="text-[10px] text-orange-600 font-bold">Share</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EA4335] text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform mb-1.5">
                  <Mail size={22} />
                </div>
                <span className="text-xs font-black text-rose-950">Email</span>
                <span className="text-[10px] text-rose-600 font-bold">Gmail</span>
              </a>
            </div>

            {/* Mobile / System Native Share Option */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleShareNative}
                className="w-full mb-4 py-3 px-4 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Share2 size={16} className="text-[#f59e0b]" />
                <span>More Apps / Device Share Sheet</span>
              </button>
            )}

            {/* Direct Copy Link Bar */}
            <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareData.url || (typeof window !== 'undefined' ? window.location.href : '')}
                className="bg-transparent text-xs font-bold text-slate-700 w-full px-2 outline-none select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
              >
                {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Toast Notification on Copy */}
      {copied && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider animate-bounce border-2 border-white">
          <Check size={18} className="text-white" />
          <span>Winning Numbers Copied to Clipboard!</span>
        </div>
      )}

      {/* Top Header with Master Branding & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-5 sm:p-7 md:p-8 space-y-6">
        {/* Title, Badge & Subtitle */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#f59e0b] text-xs font-black uppercase tracking-wider mb-2.5 border border-white/10">
            <Sparkles size={14} className="shrink-0" />
            <span>Official 2026 Chart & Statistical Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            {stateName} {gameName} Comprehensive Results Chart
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            Monthly Charts • Weekly Breakdown • Yearly Archives • Overdue Pending Numbers • Ball Frequencies
          </p>
        </div>

        {/* Dedicated Actions & Stat Bar (Full Width, Never Collides or Cuts Off) */}
        <div className="pt-5 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Quick Stat Pill */}
          <div className="flex items-center justify-between sm:justify-start gap-4 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Draws Recorded</div>
              <div className="text-xl font-black text-white">{analytics.totalDraws}</div>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Archive Range</div>
              <div className="text-xs font-black text-[#f59e0b]">365 Days Verified</div>
            </div>
          </div>

          {/* Prominent Copy & Share Action Buttons */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => handleCopy()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 px-3 sm:px-4 h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
              title="Copy Winning Numbers to Clipboard"
            >
              {copied ? <Check size={16} className="text-slate-950 shrink-0" /> : <Copy size={16} className="shrink-0" />}
              <span>{copied ? 'Copied!' : 'Copy Numbers'}</span>
            </button>

            <button
              onClick={() => handleShareWhatsApp()}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white border-2 border-emerald-400 px-3 sm:px-4 h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
              title="Share via WhatsApp"
            >
              <MessageCircle size={16} className="shrink-0" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => handleOpenShareModal()}
              className="bg-sky-600 hover:bg-sky-500 text-white border-2 border-sky-400 px-3 sm:px-4 h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 whitespace-nowrap"
              title="Share Chart via Apps"
            >
              <Share2 size={16} className="shrink-0" />
              <span>Share Via</span>
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED HIGH-CONTRAST TAB NAVIGATION BAR (Super Clear for New Users) */}
      <div className="bg-slate-100 p-4 sm:p-5 border-b-2 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>📊 Select Chart View (Click any tab below to switch):</span>
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            Current: <span className="text-amber-600 font-black uppercase">{activeTab} view</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {[
            { id: 'latest', name: 'Latest Chart', icon: Zap, count: `${history.length}` },
            { id: 'monthly', name: 'Monthly Chart', icon: Calendar, count: `${Object.keys(analytics.monthlyGroups).length} Mo` },
            { id: 'weekly', name: 'Weekly Chart', icon: Clock, count: 'Day-Wise' },
            { id: 'yearly', name: 'Yearly Chart', icon: Grid, count: `${Object.keys(analytics.yearlyGroups).length} Yr` },
            { id: 'pending', name: 'Pending Numbers', icon: HelpCircle, count: 'Overdue' },
            { id: 'frequency', name: 'Hot & Cold', icon: Flame, count: 'Stats' },
            { id: 'table', name: 'Full Table', icon: Hash, count: 'Data' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 text-center whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-2 border-amber-600 shadow-xl shadow-amber-500/40 ring-4 ring-amber-300 scale-[1.03]'
                    : 'bg-white text-slate-800 hover:bg-slate-200 hover:text-slate-950 border-2 border-slate-300 shadow-sm'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-slate-950' : 'text-amber-600'} />
                <span>{tab.name}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LATEST CHART TAB (Visual Cards Gallery) */}
      {/* ========================================================================= */}
      {activeTab === 'latest' && (
        <div className="p-6 sm:p-8 space-y-8">
          {/* Quick Filters & View Actions */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              {/* Year Dropdown (2005 - 2026 Deep Archive) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 shadow-xs shrink-0">
                <Calendar size={14} className="text-amber-600 shrink-0" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs font-black focus:outline-none cursor-pointer whitespace-nowrap"
                >
                  <option value="all">All Years (2005 - 2026)</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} Archive
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 shadow-xs shrink-0">
                <Clock size={14} className="text-slate-500 shrink-0" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs font-black focus:outline-none cursor-pointer whitespace-nowrap"
                >
                  <option value="all">All Months</option>
                  <option value="01">January (01)</option>
                  <option value="02">February (02)</option>
                  <option value="03">March (03)</option>
                  <option value="04">April (04)</option>
                  <option value="05">May (05)</option>
                  <option value="06">June (06)</option>
                  <option value="07">July (07)</option>
                  <option value="08">August (08)</option>
                  <option value="09">September (09)</option>
                  <option value="10">October (10)</option>
                  <option value="11">November (11)</option>
                  <option value="12">December (12)</option>
                </select>
              </div>

              {/* Quick Search */}
              <div className="relative shrink-0">
                <input
                  type="text"
                  placeholder="Search number (e.g. 17)..."
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  className="w-full sm:w-44 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 h-10 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
                {searchNumber && (
                  <button
                    onClick={() => setSearchNumber('')}
                    className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Active Filter Clear Button */}
              {(selectedYear !== 'all' || selectedMonth !== 'all' || searchNumber) && (
                <button
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedMonth('all');
                    setSearchNumber('');
                  }}
                  className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3.5 h-10 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1 active:scale-95"
                >
                  <span>Clear Filters</span>
                  <span className="font-bold">✕</span>
                </button>
              )}
            </div>

            {/* Quick Share / Copy for this Tab */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(`📊 ${stateName} ${gameName} Latest Numbers:\n` + filteredHistory.slice(0, 5).map(h => `${formatDateUTC(h.date, { month: 'short', day: 'numeric', year: 'numeric' })}: ${h.numbers.join('-')}${h.powerBall ? ' ['+h.powerBall+']' : ''}`).join('\n'))}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-slate-300 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Copy Latest Numbers to Clipboard"
              >
                <Copy size={15} className="text-slate-600 shrink-0" />
                <span className="whitespace-nowrap">Copy Draws</span>
              </button>
              <button
                onClick={() => handleOpenShareModal(`📊 ${stateName} ${gameName} Latest Draws:\n` + filteredHistory.slice(0, 3).map(h => `${formatDateUTC(h.date, { month: 'short', day: 'numeric' })}: ${h.numbers.join('-')}`).join('\n'))}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Share via Apps / WhatsApp"
              >
                <Share2 size={15} className="text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">Share Draws</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator for Deep Archive Year Fetch */}
          {loadingYear && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-center text-xs font-black text-amber-950 flex items-center justify-center gap-2 animate-pulse shadow-sm">
              <Sparkles size={16} className="text-amber-600 animate-spin" />
              <span>Fetching {selectedYear} Drawings Archive from Database...</span>
            </div>
          )}

          {/* Empty State */}
          {filteredHistory.length === 0 && !loadingYear && (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-500 my-4">
              <div className="text-3xl mb-2">📅</div>
              <h4 className="font-black text-slate-900 text-base mb-1">
                No drawings found for {selectedYear !== 'all' ? selectedYear : ''} {selectedMonth !== 'all' ? `Month ${selectedMonth}` : ''}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {selectedYear !== 'all' && parseInt(selectedYear) < 2026
                  ? `Historical records for ${selectedYear} have not been backfilled yet. Run the deep history batch scraper to populate ${selectedYear} drawings into MongoDB.`
                  : 'Try selecting a different year or month from the dropdowns above.'}
              </p>
            </div>
          )}

          {/* Chart Cards Grid - Spacious layout for 5-ball, 6-ball & 7-ball schemes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredHistory.map((item, idx) => {
              const formattedDate = formatDateUTC(item.date, { month: 'short', day: 'numeric', year: 'numeric' });
              const weekday = formatWeekdayUTC(item.date, 'short');
              const cleanJp = cleanJackpot(item.jackpot);

              return (
                <div
                  key={idx}
                  className="bg-slate-50/70 hover:bg-amber-50/40 border-2 border-slate-200/80 hover:border-amber-300 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#f59e0b] font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                        {weekday}
                      </span>
                      <div>
                        <div className="text-xs font-black text-slate-900">{formattedDate}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{gameName}</div>
                      </div>
                    </div>
                    {cleanJp && (
                      <span className="text-[11px] font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl shadow-xs whitespace-nowrap">
                        💰 {cleanJp}
                      </span>
                    )}
                  </div>

                  {/* Balls Layout - Responsive, never isolates a single ball */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 my-2.5">
                    {item.numbers.map((num, i) => {
                      const isHighlighted = searchNumber.trim() && num.includes(searchNumber.trim());
                      return (
                        <span
                          key={i}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center shadow-xs border-2 transition-all shrink-0 ${
                            isHighlighted
                              ? 'bg-amber-500 text-white border-amber-600 scale-110 ring-2 ring-amber-300'
                              : 'bg-white text-slate-900 border-slate-200 group-hover:border-amber-300'
                          }`}
                        >
                          {num}
                        </span>
                      );
                    })}
                    {item.powerBall && (
                      <div className="flex items-center gap-1.5 pl-1.5 ml-0.5 border-l-2 border-slate-200 shrink-0">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white ring-2 ring-red-300 shrink-0">
                          {item.powerBall}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold flex items-center justify-between pt-2 border-t border-slate-200/50 mt-1">
                    <span>Verified Drawing</span>
                    <span className="text-emerald-600 font-black">Official</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MONTHLY CHART TAB (Klsite Style Grouped by Month) */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="p-6 sm:p-8 space-y-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">
              {gameName} Monthly Result Chart Gallery
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Draw results grouped chronologically by month with full ball combinations.
            </p>
          </div>

          <div className="space-y-6">
            {Object.keys(analytics.monthlyGroups).map((mKey) => {
              const [yr, mo] = mKey.split('-');
              const monthName = new Date(Date.UTC(parseInt(yr, 10), parseInt(mo, 10) - 1, 1)).toLocaleString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
              const monthDraws = analytics.monthlyGroups[mKey];

              return (
                <div key={mKey} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between">
                    <span className="font-black text-sm uppercase tracking-wider text-[#f59e0b] flex items-center gap-2">
                      <Calendar size={16} />
                      {monthName}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {monthDraws.length} Drawings
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {monthDraws.map((d, i) => {
                      const cleanJp = cleanJackpot(d.jackpot);
                      return (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group">
                          <div>
                            <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                              <span>{formatDateUTC(d.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">({formatWeekdayUTC(d.date, 'short')})</span>
                            </div>
                            {cleanJp ? (
                              <div className="text-[11px] text-amber-900 font-black mt-0.5">💰 {cleanJp}</div>
                            ) : (
                              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Official Drawing</div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                            {d.numbers.map((n, idx) => (
                              <span key={idx} className="w-8 h-8 rounded-xl bg-slate-50 text-slate-900 text-xs font-black flex items-center justify-center border-2 border-slate-200 group-hover:border-amber-300 shadow-xs shrink-0">
                                {n}
                              </span>
                            ))}
                            {d.powerBall && (
                              <div className="flex items-center gap-1.5 pl-1 ml-0.5 border-l-2 border-slate-200 shrink-0">
                                <span className="w-8 h-8 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-red-300 shrink-0">
                                  {d.powerBall}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WEEKLY CHART TAB (Clean Day-of-Week Segmentation & Full Ball Display) */}
      {/* ========================================================================= */}
      {activeTab === 'weekly' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight flex items-center gap-2">
                <span>🕒</span> {gameName} Weekly Day-Wise Drawing Chart
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Filter and analyze drawings segmented by day of the week (Monday through Sunday).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(`📊 ${stateName} ${gameName} Weekly Breakdown:\n` + Object.entries(analytics.weekdayGroups).filter(([_, list]) => list.length > 0).map(([day, list]) => `${day}: ${list.length} draws (Latest: ${formatDateUTC(list[0]?.date, { month: 'short', day: 'numeric' })}: ${list[0]?.numbers.join('-')})`).join('\n'))}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-slate-300 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Copy Weekly Summary"
              >
                <Copy size={14} className="text-slate-600 shrink-0" />
                <span className="whitespace-nowrap">Copy Summary</span>
              </button>
              <button
                onClick={() => handleOpenShareModal(`📊 *${stateName} ${gameName} Weekly Drawing Chart:*\n` + Object.entries(analytics.weekdayGroups).filter(([_, list]) => list.length > 0).map(([day, list]) => `• ${day}: ${list.length} draws`).join('\n'))}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Share Weekly Chart"
              >
                <Share2 size={14} className="text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">Share Via</span>
              </button>
            </div>
          </div>

          {/* Interactive Weekday Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedWeekday('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                selectedWeekday === 'all'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              All Weekdays ({history.length})
            </button>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const count = analytics.weekdayGroups[day]?.length || 0;
              if (count === 0) return null;
              const isSelected = selectedWeekday === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedWeekday(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md border-2 border-amber-600 ring-2 ring-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Weekday Cards Display with Full Balls */}
          <div className="space-y-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              .filter((day) => selectedWeekday === 'all' || selectedWeekday === day)
              .map((day) => {
                const dayDraws = analytics.weekdayGroups[day] || [];
                if (dayDraws.length === 0) return null;

                return (
                  <div key={day} className="bg-slate-50/70 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
                    {/* Day Group Header */}
                    <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between">
                      <span className="font-black text-sm uppercase tracking-wider text-[#f59e0b] flex items-center gap-2">
                        <Clock size={16} />
                        {day} Drawings ({dayDraws.length} Draws)
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Historical Drawings
                      </span>
                    </div>

                    {/* Drawings Grid with Full Balls */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {dayDraws.map((d, i) => {
                        const cleanJp = cleanJackpot(d.jackpot);
                        return (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between gap-3 group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#f59e0b] font-black text-xs flex items-center justify-center shrink-0">
                                  {day}
                                </span>
                                <span className="text-xs font-black text-slate-900">
                                  {formatDateUTC(d.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              {cleanJp && (
                                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-200">
                                  💰 {cleanJp}
                                </span>
                              )}
                            </div>

                            {/* Full Ball Layout - All balls fit cleanly */}
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                              {d.numbers.map((n, idx) => (
                                <span
                                  key={idx}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center border-2 border-slate-200 group-hover:border-amber-400 shadow-xs shrink-0"
                                >
                                  {n}
                                </span>
                              ))}
                              {d.powerBall && (
                                <div className="flex items-center gap-1.5 pl-1.5 ml-0.5 border-l-2 border-slate-200 shrink-0">
                                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white ring-2 ring-red-200 shrink-0">
                                    {d.powerBall}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. YEARLY CHART TAB (Annual Breakdown) */}
      {/* ========================================================================= */}
      {activeTab === 'yearly' && (
        <div className="p-6 sm:p-8 space-y-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">
              {gameName} Annual Drawing Archive
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Full drawing statistics segmented by annual lottery calendar.
            </p>
          </div>

          <div className="space-y-6">
            {Object.keys(analytics.yearlyGroups).map((year) => {
              const yearDraws = analytics.yearlyGroups[year];

              return (
                <div key={year} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <h4 className="text-2xl font-black text-[#0f172a]">{year} Calendar Chart</h4>
                      <p className="text-xs text-slate-400">Total drawings recorded: {yearDraws.length}</p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs">
                      {year} Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {yearDraws.slice(0, 36).map((d, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center hover:border-amber-400 transition-all">
                        <div className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-center gap-1">
                          <span>{formatDateUTC(d.date, { month: 'short', day: 'numeric' })}</span>
                          <span className="text-slate-400 font-normal">({formatWeekdayUTC(d.date, 'short')})</span>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center items-center">
                          {d.numbers.map((n, idx) => (
                            <span key={idx} className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-900 font-bold text-[11px] flex items-center justify-center shadow-xs">
                              {n}
                            </span>
                          ))}
                          {d.powerBall && (
                            <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                              {d.powerBall}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PENDING NUMBERS TAB (Klsite Style Overdue Number Tracking) */}
      {/* ========================================================================= */}
      {activeTab === 'pending' && (
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight flex items-center gap-2">
                <span>🔥</span> {gameName} Pending & Overdue Numbers Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Discover which numbers have not been drawn for the longest period (overdue draws tracker).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(`🔥 ${stateName} ${gameName} Overdue Numbers:\n` + analytics.pendingList.slice(0, 10).map((p, i) => `#${i+1} Ball ${p.number} (${p.drawsAgo} draws ago)`).join('\n') + `\n\nFull Chart: ${typeof window !== 'undefined' ? window.location.href : ''}`)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-slate-300 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Copy Overdue Numbers"
              >
                <Copy size={14} className="text-slate-600 shrink-0" />
                <span className="whitespace-nowrap">Copy Overdue</span>
              </button>
              <button
                onClick={() => handleShareWhatsApp(`🔥 *${stateName} ${gameName} Top Overdue Numbers:*\n` + analytics.pendingList.slice(0, 8).map((p, i) => `${i+1}. Ball *${p.number}* - ${p.drawsAgo} draws ago`).join('\n') + `\n\nCheck live overdue chart:\n${typeof window !== 'undefined' ? window.location.href : ''}`)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Share Overdue Numbers on WhatsApp"
              >
                <MessageCircle size={14} className="text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">WhatsApp</span>
              </button>
              <button
                onClick={() => handleOpenShareModal(`🔥 *${stateName} ${gameName} Overdue Numbers:*\n` + analytics.pendingList.slice(0, 8).map((p, i) => `#${i+1} Ball ${p.number} (${p.drawsAgo} draws ago)`).join('\n'))}
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Share Overdue Numbers via Apps"
              >
                <Share2 size={14} className="text-sky-600 shrink-0" />
                <span className="whitespace-nowrap">Share Via</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {analytics.pendingList.map((item, idx) => {
              const isCriticallyPending = item.drawsAgo >= 15;
              const isModerate = item.drawsAgo >= 8 && item.drawsAgo < 15;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isCriticallyPending
                      ? 'bg-rose-50/80 border-rose-200 shadow-sm'
                      : isModerate
                      ? 'bg-amber-50/80 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl text-lg font-black flex items-center justify-center mx-auto mb-2 shadow-sm ${
                      isCriticallyPending
                        ? 'bg-rose-600 text-white'
                        : isModerate
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {item.number}
                  </div>

                  <div className="text-xs font-black text-slate-900">
                    {item.drawsAgo === 0 ? 'Drawn Today' : `${item.drawsAgo} Draws Ago`}
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {formatDateUTC(item.lastDate, { month: 'short', day: 'numeric' })}
                  </div>

                  {isCriticallyPending && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-black text-[9px] uppercase tracking-wider">
                      Overdue 🔥
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. HOT & COLD FREQUENCY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'frequency' && (
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight flex items-center gap-2">
                <span>🔥</span> {gameName} Hot & Cold Ball Frequencies
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Statistical frequency analysis of most drawn and least drawn lottery balls.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(`🔥 ${stateName} ${gameName} Hot Numbers: ` + analytics.hotNumbers.map(h => `${h.number} (${h.count}x)`).join(', ') + `\n❄️ Cold Numbers: ` + analytics.coldNumbers.map(c => `${c.number} (${c.count}x)`).join(', ') + `\n\nFull Stats: ${typeof window !== 'undefined' ? window.location.href : ''}`)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-slate-300 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Copy Hot & Cold Stats"
              >
                <Copy size={14} className="text-slate-600 shrink-0" />
                <span className="whitespace-nowrap">Copy Stats</span>
              </button>
              <button
                onClick={() => handleShareWhatsApp(`📊 *${stateName} ${gameName} Hot & Cold Analysis*\n🔥 *Hot Balls:* ` + analytics.hotNumbers.map(h => `${h.number}`).join(', ') + `\n❄️ *Cold Balls:* ` + analytics.coldNumbers.map(c => `${c.number}`).join(', ') + `\n\nFull Chart: ${typeof window !== 'undefined' ? window.location.href : ''}`)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Share Hot & Cold Stats on WhatsApp"
              >
                <MessageCircle size={14} className="text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">WhatsApp</span>
              </button>
              <button
                onClick={() => handleOpenShareModal(`📊 *${stateName} ${gameName} Hot & Cold Analysis:*\n🔥 *Hot Balls:* ` + analytics.hotNumbers.map(h => `${h.number}`).join(', ') + `\n❄️ *Cold Balls:* ` + analytics.coldNumbers.map(c => `${c.number}`).join(', '))}
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 px-3.5 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-95"
                title="Share Hot & Cold Stats via Apps"
              >
                <Share2 size={14} className="text-sky-600 shrink-0" />
                <span className="whitespace-nowrap">Share Via</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HOT NUMBERS */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Flame size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-amber-950 uppercase tracking-tight">Hot Numbers (Most Drawn)</h3>
                  <p className="text-xs text-amber-700/80 font-medium">Balls that have appeared with highest frequency in past draws</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {analytics.hotNumbers.map((h, i) => (
                  <div key={i} className="bg-white border border-amber-200/80 rounded-xl p-3 text-center shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white text-lg font-black flex items-center justify-center mx-auto mb-1 shadow-md shadow-amber-500/30">
                      {h.number}
                    </div>
                    <div className="text-xs font-black text-slate-800">{h.count} Times</div>
                    <div className="text-[10px] text-slate-400 font-bold">{h.percent}% of draws</div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLD NUMBERS */}
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Zap size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-blue-950 uppercase tracking-tight">Cold Numbers (Overdue)</h3>
                  <p className="text-xs text-blue-700/80 font-medium">Least drawn numbers that may be statistically overdue</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {analytics.coldNumbers.map((c, i) => (
                  <div key={i} className="bg-white border border-blue-200/80 rounded-xl p-3 text-center shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white text-lg font-black flex items-center justify-center mx-auto mb-1 shadow-md shadow-blue-600/30">
                      {c.number}
                    </div>
                    <div className="text-xs font-black text-slate-800">{c.count} Times</div>
                    <div className="text-[10px] text-slate-400 font-bold">{c.percent}% of draws</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Frequency Distribution */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
              Complete Ball Frequency Distribution ({gameName})
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {analytics.sortedFreq.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm text-xs font-bold"
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
                    {item.number}
                  </span>
                  <span className="text-slate-500 text-[11px]">{item.count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DETAILED TABLE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'table' && (
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a] text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6">Draw Date</th>
                <th className="p-6">Winning Numbers</th>
                <th className="p-6 text-right">Jackpot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 transition-all">
              {filteredHistory.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-black text-sm uppercase">
                        {formatDateUTC(item.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatWeekdayUTC(item.date, 'long')}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {item.numbers.map((n: string, i: number) => (
                        <span
                          key={i}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-[#0f172a] text-xs font-black flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:border-[#f59e0b]/30 transition-all shadow-sm"
                        >
                          {n}
                        </span>
                      ))}
                      {item.powerBall && (
                        <span className="w-8 h-8 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                          {item.powerBall}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <span className="text-sm font-black text-[#0f172a] bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                      {cleanJackpot(item.jackpot) || 'Official Draw'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap size={14} className="text-[#f59e0b]" />
            <span>{loading ? 'Fetching Records...' : 'Load Complete Drawing History'}</span>
          </button>
        </div>
      )}
    </section>
  );
}
