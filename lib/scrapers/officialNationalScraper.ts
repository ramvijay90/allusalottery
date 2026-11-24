import connectToDatabase from '@/lib/db';
import Game from '@/models/Game';
import Result from '@/models/Result';
import { revalidatePath } from 'next/cache';

export interface SyncResult {
    game: string;
    drawDate: string;
    numbers: string[];
    specialBall?: string;
    updated: boolean;
    syncedStatesCount: number;
}

/**
 * 1. Powerball Official Open Data Sync
 * Source: NY State Official Open Data Portal (Public Government API, Free, No Auth)
 */
export async function syncOfficialPowerball(): Promise<SyncResult | null> {
    try {
        const url = 'https://data.ny.gov/resource/d6yy-54nr.json?$limit=3&$order=draw_date%20DESC';
        const res = await fetch(url, { next: { revalidate: 0 }, headers: { 'User-Agent': 'AllUSALottery-Bot/1.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching Powerball`);

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data[0];
        // Format: "07 09 27 40 58 19" (first 5 white balls, last is Powerball)
        const parts = latest.winning_numbers.trim().split(/\s+/);
        if (parts.length < 6) return null;

        const numbers = parts.slice(0, 5);
        const powerBall = parts[5];
        const rawDate = latest.draw_date.split('T')[0];
        const drawDate = new Date(`${rawDate}T12:00:00Z`);

        await connectToDatabase();

        // Check if master already has this draw
        const masterPowerball = await Game.findOne({ slug: 'powerball', stateSlug: 'az' });
        const existingLastDate = masterPowerball?.lastDrawDate ? new Date(masterPowerball.lastDrawDate).toISOString().split('T')[0] : null;

        const isNew = !existingLastDate || rawDate > existingLastDate;

        if (isNew) {
            // 1. Update all Powerball games across all 45+ states
            const updateResult = await Game.updateMany(
                { slug: 'powerball' },
                {
                    $set: {
                        numbers,
                        powerBall,
                        lastDrawDate: drawDate
                    }
                }
            );

            // 2. Insert into Result collection for all matching state games
            const allPowerballGames = await Game.find({ slug: 'powerball' }).select('_id stateSlug');
            const resultBulk = allPowerballGames.map(g => ({
                updateOne: {
                    filter: { gameId: g._id, date: drawDate },
                    update: {
                        $set: {
                            gameId: g._id,
                            date: drawDate,
                            numbers,
                            powerBall
                        }
                    },
                    upsert: true
                }
            }));

            if (resultBulk.length > 0) {
                await Result.bulkWrite(resultBulk);
            }

            // 3. Revalidate paths
            try {
                revalidatePath('/');
                revalidatePath('/live-results');
                revalidatePath('/results/az/powerball');
            } catch (_) {}

            return {
                game: 'Powerball',
                drawDate: rawDate,
                numbers,
                specialBall: powerBall,
                updated: true,
                syncedStatesCount: updateResult.modifiedCount || allPowerballGames.length
            };
        }

        return {
            game: 'Powerball',
            drawDate: rawDate,
            numbers,
            specialBall: powerBall,
            updated: false,
            syncedStatesCount: 0
        };
    } catch (err: any) {
        console.error('Error in syncOfficialPowerball:', err.message);
        return null;
    }
}

/**
 * 2. Mega Millions Official Open Data Sync
 * Source: NY State Official Open Data Portal (Public Government API, Free, No Auth)
 */
export async function syncOfficialMegaMillions(): Promise<SyncResult | null> {
    try {
        const url = 'https://data.ny.gov/resource/5xaw-6ayf.json?$limit=3&$order=draw_date%20DESC';
        const res = await fetch(url, { next: { revalidate: 0 }, headers: { 'User-Agent': 'AllUSALottery-Bot/1.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching Mega Millions`);

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data[0];
        // Format: "32 35 48 58 61", mega_ball: "21"
        const numbers = latest.winning_numbers.trim().split(/\s+/);
        const megaBall = latest.mega_ball ? latest.mega_ball.trim() : '';
        const rawDate = latest.draw_date.split('T')[0];
        const drawDate = new Date(`${rawDate}T12:00:00Z`);

        await connectToDatabase();

        const masterMega = await Game.findOne({ slug: 'mega-millions', stateSlug: 'az' });
        const existingLastDate = masterMega?.lastDrawDate ? new Date(masterMega.lastDrawDate).toISOString().split('T')[0] : null;

        const isNew = !existingLastDate || rawDate > existingLastDate;

        if (isNew) {
            const updateResult = await Game.updateMany(
                { slug: 'mega-millions' },
                {
                    $set: {
                        numbers,
                        powerBall: megaBall,
                        lastDrawDate: drawDate
                    }
                }
            );

            const allMegaGames = await Game.find({ slug: 'mega-millions' }).select('_id stateSlug');
            const resultBulk = allMegaGames.map(g => ({
                updateOne: {
                    filter: { gameId: g._id, date: drawDate },
                    update: {
                        $set: {
                            gameId: g._id,
                            date: drawDate,
                            numbers,
                            powerBall: megaBall
                        }
                    },
                    upsert: true
                }
            }));

            if (resultBulk.length > 0) {
                await Result.bulkWrite(resultBulk);
            }

            try {
                revalidatePath('/');
                revalidatePath('/live-results');
                revalidatePath('/results/az/mega-millions');
            } catch (_) {}

            return {
                game: 'Mega Millions',
                drawDate: rawDate,
                numbers,
                specialBall: megaBall,
                updated: true,
                syncedStatesCount: updateResult.modifiedCount || allMegaGames.length
            };
        }

        return {
            game: 'Mega Millions',
            drawDate: rawDate,
            numbers,
            specialBall: megaBall,
            updated: false,
            syncedStatesCount: 0
        };
    } catch (err: any) {
        console.error('Error in syncOfficialMegaMillions:', err.message);
        return null;
    }
}

/**
 * 3. Cash4Life Official Open Data Sync
 * Multi-state game played daily in FL, NY, NJ, PA, VA, GA, MD, IN, TN, MO
 */
export async function syncOfficialCash4Life(): Promise<SyncResult | null> {
    try {
        const url = 'https://data.ny.gov/resource/h4i2-acfi.json?$limit=3&$order=draw_date%20DESC';
        const res = await fetch(url, { next: { revalidate: 0 }, headers: { 'User-Agent': 'AllUSALottery-Bot/1.0' } });
        if (!res.ok) return null;

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const latest = data[0];
        const parts = latest.winning_numbers.trim().split(/\s+/);
        if (parts.length < 5) return null;

        const numbers = parts.slice(0, 5);
        const cashBall = latest.cash_ball ? latest.cash_ball.trim() : (parts[5] || '');
        const rawDate = latest.draw_date.split('T')[0];
        const drawDate = new Date(`${rawDate}T12:00:00Z`);

        await connectToDatabase();

        const masterC4L = await Game.findOne({ slug: { $regex: /cash-?4-?life/i } });
        if (!masterC4L) return null;

        const existingLastDate = masterC4L?.lastDrawDate ? new Date(masterC4L.lastDrawDate).toISOString().split('T')[0] : null;
        const isNew = !existingLastDate || rawDate > existingLastDate;

        if (isNew) {
            const updateResult = await Game.updateMany(
                { slug: { $regex: /cash-?4-?life/i } },
                {
                    $set: {
                        numbers,
                        powerBall: cashBall,
                        lastDrawDate: drawDate
                    }
                }
            );

            const allC4LGames = await Game.find({ slug: { $regex: /cash-?4-?life/i } }).select('_id stateSlug');
            const resultBulk = allC4LGames.map(g => ({
                updateOne: {
                    filter: { gameId: g._id, date: drawDate },
                    update: {
                        $set: {
                            gameId: g._id,
                            date: drawDate,
                            numbers,
                            powerBall: cashBall
                        }
                    },
                    upsert: true
                }
            }));

            if (resultBulk.length > 0) {
                await Result.bulkWrite(resultBulk);
            }

            return {
                game: 'Cash4Life',
                drawDate: rawDate,
                numbers,
                specialBall: cashBall,
                updated: true,
                syncedStatesCount: updateResult.modifiedCount || allC4LGames.length
            };
        }

        return {
            game: 'Cash4Life',
            drawDate: rawDate,
            numbers,
            specialBall: cashBall,
            updated: false,
            syncedStatesCount: 0
        };
    } catch (err: any) {
        console.error('Error in syncOfficialCash4Life:', err.message);
        return null;
    }
}
