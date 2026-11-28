import * as cheerio from 'cheerio';
import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import { parseDrawDateUtc, utcDateStr, upsertGameAndResult } from '@/lib/scrapers/syncUtils';

export interface ParsedCanadaAddonItem {
    stateSlug: string;
    targetSlug: string;
    name: string;
    drawDate: Date;
    numbers: string[];
    bonusBall?: string;
    powerBall?: string;
}

export interface CanadaAddonScrapeResult {
    totalScraped: number;
    updatedCount: number;
    updatedGames: string[];
    errors: string[];
}

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

async function fetchHtmlFast(url: string, timeoutMs = 3500): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { headers: HEADERS, signal: controller.signal, next: { revalidate: 0 } });
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

function normalizeIntTokens(tokens: string[]): string[] {
    return tokens
        .map(t => t.replace(/\s+/g, '').trim())
        .filter(t => /^\d+$/.test(t))
        .map(t => String(parseInt(t, 10)));
}

function splitDigitTokens(raw: string): string[] {
    return raw.replace(/\D+/g, '').split('').filter(Boolean);
}

function normalizePokerCards(alts: string[]): string[] {
    return alts
        .map(a => a.trim().toUpperCase().replace(/[SHDC]$/i, ''))
        .filter(Boolean);
}

/**
 * Extracts provincial add-on & side games directly from https://www.lotteryextreme.com/canada/ HTML
 * (Western Pick 2/3/4, Western Extra, Atlantic TAG, Atlantic 49 GPD, Ontario Early Bird, Ontario Encore, BC Extra).
 */
export function extractCanadaSideGamesFromMainHtml($: cheerio.CheerioAPI): ParsedCanadaAddonItem[] {
    const items: ParsedCanadaAddonItem[] = [];

    $('.xgm1').each((_, el) => {
        const titleText = $(el).text().replace(/\s+/g, ' ').trim();
        const xgm2 = $(el).next('.xgm2');
        const drawDate = parseDrawDateUtc(titleText);
        if (!drawDate) return;

        const blockText = xgm2.text().replace(/\s+/g, ' ').trim();

        // 1. Western Pick 2, Pick 3, Pick 4
        if (/western\s*pick\s*2/i.test(titleText)) {
            const pickUls = xgm2.find('table tr:nth-child(2) td ul.displayball').toArray();
            if (pickUls.length >= 3) {
                const p2 = $(pickUls[0]).find('li').map((_, li) => $(li).text().trim()).get().filter(t => /^\d+$/.test(t));
                const p3 = $(pickUls[1]).find('li').map((_, li) => $(li).text().trim()).get().filter(t => /^\d+$/.test(t));
                const p4 = $(pickUls[2]).find('li').map((_, li) => $(li).text().trim()).get().filter(t => /^\d+$/.test(t));
                if (p2.length === 2) items.push({ stateSlug: 'wc', targetSlug: 'pick-2', name: 'Pick 2', drawDate, numbers: p2 });
                if (p3.length === 3) items.push({ stateSlug: 'wc', targetSlug: 'pick-3', name: 'Pick 3', drawDate, numbers: p3 });
                if (p4.length === 4) items.push({ stateSlug: 'wc', targetSlug: 'pick-4', name: 'Pick 4', drawDate, numbers: p4 });
            }
        }

        // 2. Western Extra (appears under Western Pick 2-3-4, Western Max, Western 649)
        const westExtra = blockText.match(/Western Extra:\s*(\d{7})/i);
        if (westExtra) {
            items.push({
                stateSlug: 'wc',
                targetSlug: 'extra',
                name: 'Extra',
                drawDate,
                numbers: westExtra[1].split('')
            });
        }

        // 3. Atlantic 49 Guaranteed Prize Draw & Atlantic TAG
        if (/atlantic\s*49/i.test(titleText)) {
            const gpd = blockText.match(/GUARANTEED PRIZE DRAW:\s*([A-Z0-9-]+)/i);
            if (gpd) {
                items.push({
                    stateSlug: 'ac',
                    targetSlug: 'atlantic-49-guaranteed-prize-draw',
                    name: 'Atlantic 49 Guaranteed Prize Draw',
                    drawDate,
                    numbers: [gpd[1].toUpperCase()]
                });
            }
        }
        if (/atlantic|bucko|keno atlantic|lotto 6\/49|lotto max|daily grand/i.test(titleText)) {
            const tag = blockText.match(/TAG:\s*(\d{6})/i);
            if (tag) {
                items.push({
                    stateSlug: 'ac',
                    targetSlug: 'tag',
                    name: 'Tag',
                    drawDate,
                    numbers: tag[1].split('')
                });
            }
        }

        // 4. Lottario Early Bird
        if (/^lottario\b/i.test(titleText)) {
            const eb = blockText.match(/Early Bird:\s*([\d-]+)/i);
            if (eb) {
                const nums = normalizeIntTokens(eb[1].split('-'));
                if (nums.length >= 4) {
                    items.push({
                        stateSlug: 'on',
                        targetSlug: 'early-bird',
                        name: 'Early Bird',
                        drawDate,
                        numbers: nums.slice(0, 4)
                    });
                }
            }
        }

        // 5. Ontario Encore Evening
        if (/encore|daily keno\s*evening|ontario 49|lottario|lotto 6\/49|lotto max|daily grand/i.test(titleText)) {
            const enc = blockText.match(/Encore:\s*(\d{7})/i);
            if (enc) {
                items.push({
                    stateSlug: 'on',
                    targetSlug: 'encore-evening',
                    name: 'Encore Evening',
                    drawDate,
                    numbers: enc[1].split('')
                });
            }
        }

        // 6. BC Extra
        if (/^bc\s*49\b/i.test(titleText)) {
            const bcEx = blockText.match(/BC Extra:\s*([\d-]+)/i);
            if (bcEx) {
                const nums = normalizeIntTokens(bcEx[1].split('-'));
                if (nums.length === 4) {
                    items.push({
                        stateSlug: 'bc',
                        targetSlug: 'extra',
                        name: 'Extra',
                        drawDate,
                        numbers: nums
                    });
                }
            }
        }
    });

    return items;
}

