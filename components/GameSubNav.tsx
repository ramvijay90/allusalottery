import Link from 'next/link';
import { Calendar, BarChart3, Clock, Sparkles } from 'lucide-react';

interface GameSubNavProps {
  stateSlug: string;
  gameSlug: string;
  currentSection: 'main' | 'history' | 'chart';
}

export default function GameSubNav({ stateSlug, gameSlug, currentSection }: GameSubNavProps) {
  const base = `/results/${stateSlug}/${gameSlug}`;

  const tabs = [
    {
      id: 'main',
      label: 'Latest Numbers',
      href: base,
      icon: <Sparkles size={16} />
    },
    {
      id: 'history',
      label: 'Past Draw History',
      href: `${base}/history`,
      icon: <Clock size={16} />
    },
    {
      id: 'chart',
      label: '2026 Visual Chart',
      href: `${base}/chart`,
      icon: <BarChart3 size={16} />
    }
  ];

  return (
    <nav aria-label="Game Sections" className="mb-8">
      <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 max-w-fit sm:mx-auto">
        {tabs.map((tab) => {
          const isActive = currentSection === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#0f172a] text-[#f59e0b] shadow-md shadow-slate-900/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-[#0f172a] hover:bg-white/60'
              }`}
            >
              <span className={isActive ? 'text-[#f59e0b]' : 'text-slate-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
