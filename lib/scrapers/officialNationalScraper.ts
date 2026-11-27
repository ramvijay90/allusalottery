import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { revalidatePath } from 'next/cache';
import { parseDrawDateUtc, utcDateStr } from '@/lib/scrapers/syncUtils';

export interface SyncResult {
    game: string;
    drawDate: string;
    numbers: string[];
    specialBall?: string;
    updated: boolean;
    syncedStatesCount: number;
}

async function syncMultiStateDraw(opts: {
    gameName: string;
    slugRegex: string | RegExp;
    rawDateStr: string;
    numbers: string[];
    specialBall: string;
    revalidatePaths: string[];
}): Promise<SyncResult | null> {
    const drawDate = parseDrawDateUtc(opts.rawDateStr);
    if (!drawDate || opts.numbers.length === 0) return null;

    const cleanDate = utcDateStr(drawDate);
    await connectToDatabase();

    const masterGame = await Game.findOne({ slug: opts.slugRegex }).sort({ lastDrawDate: -1 });
    const existingLastDate = masterGame?.lastDrawDate ? utcDateStr(new Date(masterGame.lastDrawDate)) : null;

    // Check if any matching state still has older lastDrawDate (keeps all participating states aligned)
    const staleCount = await Game.countDocuments({
        slug: opts.slugRegex,
        $or: [
            { lastDrawDate: { $lt: new Date(`${cleanDate}T00:00:00.000Z`) } },
            { lastDrawDate: { $exists: false } }
        ]
    });

    const isNew = !existingLastDate || cleanDate > existingLastDate || staleCount > 0;

    if (isNew) {
        const updateResult = await Game.updateMany(
            { slug: opts.slugRegex },
            {
                $set: {
                    numbers: opts.numbers,
                    powerBall: opts.specialBall,
                    lastDrawDate: drawDate
                }
            }
        );

        const allGames = await Game.find({ slug: opts.slugRegex }).select('_id');
        const dayStart = new Date(`${cleanDate}T00:00:00.000Z`);
        const dayEnd = new Date(`${cleanDate}T23:59:59.999Z`);

        // Remove any midnight/misaligned same-day duplicates first or upsert cleanly at noon UTC
        const gameIds = allGames.map(g => g._id);
        await Result.deleteMany({
            gameId: { $in: gameIds },
            date: { $gte: dayStart, $lte: dayEnd, $ne: drawDate }
        });

        const resultBulk = allGames.map(g => ({
            updateOne: {
                filter: { gameId: g._id, date: drawDate },
                update: {
                    $set: {
                        gameId: g._id,
                        date: drawDate,
                        numbers: opts.numbers,
                        powerBall: opts.specialBall
                    }
                },
                upsert: true
            }
        }));

        if (resultBulk.length > 0) {
            await Result.bulkWrite(resultBulk);
        }

        for (const p of opts.revalidatePaths) {
            try {
                revalidatePath(p);
            } catch (_) {}
        }

        return {
            game: opts.gameName,
            drawDate: cleanDate,
            numbers: opts.numbers,
            specialBall: opts.specialBall,
            updated: true,
            syncedStatesCount: updateResult.modifiedCount || allGames.length
        };
    }

    return {
        game: opts.gameName,
        drawDate: cleanDate,
        numbers: opts.numbers,
        specialBall: opts.specialBall,
        updated: false,
        syncedStatesCount: 0
    };
}

/**
 * 1. Powerball Official Open Data Sync (NY State Open Data Portal, $0/mo)
 */
