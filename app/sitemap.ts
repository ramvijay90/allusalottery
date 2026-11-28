import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/db';
import State from '@/models/State';
import Game from '@/models/Game';
import { CATEGORIES } from '@/lib/lotteryCategories';

export const revalidate = 3600; // Cache sitemap for 1 hour to prevent DB connection spikes

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://allusalottery.com';

  const defaultLastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: defaultLastModified,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/live-results`,
      lastModified: defaultLastModified,
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/lucky-number-generator`,
      lastModified: defaultLastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...CATEGORIES.map((cat) => ({
      url: `${baseUrl}/lucky-number-generator/${cat.id}`,
      lastModified: defaultLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    {
      url: `${baseUrl}/guides/how-to-claim-lottery-anonymously`,
      lastModified: defaultLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: defaultLastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: defaultLastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: defaultLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: defaultLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    await connectToDatabase();

    // Add only active games with verified numbers to the sitemap (prevents indexing thin/empty games)
    const games = await Game.find({
      numbers: { $exists: true, $not: { $size: 0 } }
    }).select('stateSlug slug lastDrawDate').lean();

    const stateLatestMap = new Map<string, Date>();
    for (const g of games as any[]) {
      const d = g.lastDrawDate ? new Date(g.lastDrawDate) : defaultLastModified;
      const prev = stateLatestMap.get(g.stateSlug);
      if (!prev || d > prev) stateLatestMap.set(g.stateSlug, d);
    }

    // Add only states that have >= 1 active populated game (matches robots noindex gate on /results/[stateSlug])
    const states = await State.find().select('slug').lean();
    for (const state of states as any[]) {
      const stateLastMod = stateLatestMap.get(state.slug);
      if (!stateLastMod) continue;
      entries.push({
        url: `${baseUrl}/results/${state.slug}`,
        lastModified: stateLastMod,
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }

    for (const game of games as any[]) {
      const lastMod = game.lastDrawDate ? new Date(game.lastDrawDate) : defaultLastModified;
      // 1. Primary Game Results Hub
      entries.push({
        url: `${baseUrl}/results/${game.stateSlug}/${game.slug}`,
        lastModified: lastMod,
        changeFrequency: 'daily',
        priority: 0.85,
      });
      // 2. Dedicated Past History Archive
      entries.push({
        url: `${baseUrl}/results/${game.stateSlug}/${game.slug}/history`,
        lastModified: lastMod,
        changeFrequency: 'daily',
        priority: 0.75,
      });
      // 3. Dedicated 2026 Visual Chart & Analytics
      entries.push({
        url: `${baseUrl}/results/${game.stateSlug}/${game.slug}/chart`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
      // 4. Dedicated Lucky Number Generator Tab for this Lottery
      entries.push({
        url: `${baseUrl}/results/${game.stateSlug}/${game.slug}/lucky-numbers`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }
  } catch (error) {
    console.error('Failed to generate sitemap items from DB:', error);
  }

  return entries;
}
