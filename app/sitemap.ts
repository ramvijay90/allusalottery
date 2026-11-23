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
    
    // Add all active states to the sitemap
    const states = await State.find().lean();
    for (const state of states) {
      entries.push({
        url: `${baseUrl}/results/${state.slug}`,
        lastModified: defaultLastModified, // Could use last update timestamp if available
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }

    // Add only active games with verified numbers to the sitemap (prevents indexing thin/empty games)
    const games = await Game.find({
      numbers: { $exists: true, $not: { $size: 0 } }
    }).lean();
    for (const game of games) {
      entries.push({
        url: `${baseUrl}/results/${game.stateSlug}/${game.slug}`,
        lastModified: game.lastDrawDate ? new Date(game.lastDrawDate) : defaultLastModified,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error('Failed to generate sitemap items from DB:', error);
  }

  return entries;
}
