import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface ScrapedGameItem {
    name: string;
    slug: string;
    numbers: string[];
    specialBall?: string;
    drawDate: Date;
    jackpot?: string;
}

export interface StateScrapeResult {
    stateSlug: string;
    totalGamesFound: number;
    updatedCount: number;
    games: ScrapedGameItem[];
    error?: string;
}

/**
 * Normalizes game names/slugs to reliably match MongoDB documents despite minor punctuation,
 * accent, or spelled-number differences ("Cash Five" <-> "Cash 5", "Prime Time" <-> "Primetime",
 * "Pega 2 Día" <-> "pega-2-d-a", "Loto" <-> "loto-cash").
 */
export function normalizeGameKey(input: string): string {
    return (input || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\bone\b/g, '1')
        .replace(/\btwo\b/g, '2')
        .replace(/\bthree\b/g, '3')
        .replace(/\bfour\b/g, '4')
        .replace(/\bfive\b/g, '5')
        .replace(/[^a-z0-9]/g, '');
}

const SLUG_EXPLICIT_ALIASES: Record<string, Record<string, string[]>> = {
    pr: {
        loto: ['loto-cash'],
        pega2diacutea: ['pega-2-d-a'],
        pega3diacutea: ['pega-3-d-a'],
        pega4diacutea: ['pega-4-d-a'],
    },
    fl: {
        fantasy5: ['fantasy-5-evening', 'fantasy-5'],
    },
    dc: {
        dc3midday: ['dc-3-1-50pm'],
        dc3evening: ['dc-3-7-50pm'],
        dc4midday: ['dc-4-1-50pm'],
        dc4evening: ['dc-4-7-50pm'],
        dc5midday: ['dc-5-1-50pm'],
        dc5evening: ['dc-5-7-50pm'],
    },
    co: {
        lotto: ['colorado-lotto-'],
        pick3: ['pick-3-evening'],
    },
    ks: {
        supercash: ['super-kansas-cash'],
        pick3: ['pick-3-midday'],
    },
    nc: {
        pick3day: ['pick-3-daytime'],
        pick4day: ['pick-4-daytime'],
    },
    wi: {
        allornothingmidday: ['all-or-nothing-mid'],
        allornothingevening: ['all-or-nothing-eve'],
    },
    pa: {
        pick2midday: ['pick-2-day'],
        pick3midday: ['pick-3-day'],
        pick4midday: ['pick-4-day'],
        pick5midday: ['pick-5-day'],
    },
    in: {
        lotto: ['hoosier-lotto'],
        lottoplus: ['hoosier-lotto-plus'],
    },
    ky: {
        cashball: ['cash-ball-225'],
    },
    mi: {
        classiclotto47: ['lotto-47'],
    },
    ct: {
        classiclotto: ['lotto'],
    },
    ma: {
        masscash: ['mass-cash-evening'],
    },
    nm: {
        pick3plusday: ['pick-3-day'],
        pick3plusevening: ['pick-3-evening'],
        pick4plusday: ['pick-4-day'],
        pick4plusevening: ['pick-4-evening'],
    },
    me: {
        tristatepick3day: ['pick-3-day'],
        tristatepick3evening: ['pick-3-evening'],
        tristatepick4day: ['pick-4-day'],
        tristatepick4evening: ['pick-4-evening'],
        tristatemegabucksplus: ['megabucks'],
        tristatemegabucks: ['megabucks'],
    },
    nh: {
        tristatepick3day: ['pick-3-day'],
        tristatepick3evening: ['pick-3-evening'],
        tristatepick4day: ['pick-4-day'],
        tristatepick4evening: ['pick-4-evening'],
        tristatemegabucksplus: ['megabucks'],
        tristatemegabucks: ['megabucks'],
    },
    vt: {
        tristatepick3day: ['pick-3-day'],
        tristatepick3evening: ['pick-3-evening'],
        tristatepick4day: ['pick-4-day'],
        tristatepick4evening: ['pick-4-evening'],
        tristatemegabucksplus: ['megabucks'],
        tristatemegabucks: ['megabucks'],
    },
};

/**
 * Supplement New York local draw games directly from NY State Open Data Portal ($0/mo)
 * to guarantee accurate Midday vs Evening separation.
 */