function parseWclcLightningAndPick($llHtml: string | null, $pickHtml: string | null): ParsedCanadaAddonItem[] {
    const items: ParsedCanadaAddonItem[] = [];

    if ($llHtml) {
        const $ = cheerio.load($llHtml);
        $('.pastWinNum').each((_, el) => {
            const dateTxt = $(el).find('.pastWinNumDate h4, .pastWinNumDate').first().text().replace(/\s+/g, ' ').trim();
            const drawDate = parseDrawDateUtc(dateTxt);
            if (!drawDate) return;

            const extraTxt = $(el).find('.pastWinNumExtra').text().replace(/\D+/g, '');
            if (extraTxt.length === 7) {
                items.push({ stateSlug: 'wc', targetSlug: 'extra', name: 'Extra', drawDate, numbers: extraTxt.split('') });
            }

            const balls: string[] = [];
            $(el).find('ul.pastWinNumbers li, .pastWinNumber').each((__, li) => {
                const cls = $(li).attr('class') || '';
                if (/bonus/i.test(cls)) return;
                const txt = $(li).text().replace(/\s+/g, '').trim();
                if (/^\d{1,2}$/.test(txt)) balls.push(String(parseInt(txt, 10)));
            });
            if (balls.length >= 5) {
                items.push({
                    stateSlug: 'wc',
                    targetSlug: 'lightning-lotto',
                    name: 'Lightning Lotto',
                    drawDate,
                    numbers: balls.slice(0, 5)
                });
            }
        });
    }

    if ($pickHtml) {
        const $ = cheerio.load($pickHtml);
        $('.pastWinNumGroup').each((_, el) => {
            const dateTxt = $(el).find('.pastWinNumDate h4, h4').first().text().replace(/\s+/g, ' ').trim();
            const drawDate = parseDrawDateUtc(dateTxt);
            if (!drawDate) return;

            $(el).find('ul.pastWinNumbers').each((__, ul) => {
                const hasP2 = $(ul).find('[class*="PICK2"]').length > 0;
                const hasP3 = $(ul).find('[class*="PICK3"]').length > 0;
                const hasP4 = $(ul).find('[class*="PICK4"]').length > 0;
                const nums = $(ul).find('li.pastWinNumber').map((___, li) => $(li).text().trim()).get().filter(t => /^\d$/.test(t));
                if (hasP2 && nums.length === 2) items.push({ stateSlug: 'wc', targetSlug: 'pick-2', name: 'Pick 2', drawDate, numbers: nums });
                if (hasP3 && nums.length === 3) items.push({ stateSlug: 'wc', targetSlug: 'pick-3', name: 'Pick 3', drawDate, numbers: nums });
                if (hasP4 && nums.length === 4) items.push({ stateSlug: 'wc', targetSlug: 'pick-4', name: 'Pick 4', drawDate, numbers: nums });
            });
        });
    }

    return items;
}

