import Game from '@/models/Game';
import Result from '@/models/Result';

const MONTH_MAP: Record<string, number> = {
    jan: 1, january: 1, enero: 1,
    feb: 2, february: 2, febrero: 2,
    mar: 3, march: 3, marzo: 3,
    apr: 4, april: 4, abril: 4,
    may: 5, mayo: 5,
    jun: 6, june: 6, junio: 6,
    jul: 7, july: 7, julio: 7,
    aug: 8, august: 8, agosto: 8,
    sep: 9, sept: 9, september: 9, septiembre: 9,
    oct: 10, october: 10, octubre: 10,
    nov: 11, november: 11, noviembre: 11,
    dec: 12, december: 12, diciembre: 12,
};

function makeValidUtcDate(year: number, month: number, day: number, hourUtc = 12): Date | null {
    if (year < 2000 || year > 2035 || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    const d = new Date(Date.UTC(year, month - 1, day, hourUtc, 0, 0, 0));
    if (
        isNaN(d.getTime()) ||
        d.getUTCFullYear() !== year ||
        d.getUTCMonth() !== month - 1 ||
        d.getUTCDate() !== day
    ) {
        return null;
    }
    return d;
}

/**
 * Strictly parses a draw date string from HTML/JSON into a UTC Date (default 12:00 UTC).
 * Returns null if no valid calendar date is found (never defaults to current clock time).
 */
export function parseDrawDateUtc(rawText: string, hourUtc = 12): Date | null {
    if (!rawText) return null;
    const text = rawText.replace(/\s+/g, ' ').trim();

    // 1. ISO format: YYYY-MM-DD (highest confidence)
    const iso = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) {
        const dt = makeValidUtcDate(parseInt(iso[1], 10), parseInt(iso[2], 10), parseInt(iso[3], 10), hourUtc);
        if (dt) return dt;
    }

    // 2. European dot format: DD.MM.YYYY (e.g. "25.11.2026" on German lotto_de)
    const dmyDot = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (dmyDot) {
        const dt = makeValidUtcDate(parseInt(dmyDot[3], 10), parseInt(dmyDot[2], 10), parseInt(dmyDot[1], 10), hourUtc);
        if (dt) return dt;
    }

    // 2b. Dashed DD-MM-YYYY format (e.g. "25-11-2026" on Nigeria feeds)
    const dmyDash = text.match(/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/);
    if (dmyDash) {
        const a = parseInt(dmyDash[1], 10);
        const b = parseInt(dmyDash[2], 10);
        const y = parseInt(dmyDash[3], 10);
        // Prefer DD-MM-YYYY when b <= 12
        const dt = b <= 12
            ? makeValidUtcDate(y, b, a, hourUtc)
            : makeValidUtcDate(y, a, b, hourUtc);
        if (dt) return dt;
    }

    // 3. DD Month YYYY (English or Spanish, e.g. "27 November 2026", "26 Nov 2026", "26 noviembre 2026")
    const dmyWord = text.match(/(\d{1,2})\s+(?:de\s+)?([A-Za-zñÑ]+),?\s+(\d{4})/);
    if (dmyWord) {
        const month = MONTH_MAP[dmyWord[2].toLowerCase()];
        if (month) {
            const dt = makeValidUtcDate(parseInt(dmyWord[3], 10), month, parseInt(dmyWord[1], 10), hourUtc);
            if (dt) return dt;
        }
    }

    // 4. Month DD[,] YYYY (e.g. "Nov 25 2026", "November 26, 2026")
    const mdyWord = text.match(/([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/);
    if (mdyWord) {
        const month = MONTH_MAP[mdyWord[1].toLowerCase()];
        if (month) {
            const dt = makeValidUtcDate(parseInt(mdyWord[3], 10), month, parseInt(mdyWord[2], 10), hourUtc);
            if (dt) return dt;
        }
    }

    // 5. Slash format: MM/DD/YYYY or DD/MM/YYYY fallback
    const slash = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slash) {
        const a = parseInt(slash[1], 10);
        const b = parseInt(slash[2], 10);
        const y = parseInt(slash[3], 10);
        // Prefer DD/MM if first part > 12, else MM/DD
        const dt = a > 12
            ? makeValidUtcDate(y, b, a, hourUtc)
            : makeValidUtcDate(y, a, b, hourUtc);
        if (dt) return dt;
    }

    return null;
}

export function utcDateStr(date: Date): string {
    return date.toISOString().split('T')[0];
}

export interface UpsertDrawPayload {
    drawDate: Date;
    numbers: string[];
    powerBall?: string;
    bonusBall?: string;
    jackpot?: string;
    exactTimestamp?: boolean;
}

/**
 * Updates Game (only if incoming draw is >= current lastDrawDate) and upserts Result
 * without duplicating records on the same UTC calendar day.
 */
export async function upsertGameAndResult(gameDoc: any, payload: UpsertDrawPayload): Promise<boolean> {
    const incomingDateStr = utcDateStr(payload.drawDate);
    const existingDateStr = gameDoc.lastDrawDate ? utcDateStr(new Date(gameDoc.lastDrawDate)) : '';

    // Never overwrite a newer drawing with an older one
    if (existingDateStr && incomingDateStr < existingDateStr) {
        return false;
    }

    // For intraday games (exactTimestamp = true, e.g. Ireland Daily Million 14:00 vs 21:00), don't replace 21:00 with 14:00 on Game card
    const existingTime = gameDoc.lastDrawDate ? new Date(gameDoc.lastDrawDate).getTime() : 0;
    const shouldUpdateGame = !existingDateStr ||
        incomingDateStr > existingDateStr ||
        (!payload.exactTimestamp || payload.drawDate.getTime() >= existingTime);

    let changed = false;
    if (shouldUpdateGame) {
        const numsChanged = JSON.stringify(gameDoc.numbers || []) !== JSON.stringify(payload.numbers);
        const pbChanged = payload.powerBall !== undefined && (gameDoc.powerBall || '') !== payload.powerBall;
        const bbChanged = payload.bonusBall !== undefined && (gameDoc.bonusBall || '') !== payload.bonusBall;
        const jpChanged = Boolean(payload.jackpot) && (gameDoc.jackpot || '') !== payload.jackpot;
        const dateChanged = !gameDoc.lastDrawDate || new Date(gameDoc.lastDrawDate).getTime() !== payload.drawDate.getTime();

        if (numsChanged || pbChanged || bbChanged || jpChanged || dateChanged || !existingDateStr) {
            gameDoc.numbers = payload.numbers;
            if (payload.powerBall !== undefined) gameDoc.powerBall = payload.powerBall;
            if (payload.bonusBall !== undefined) gameDoc.bonusBall = payload.bonusBall;
            if (payload.jackpot) gameDoc.jackpot = payload.jackpot;
            gameDoc.lastDrawDate = payload.drawDate;
            await gameDoc.save();
            changed = true;
        }
    }

    if (payload.exactTimestamp) {
        await Result.findOneAndUpdate(
            { gameId: gameDoc._id, date: payload.drawDate },
            {
                $set: {
                    gameId: gameDoc._id,
                    date: payload.drawDate,
                    numbers: payload.numbers,
                    powerBall: payload.powerBall || '',
                    jackpot: payload.jackpot || gameDoc.jackpot || ''
                }
            },
            { upsert: true }
        );
    } else {
        const dayStart = new Date(`${incomingDateStr}T00:00:00.000Z`);
        const dayEnd = new Date(`${incomingDateStr}T23:59:59.999Z`);
        const existingResult = await Result.findOne({
            gameId: gameDoc._id,
            date: { $gte: dayStart, $lte: dayEnd }
        }).sort({ date: -1 });

        if (existingResult) {
            await Result.updateOne(
                { _id: existingResult._id },
                {
                    $set: {
                        date: payload.drawDate,
                        numbers: payload.numbers,
                        powerBall: payload.powerBall ?? existingResult.powerBall ?? '',
                        jackpot: payload.jackpot || existingResult.jackpot || gameDoc.jackpot || ''
                    }
                }
            );
        } else {
            await Result.create({
                gameId: gameDoc._id,
                date: payload.drawDate,
                numbers: payload.numbers,
                powerBall: payload.powerBall || '',
                jackpot: payload.jackpot || gameDoc.jackpot || ''
            });
        }
    }

    return changed;
}