async function fetchNyOfficialLocalDraws(): Promise<ScrapedGameItem[]> {
    const items: ScrapedGameItem[] = [];
    const headers = { 'User-Agent': 'AllUSALottery-Bot/1.0' };

    const safeJson = async (url: string) => {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 5000);
        try {
            const r = await fetch(url, { headers, signal: c.signal, next: { revalidate: 0 } });
            if (!r.ok) return null;
            return await r.json();
        } catch {
            return null;
        } finally {
            clearTimeout(t);
        }
    };

    const [take5Data, nyLottoData, numWin4Data] = await Promise.all([
        safeJson('https://data.ny.gov/resource/dg63-4siq.json?$limit=1&$order=draw_date%20DESC'),
        safeJson('https://data.ny.gov/resource/6nbc-h7bj.json?$limit=1&$order=draw_date%20DESC'),
        safeJson('https://data.ny.gov/resource/hsys-3def.json?$limit=1&$order=draw_date%20DESC'),
    ]);

    if (Array.isArray(take5Data) && take5Data[0]) {
        const dt = parseDrawDateUtc(take5Data[0].draw_date);
        if (dt) {
            if (take5Data[0].midday_winning_numbers) {
                items.push({
                    name: 'Take 5 Midday',
                    slug: 'take-5-midday',
                    numbers: take5Data[0].midday_winning_numbers.trim().split(/\s+/),
                    drawDate: dt,
                });
            }
            if (take5Data[0].evening_winning_numbers) {
                items.push({
                    name: 'Take 5 Evening',
                    slug: 'take-5-evening',
                    numbers: take5Data[0].evening_winning_numbers.trim().split(/\s+/),
                    drawDate: dt,
                });
            }
        }
    }

    if (Array.isArray(nyLottoData) && nyLottoData[0]) {
        const dt = parseDrawDateUtc(nyLottoData[0].draw_date);
        if (dt && nyLottoData[0].winning_numbers) {
            items.push({
                name: 'Lotto',
                slug: 'lotto',
                numbers: nyLottoData[0].winning_numbers.trim().split(/\s+/),
                specialBall: nyLottoData[0].bonus ? String(nyLottoData[0].bonus).trim() : undefined,
                drawDate: dt,
            });
        }
    }

    if (Array.isArray(numWin4Data) && numWin4Data[0]) {
        const dt = parseDrawDateUtc(numWin4Data[0].draw_date);
        if (dt) {
            const rec = numWin4Data[0];
            if (rec.midday_daily) {
                items.push({ name: 'Numbers Midday', slug: 'numbers-midday', numbers: String(rec.midday_daily).trim().split(''), drawDate: dt });
            }
            if (rec.evening_daily) {
                items.push({ name: 'Numbers Evening', slug: 'numbers-evening', numbers: String(rec.evening_daily).trim().split(''), drawDate: dt });
            }
            if (rec.midday_win_4) {
                items.push({ name: 'Win 4 Midday', slug: 'win-4-midday', numbers: String(rec.midday_win_4).trim().split(''), drawDate: dt });
            }
            if (rec.evening_win_4) {
                items.push({ name: 'Win 4 Evening', slug: 'win-4-evening', numbers: String(rec.evening_win_4).trim().split(''), drawDate: dt });
            }
        }
    }

    return items;
}

/**
 * Scrape all games for a single US state from LotteryCorner (100% Free SSR HTML, no Cloudflare block).
 */