export async function syncOfficialPowerball(): Promise<SyncResult | null> {
    try {
        const url = 'https://data.ny.gov/resource/d6yy-54nr.json?$limit=3&$order=draw_date%20DESC';
        const res = await fetch(url, { next: { revalidate: 0 }, headers: { 'User-Agent': 'AllUSALottery-Bot/1.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching Powerball`);

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data[0];
        const parts = (latest.winning_numbers || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length < 6) return null;

        // Also sync Powerball Double Play if present in the NY Open Data payload
        if (latest.double_play_winning_numbers) {
            const dpParts = String(latest.double_play_winning_numbers).trim().split(/\s+/).filter(Boolean);
            if (dpParts.length >= 6) {
                await syncMultiStateDraw({
                    gameName: 'Powerball Double Play',
                    slugRegex: 'powerball-double-play',
                    rawDateStr: latest.draw_date,
                    numbers: dpParts.slice(0, 5),
                    specialBall: dpParts[5],
                    revalidatePaths: ['/results/ny/powerball-double-play', '/results/az/powerball-double-play', '/results/fl/powerball-double-play']
                });
            }
        }

        return await syncMultiStateDraw({
            gameName: 'Powerball',
            slugRegex: 'powerball',
            rawDateStr: latest.draw_date,
            numbers: parts.slice(0, 5),
            specialBall: parts[5],
            revalidatePaths: ['/', '/live-results', '/results/az/powerball', '/results/ny/powerball', '/results/ca/powerball', '/results/tx/powerball']
        });
    } catch (err: any) {
        console.error('Error in syncOfficialPowerball:', err.message);
        return null;
    }
}

/**
 * 2. Mega Millions Official Open Data Sync (NY State Open Data Portal, $0/mo)
 */
export async function syncOfficialMegaMillions(): Promise<SyncResult | null> {
    try {
        const url = 'https://data.ny.gov/resource/5xaw-6ayf.json?$limit=3&$order=draw_date%20DESC';
        const res = await fetch(url, { next: { revalidate: 0 }, headers: { 'User-Agent': 'AllUSALottery-Bot/1.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching Mega Millions`);

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data[0];
        const numbers = (latest.winning_numbers || '').trim().split(/\s+/).filter(Boolean);
        const megaBall = latest.mega_ball ? latest.mega_ball.trim() : '';
        if (numbers.length < 5) return null;

        return await syncMultiStateDraw({
            gameName: 'Mega Millions',
            slugRegex: 'mega-millions',
            rawDateStr: latest.draw_date,
            numbers,
            specialBall: megaBall,
            revalidatePaths: ['/', '/live-results', '/results/az/mega-millions', '/results/ny/mega-millions', '/results/ca/mega-millions']
        });
    } catch (err: any) {
        console.error('Error in syncOfficialMegaMillions:', err.message);
        return null;
    }
}

/**
 * 3. Millionaire for Life (succeeded retired Cash4Life in 2026) Official Open Data Sync
 * Dataset ID a4w9-a3tp (NY State Open Data Portal, $0/mo)
 */
export async function syncOfficialMillionaireForLife(): Promise<SyncResult | null> {
    try {
        const url = 'https://data.ny.gov/resource/a4w9-a3tp.json?$limit=3&$order=draw_date%20DESC';
        const res = await fetch(url, { next: { revalidate: 0 }, headers: { 'User-Agent': 'AllUSALottery-Bot/1.0' } });
        if (!res.ok) return null;

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data[0];
        const numbers = (latest.winning_numbers || '').trim().split(/\s+/).filter(Boolean);
        const millBall = latest.mill_ball ? String(latest.mill_ball).trim() : '';
        if (numbers.length < 5) return null;

        return await syncMultiStateDraw({
            gameName: 'Millionaire for Life',
            slugRegex: /^millionaire-for-life$|^cash-?4-?life$/i,
            rawDateStr: latest.draw_date,
            numbers,
            specialBall: millBall,
            revalidatePaths: ['/', '/live-results', '/results/ny/millionaire-for-life', '/results/ga/millionaire-for-life']
        });
    } catch (err: any) {
        console.error('Error in syncOfficialMillionaireForLife:', err.message);
        return null;
    }
}

// Backward-compatible alias used by route imports
export const syncOfficialCash4Life = syncOfficialMillionaireForLife;