interface LcTarget {
    url: string;
    stateSlug: string;
    targetSlug: string;
    name: string;
    parser: 'hero_digits' | 'hero_balls' | 'list_digits' | 'list_twodigit' | 'list_7char' | 'list_astro' | 'poker' | 'list_mini';
    digitCount?: number;
}

const LC_TARGETS: LcTarget[] = [
    { url: 'https://www.lotterycanada.com/quebec-la-quotidienne-2', stateSlug: 'qc', targetSlug: 'quotidienne-2', name: 'Quotidienne 2', parser: 'hero_digits', digitCount: 2 },
    { url: 'https://www.lotterycanada.com/quebec-la-quotidienne-3', stateSlug: 'qc', targetSlug: 'quotidienne-3', name: 'Quotidienne 3', parser: 'hero_digits', digitCount: 3 },
    { url: 'https://www.lotterycanada.com/quebec-la-quotidienne-4', stateSlug: 'qc', targetSlug: 'quotidienne-4', name: 'Quotidienne 4', parser: 'hero_digits', digitCount: 4 },
    { url: 'https://www.lotterycanada.com/quebec-extra', stateSlug: 'qc', targetSlug: 'extra', name: 'Extra', parser: 'list_digits', digitCount: 7 },
    { url: 'https://www.lotterycanada.com/quebec-la-mini', stateSlug: 'qc', targetSlug: 'la-mini', name: 'La Mini', parser: 'list_mini', digitCount: 6 },
    { url: 'https://www.lotterycanada.com/quebec-max', stateSlug: 'qc', targetSlug: 'qu-bec-max', name: 'Québec Max', parser: 'hero_balls' },
    { url: 'https://www.lotterycanada.com/quebec-lotto-poker', stateSlug: 'qc', targetSlug: 'lotto-poker', name: 'Lotto Poker', parser: 'poker' },
    { url: 'https://www.lotterycanada.com/quebec-astro', stateSlug: 'qc', targetSlug: 'astro', name: 'Astro', parser: 'list_astro' },
    { url: 'https://www.lotterycanada.com/bc-extra', stateSlug: 'bc', targetSlug: 'extra', name: 'Extra', parser: 'list_twodigit' },
    { url: 'https://www.lotterycanada.com/western-extra', stateSlug: 'wc', targetSlug: 'extra', name: 'Extra', parser: 'list_7char' },
    { url: 'https://www.lotterycanada.com/western-lightning-lotto', stateSlug: 'wc', targetSlug: 'lightning-lotto', name: 'Lightning Lotto', parser: 'hero_balls' },
    { url: 'https://www.lotterycanada.com/western-poker-lotto', stateSlug: 'wc', targetSlug: 'poker-lotto', name: 'Poker Lotto', parser: 'poker' },
];