export async function scrapeStateFromLotteryUsa(stateSlug: string): Promise<StateScrapeResult> {
    const cleanSlug = stateSlug.toLowerCase().trim();
    const url = `https://www.lotterycorner.com/${cleanSlug}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            signal: controller.signal,
            next: { revalidate: 0 }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                stateSlug: cleanSlug,
                totalGamesFound: 0,
                updatedCount: 0,
                games: [],
                error: `HTTP ${response.status} from ${url}`
            };
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const parsedGames: ScrapedGameItem[] = [];

        $('article.lsp-card .lsp-row-result').each((_, el) => {
            const row = $(el);
            const rawSlug = (row.attr('data-game-card') || '').trim().toLowerCase();
            const rawName = (row.attr('aria-label') || '').trim();
            if (!rawName && !rawSlug) return;

            const timeEl = row.find('.lsp-row-result__when time').first();
            const rawDateStr = timeEl.attr('datetime') || timeEl.text().trim();
            const drawDate = parseDrawDateUtc(rawDateStr);
            if (!drawDate) return;

            const jackpot = row.find('.lsp-row-result__facts .lsp-card__prize').first().text().trim() || undefined;

            // Primary draw numbers block
            const primaryBlock = row.find('.lsp-numbers:not([data-second-drawing="true"])').first();
            const numbers: string[] = [];
            const specialBalls: string[] = [];

            primaryBlock.find('ul.lsp-balls li.lsp-ball').each((_, b) => {
                const bEl = $(b);
                const ballType = (bEl.attr('data-ball') || '').toLowerCase();
                if (ballType === 'multiplier') return;

                const val = bEl.find('span').first().text().trim() || bEl.text().trim();
                if (!/^\d+$/.test(val)) return;

                const isSpecial = bEl.attr('data-special') === 'true' ||
                    ['powerball', 'megaball', 'bonus', 'cashball', 'luckyball'].includes(ballType);

                if (isSpecial) {
                    specialBalls.push(val);
                } else {
                    numbers.push(val);
                }
            });

            if (numbers.length > 0) {
                parsedGames.push({
                    name: rawName || rawSlug,
                    slug: rawSlug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    numbers,
                    specialBall: specialBalls.length > 0 ? specialBalls.join(', ') : undefined,
                    drawDate,
                    jackpot
                });
            }

            // Secondary draw (e.g., Powerball Double Play, Lotto Texas Extra, etc.)
            row.find('.lsp-numbers[data-second-drawing="true"]').each((_, sec) => {
                const label = $(sec).find('.lsp-numbers__label').first().text().trim();
                if (!label) return;

                const secNumbers: string[] = [];
                const secSpecial: string[] = [];
                $(sec).find('ul.lsp-balls li.lsp-ball').each((_, b) => {
                    const bEl = $(b);
                    const ballType = (bEl.attr('data-ball') || '').toLowerCase();
                    if (ballType === 'multiplier') return;
                    const val = bEl.find('span').first().text().trim() || bEl.text().trim();
                    if (!/^\d+$/.test(val)) return;
                    if (bEl.attr('data-special') === 'true' || ['powerball', 'megaball', 'bonus'].includes(ballType)) {
                        secSpecial.push(val);
                    } else {
                        secNumbers.push(val);
                    }
                });

                if (secNumbers.length > 0) {
                    const secSlugSuffix = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    parsedGames.push({
                        name: `${rawName} ${label}`.trim(),
                        slug: `${rawSlug}-${secSlugSuffix}`,
                        numbers: secNumbers,
                        specialBall: secSpecial.length > 0 ? secSpecial.join(', ') : undefined,
                        drawDate
                    });
                }
            });
        });

        // For New York, apply official NY Open Data results cleanly on top
        if (cleanSlug === 'ny') {
            const nyOfficial = await fetchNyOfficialLocalDraws();
            for (const off of nyOfficial) {
                const idx = parsedGames.findIndex(g => g.slug === off.slug);
                if (idx >= 0) {
                    // Only override if official draw is >= aggregated draw
                    if (off.drawDate.getTime() >= parsedGames[idx].drawDate.getTime()) {
                        parsedGames[idx] = { ...parsedGames[idx], ...off, jackpot: parsedGames[idx].jackpot };
                    }
                } else {
                    parsedGames.push(off);
                }
            }
        }

        await connectToDatabase();

        // Preload state games once so matching is O(1) in memory instead of N MongoDB regex queries
        const stateGames = await Game.find({ stateSlug: cleanSlug });
        const byExactSlug = new Map<string, any>();
        const byNormKey = new Map<string, any>();

        for (const g of stateGames) {
            byExactSlug.set(g.slug.toLowerCase(), g);
            byNormKey.set(normalizeGameKey(g.slug), g);
            byNormKey.set(normalizeGameKey(g.name), g);
        }

        let updatedCount = 0;

        for (const pg of parsedGames) {
            const cleanPgSlug = pg.slug.toLowerCase();
            let gameDoc = byExactSlug.get(cleanPgSlug) ||
                byNormKey.get(normalizeGameKey(pg.slug)) ||
                byNormKey.get(normalizeGameKey(pg.name));

            if (!gameDoc) {
                const stateAliases = SLUG_EXPLICIT_ALIASES[cleanSlug];
                const aliasSlugs = stateAliases?.[normalizeGameKey(pg.slug)] || stateAliases?.[cleanPgSlug];
                if (aliasSlugs) {
                    for (const alt of aliasSlugs) {
                        if (byExactSlug.has(alt)) {
                            gameDoc = byExactSlug.get(alt);
                            break;
                        }
                    }
                }
            }

            if (gameDoc) {
                const didUpdate = await upsertGameAndResult(gameDoc, {
                    drawDate: pg.drawDate,
                    numbers: pg.numbers,
                    powerBall: pg.specialBall,
                    jackpot: pg.jackpot
                });
                if (didUpdate) {
                    updatedCount++;
                }
            }
        }

        try {
            revalidatePath(`/results/${cleanSlug}`);
        } catch (_) {}

        return {
            stateSlug: cleanSlug,
            totalGamesFound: parsedGames.length,
            updatedCount,
            games: parsedGames
        };

    } catch (err: any) {
        console.error(`Error scraping state ${cleanSlug}:`, err.message);
        return {
            stateSlug: cleanSlug,
            totalGamesFound: 0,
            updatedCount: 0,
            games: [],
            error: err.message
        };
    }
}
