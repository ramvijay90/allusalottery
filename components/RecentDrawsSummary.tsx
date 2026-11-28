import Link from 'next/link';
import { cleanJackpot } from '@/lib/getGameData';

export interface RecentDrawSummaryItem {
  date?: string | Date;
  numbers?: string[];
  powerBall?: string;
  jackpot?: string;
}

interface RecentDrawsSummaryProps {
  gameName: string;
  stateSlug: string;
  gameSlug: string;
  history: RecentDrawSummaryItem[];
  maxItems?: number;
  showArchiveLink?: boolean;
}

/**
 * Renders a concise, crawlable SSR summary of recent draw dates, hyphenated numbers,
 * bonus balls, and jackpots aligned with top-ranking lottery result snippets.
 */
export default function RecentDrawsSummary({
  gameName,
  stateSlug,
  gameSlug,
  history,
  maxItems = 5,
  showArchiveLink = true,
}: RecentDrawsSummaryProps) {
  if (!history || history.length === 0) return null;

  return (
    <section
      aria-label={`Recent ${gameName} Past Winning Numbers`}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs mt-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-wider">
          {gameName} Numbers — Latest &amp; Last 6 Months Quick Summary
        </h2>
        {showArchiveLink && (
          <Link
            href={`/results/${stateSlug}/${gameSlug}/history`}
            className="text-xs font-extrabold text-amber-700 hover:text-amber-900 underline underline-offset-4"
          >
            View All Past Winning Numbers &rarr;
          </Link>
        )}
      </div>
      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
        {history.slice(0, maxItems).map((item, i) => {
          const dStr = item.date
            ? new Date(item.date).toLocaleDateString('en-US', {
                timeZone: 'UTC',
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })
            : '';
          const nums = Array.isArray(item.numbers) ? item.numbers.join(' - ') : '';
          const pb = item.powerBall ? `, Bonus ${item.powerBall}` : '';
          const jp = item.jackpot ? cleanJackpot(item.jackpot) : '';

          return (
            <li key={i} className="flex flex-wrap items-center gap-x-2">
              <strong className="text-[#0f172a]">{dStr}:</strong>
              <span>
                {nums}
                {pb}
              </span>
              {jp && <span className="text-amber-700 font-bold">({jp})</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