export function parseLotteryCanadaPage(html: string, target: LcTarget): ParsedCanadaAddonItem[] {
    const $ = cheerio.load(html);
    if (/results updating system is down/i.test(html)) {
        // Still allow hero parsing if hero is current; list rows might be stale
    }
    const items: ParsedCanadaAddonItem[] = [];

    if (target.parser === 'hero_digits' || target.parser === 'hero_balls') {
        const hero = $('.px-hero, .lx-hero').first();
        const dateTxt = hero.find('.px-hero__eyebrow, .lx-hero__eyebrow').first().text().replace(/\s+/g, ' ').trim();
        const drawDate = parseDrawDateUtc(dateTxt);
        if (drawDate) {
            const mainBalls = hero.find('.lx-ball:not(.lx-ball--bonus)').map((_, b) => $(b).text().trim()).get().filter(t => /^\d+$/.test(t));
            const bonusBalls = hero.find('.lx-ball.lx-ball--bonus').map((_, b) => $(b).text().trim()).get().filter(t => /^\d+$/.test(t));
            if (target.parser === 'hero_digits' && mainBalls.length >= (target.digitCount || 2)) {
                items.push({
                    stateSlug: target.stateSlug,
                    targetSlug: target.targetSlug,
                    name: target.name,
                    drawDate,
                    numbers: mainBalls.slice(0, target.digitCount)
                });
            } else if (target.parser === 'hero_balls' && mainBalls.length >= 5) {
                const nums = normalizeIntTokens(mainBalls);
                const bonus = bonusBalls.length === 1 && target.targetSlug === 'qu-bec-max'
                    ? String(parseInt(bonusBalls[0], 10))
                    : '';
                items.push({
                    stateSlug: target.stateSlug,
                    targetSlug: target.targetSlug,
                    name: target.name,
                    drawDate,
                    numbers: nums,
                    bonusBall: bonus
                });
            }
        }
    }

    if (target.parser === 'poker') {
        // Hero
        const heroDate = $('.lx-hero__eyebrow, .px-hero__eyebrow').first().text().replace(/\s+/g, ' ').trim();
        const dHero = parseDrawDateUtc(heroDate);
        const heroCards = normalizePokerCards($('.pk-hero__cards img').map((_, img) => $(img).attr('alt') || '').get());
        if (dHero && heroCards.length === 5) {
            items.push({ stateSlug: target.stateSlug, targetSlug: target.targetSlug, name: target.name, drawDate: dHero, numbers: heroCards });
        }
        // History rows
        $('.pk-history__row').each((_, row) => {
            const dTxt = $(row).find('.pk-history__date--long').text().trim();
            const d = parseDrawDateUtc(dTxt);
            const cards = normalizePokerCards($(row).find('.pk-history__cards img').map((__, img) => $(img).attr('alt') || '').get());
            if (d && cards.length === 5) {
                items.push({ stateSlug: target.stateSlug, targetSlug: target.targetSlug, name: target.name, drawDate: d, numbers: cards });
            }
        });
    }

    if (target.parser === 'list_digits' || target.parser === 'list_twodigit' || target.parser === 'list_7char' || target.parser === 'list_mini' || target.parser === 'list_astro') {
        if (target.parser === 'list_mini') {
            // Also parse "Latest Draw - <Date>" header block if present above .list-group-item
            const latestLink = $('strong:contains("Latest Draw")').first();
            const dLatest = parseDrawDateUtc(latestLink.text());
            if (dLatest) {
                const latestBadges = latestLink.closest('.panel, .card, .well, section, div').parent()
                    .find('.badge.bg-number').slice(0, 6)
                    .map((_, s) => $(s).text().trim()).get()
                    .filter(t => /^\d+$/.test(t))
                    .map(t => String(parseInt(t, 10)));
                if (latestBadges.length === 6) {
                    items.push({ stateSlug: target.stateSlug, targetSlug: target.targetSlug, name: target.name, drawDate: dLatest, numbers: latestBadges });
                }
            }
        }
        $('.list-group-item').each((_, row) => {
            const dateTxt = $(row).find('.col-sm-3').first().text().replace(/\s+/g, ' ').trim();
            const drawDate = parseDrawDateUtc(dateTxt);
            if (!drawDate) return;

            const badges = $(row).find('.col-9 .badge, .col-9 span').map((__, s) => $(s).text().replace(/\s+/g, ' ').trim()).get().filter(Boolean);
            if (target.parser === 'list_digits') {
                const digits = $(row).find('.col-9 .lotcan-label, .col-9 .bg-number:not(.secondary-number)').map((__, s) => $(s).text().trim()).get().filter(t => /^\d$/.test(t));
                const fallback = digits.length >= (target.digitCount || 7) ? digits : badges.filter(t => /^\d$/.test(t));
                if (fallback.length >= (target.digitCount || 7)) {
                    items.push({
                        stateSlug: target.stateSlug,
                        targetSlug: target.targetSlug,
                        name: target.name,
                        drawDate,
                        numbers: fallback.slice(0, target.digitCount)
                    });
                }
            } else if (target.parser === 'list_mini') {
                const digits = $(row).find('.col-9 .badge').map((__, s) => $(s).text().trim()).get().filter(t => /^\d+$/.test(t)).map(t => String(parseInt(t, 10)));
                if (digits.length >= 6) {
                    items.push({ stateSlug: target.stateSlug, targetSlug: target.targetSlug, name: target.name, drawDate, numbers: digits.slice(0, 6) });
                }
            } else if (target.parser === 'list_twodigit') {
                const nums = normalizeIntTokens($(row).find('.col-9 .lotcan-label, .col-9 .badge').map((__, s) => $(s).text().trim()).get());
                if (nums.length >= 4) {
                    items.push({ stateSlug: target.stateSlug, targetSlug: target.targetSlug, name: target.name, drawDate, numbers: nums.slice(0, 4) });
                }
            } else if (target.parser === 'list_7char') {
                const str = $(row).find('.col-9').text().replace(/\D+/g, '');
                if (str.length >= 7) {
                    items.push({ stateSlug: target.stateSlug, targetSlug: target.targetSlug, name: target.name, drawDate, numbers: splitDigitTokens(str.slice(0, 7)) });
                }
            } else if (target.parser === 'list_astro') {
                // Badges/text e.g. ["78", "Février", "14", "Scorpion"]
                const tokens = badges.length >= 3
                    ? badges
                    : $(row).find('.col-9').text().replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
                if (tokens.length >= 3) {
                    items.push({ stateSlug: target.stateSlug, targetSlug: target.targetSlug, name: target.name, drawDate, numbers: tokens });
                }
            }
        });
    }

    return items;
}

