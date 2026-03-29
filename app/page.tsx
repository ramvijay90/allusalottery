import Link from 'next/link';
import { ArrowRight, MapPin, Trophy, Zap } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import State from '@/models/State';
import Game from '@/models/Game';

// Fetch states from DB for the homepage
async function getStates(country?: string) {
  try {
    await connectToDatabase();
    // Filter by country if provided
    const query: any = { country: { $ne: 'Europe' } };
    if (country) {
      // Handle "US" vs "Canada" cases
      query.country = country === 'US' ? 'US' : 'Canada';
    }
    
    // Sort by name
    const states = await State.find(query).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(states));
  } catch (error) {
    console.error("Database connection failed:", error);
    return [];
  }
}

async function getTopJackpots() {
  try {
    await connectToDatabase();
    const [powerball, mega, lottomax] = await Promise.all([
      Game.findOne({ name: /Powerball/i }).sort({ lastDrawDate: -1 }).lean(),
      Game.findOne({ name: /Mega Millions/i }).sort({ lastDrawDate: -1 }).lean(),
      Game.findOne({ name: /Lotto Max/i }).sort({ lastDrawDate: -1 }).lean(),
    ]);

    const formatJackpot = (game: any, defaultPrice: string) => {
      const dbPrice = game?.jackpot || '';
      let clean = dbPrice.split('US$')[0].trim(); // Clean up Canada dual-str
      if (!clean) return { price: defaultPrice, highlight: 'Million' };
      
      if (clean.includes('Billion')) return { price: clean.replace(/Billion/i, '').trim(), highlight: 'Billion' };
      if (clean.includes('Million')) return { price: clean.replace(/Million/i, '').trim(), highlight: 'Million' };
      return { price: clean, highlight: '' };
    };

    const formatDate = (date: Date | undefined) => {
      if (!date) return 'March 18, 2024';
      const d = new Date(date);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    return [
      { 
        name: 'Powerball', 
        slug: powerball?.slug || 'powerball', 
        state: powerball?.stateSlug || 'az', 
        ...formatJackpot(powerball, '$450'),
        lastDraw: formatDate(powerball?.lastDrawDate)
      },
      { 
        name: 'Mega Millions', 
        slug: mega?.slug || 'megamillions', 
        state: mega?.stateSlug || 'ca', 
        ...formatJackpot(mega, '$325'),
        lastDraw: formatDate(mega?.lastDrawDate)
      },
      { 
        name: 'Lotto Max', 
        slug: lottomax?.slug || 'lottomax', 
        state: lottomax?.stateSlug || 'ac', 
        ...formatJackpot(lottomax, '$70'),
        lastDraw: formatDate(lottomax?.lastDrawDate)
      },
    ];
  } catch (error) {
    console.error("Failed to fetch jackpots", error);
    return [
      { name: 'Powerball', slug: 'powerball', state: 'az', price: '$450', highlight: 'Million', lastDraw: 'March 18, 2024' },
      { name: 'Mega Millions', slug: 'megamillions', state: 'ca', price: '$325', highlight: 'Million', lastDraw: 'March 18, 2024' },
      { name: 'Lotto Max', slug: 'lottomax', state: 'ac', price: '$70', highlight: 'Million', lastDraw: 'March 18, 2024' },
    ];
  }
}

export const revalidate = 60; // Revalidate every minute

export default async function Home({ searchParams }: { searchParams: Promise<{ country?: string }> }) {
  const { country } = await searchParams;
  const states = await getStates(country);
  const jackpotGames = await getTopJackpots();

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative bg-[#0f172a] py-20 md:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <Zap size={14} className="text-[#f59e0b]" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Live Results & Updates</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
            Winning Numbers, <br />
            <span className="text-[#f59e0b]">Accurate & Instant.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            The professional destination for US & Canada lottery results. 
            Real-time data for Powerball, Mega Millions, and all state games.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#states" className="bg-[#f59e0b] hover:bg-amber-500 text-[#0f172a] px-8 py-4 rounded-xl font-black transition-all shadow-xl shadow-amber-900/40 active:scale-95 flex items-center gap-2">
              <MapPin size={20} /> BROWSE BY STATE
            </Link>
            <Link href="#jackpots" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-bold backdrop-blur-sm transition-all flex items-center gap-2">
              <Trophy size={20} className="text-[#f59e0b]" /> TOP JACKPOTS
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jackpots */}
      <section id="jackpots" className="container mx-auto px-4 -mt-12 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jackpotGames.map((game, i) => (
              <div key={game.name} className={`premium-card p-8 ${i === 0 ? 'bg-[#0f172a] border-white/10' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-6">
                  <span className={`font-black text-sm uppercase tracking-wider ${i === 0 ? 'text-slate-400' : 'text-slate-500'}`}>{game.name}</span>
                  <span className={`${i === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-700'} text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest`}>
                    Next Draw Today
                  </span>
                </div>
                <div className={`text-4xl font-black tracking-tighter mb-2 ${i === 0 ? 'text-white' : 'text-slate-900'}`}>
                  {game.price} {game.highlight && <span className="text-[#f59e0b]">{game.highlight}</span>}
                </div>
                <div className={`text-sm font-medium mb-8 ${i === 0 ? 'text-slate-400' : 'text-slate-500'}`}>Estimated Cash: $213.4M</div>

                <div className={`pt-6 border-t ${i === 0 ? 'border-white/5' : 'border-slate-100'} flex justify-between items-center`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Last Draw</span>
                    <span className={`text-sm font-bold ${i === 0 ? 'text-white' : 'text-slate-700'}`}>{game.lastDraw}</span>
                  </div>
                  <Link href={`/results/${game.state}/${game.slug}`} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${i === 0 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-900 hover:bg-[#0f172a] hover:text-white'}`}>
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
      </section>

        {/* States Grid */}
        <section id="states">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#f59e0b] rounded-full block"></span>
              {country ? `${country} Results` : 'Browse by State'}
            </h2>
            {country && (
              <Link href="/" className="text-sm font-bold text-slate-400 hover:text-[#0f172a] transition-all flex items-center gap-2">
                &times; CLEAR FILTER
              </Link>
            )}
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {states.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                <h3 className="font-bold text-xl mb-2">Initialize Database</h3>
                <p className="text-sm">Run the scraper to see state results here.</p>
              </div>
            ) : (
              states.map((state: any) => (
                <Link
                  href={`/results/${state.slug}`}
                  key={state._id}
                  className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#f59e0b]/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#0f172a] flex items-center justify-center font-black text-xs group-hover:bg-[#0f172a] group-hover:text-[#f59e0b] transition-all shadow-inner">
                      {state.slug.toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-[#0f172a]">{state.name}</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-[#f59e0b] group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
  );
}