export async function scrapeCanadaProvincialAddons(mainHtml?: string): Promise<CanadaAddonScrapeResult> {
    const errors: string[] = [];
    const rawItems: ParsedCanadaAddonItem[] = [];

    // 1. Reuse or fetch LotteryExtreme main page + DailyKeno numbers (for live Encore Midday)
    const [leHtml, dkHtml, wclcLl, wclcPick, ...lcPages] = await Promise.all([
        mainHtml ? Promise.resolve(mainHtml) : fetchHtmlFast('https://www.lotteryextreme.com/canada/', 3500),
        fetchHtmlFast('https://www.lotteryextreme.com/canada/dailykeno-numbers', 3500),
        fetchHtmlFast('https://www.wclc.com/winning-numbers/lightning-lotto-extra.htm', 3500),
        fetchHtmlFast('https://www.wclc.com/winning-numbers/pick-games-extra.htm', 3500),
        ...LC_TARGETS.map(t => fetchHtmlFast(t.url, 3500))
    ]);

    if (leHtml) {
        const $le = cheerio.load(leHtml);
        rawItems.push(...extractCanadaSideGamesFromMainHtml($le));
    } else {
        errors.push('LE main timeout/error');
    }

    if (dkHtml) {
        const $dk = cheerio.load(dkHtml);
        $dk('td.cx').slice(0, 6).each((_, td) => {
            const title = $dk(td).text().replace(/\s+/g, ' ').trim();
            const d = parseDrawDateUtc(title);
            if (!d) return;
            const nextText = $dk(td).closest('tr').next('tr').text().replace(/\s+/g, ' ').trim();
            const enc = nextText.match(/Encore:\s*(\d{7})/i);
            if (enc) {
                const isMid = /\)\s*M\b/i.test(title) || /midday/i.test(title);
                rawItems.push({
                    stateSlug: 'on',
                    targetSlug: isMid ? 'encore-midday' : 'encore-evening',
                    name: isMid ? 'Encore Midday' : 'Encore Evening',
                    drawDate: d,
                    numbers: enc[1].split('')
                });
            }
        });
    }

    rawItems.push(...parseWclcLightningAndPick(wclcLl, wclcPick));

    lcPages.forEach((html, idx) => {
        const target = LC_TARGETS[idx];
        if (!html) {
            errors.push(`LC ${target.targetSlug} timeout/error`);
            return;
        }
        rawItems.push(...parseLotteryCanadaPage(html, target));
    });

    // Deduplicate items by stateSlug|targetSlug|UTCDate (prefer entries with bonusBall or most numbers; latest processed wins)
    const dedupMap = new Map<string, ParsedCanadaAddonItem>();
    for (const item of rawItems) {
        if (!item.numbers || item.numbers.length === 0) continue;
        const key = `${item.stateSlug}|${item.targetSlug}|${utcDateStr(item.drawDate)}`;
        const prev = dedupMap.get(key);
        if (!prev || (!prev.bonusBall && item.bonusBall)) {
            dedupMap.set(key, item);
        }
    }

    // Sort newest->oldest and only keep the 2 most recent draws per (stateSlug, targetSlug)
    // for fast live cron execution (<3.5s inside Hostinger 40s master_cron limit).
    const perGameCount = new Map<string, number>();
    const deduped = [...dedupMap.values()]
        .sort((a, b) => b.drawDate.getTime() - a.drawDate.getTime())
        .filter(item => {
            const k = `${item.stateSlug}|${item.targetSlug}`;
            const c = perGameCount.get(k) || 0;
            if (c >= 2) return false;
            perGameCount.set(k, c + 1);
            return true;
        })
        // Process oldest->newest among top 2 so Game.lastDrawDate lands on the newest draw
        .reverse();

    if (deduped.length === 0) {
        return { totalScraped: 0, updatedCount: 0, updatedGames: [], errors };
    }

    await connectToDatabase();
    const games = await Game.find({ stateSlug: { $in: ['ac', 'bc', 'on', 'qc', 'wc'] } });
    const gameLookup = new Map<string, any>();
    for (const g of games) {
        gameLookup.set(`${g.stateSlug}|${g.slug}`, g);
    }

    let updatedCount = 0;
    const updatedGames: string[] = [];

    // Group by unique game so updates across different games can run concurrently in one batch
    const byGame = new Map<string, ParsedCanadaAddonItem[]>();
    for (const item of deduped) {
        const k = `${item.stateSlug}|${item.targetSlug}`;
        const list = byGame.get(k) || [];
        list.push(item);
        byGame.set(k, list);
    }

    await Promise.all([...byGame.entries()].map(async ([k, items]) => {
        const gameDoc = gameLookup.get(k);
        if (!gameDoc) return;
        const newestItem = items[items.length - 1];
        // Fast-path skip when Game already has the exact newest draw date & identical numbers
        if (
            gameDoc.lastDrawDate &&
            utcDateStr(new Date(gameDoc.lastDrawDate)) === utcDateStr(newestItem.drawDate) &&
            Array.isArray(gameDoc.numbers) &&
            gameDoc.numbers.length === newestItem.numbers.length &&
            gameDoc.numbers.every((v: string, idx: number) => v === newestItem.numbers[idx])
        ) {
            return;
        }
        for (const item of items) {
            const didUpdate = await upsertGameAndResult(gameDoc, {
                drawDate: item.drawDate,
                numbers: item.numbers,
                bonusBall: item.bonusBall ?? '',
                powerBall: item.powerBall ?? ''
            });
            if (didUpdate) {
                updatedCount++;
                updatedGames.push(`${gameDoc.name} (${gameDoc.stateSlug.toUpperCase()})`);
            }
        }
    }));

    return {
        totalScraped: deduped.length,
        updatedCount,
        updatedGames,
        errors
    };
}
