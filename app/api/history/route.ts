import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Result from '@/models/Result';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const gameId = searchParams.get('gameId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '365');
    const cutoff = searchParams.get('cutoff');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!gameId) {
        return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    await connectToDatabase();

    const skip = (page - 1) * limit;

    let query: any = { gameId };
    
    if (year && year !== 'all') {
        const y = parseInt(year);
        if (month && month !== 'all') {
            const m = parseInt(month); // 1-12
            const startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
            const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
            query.date = { $gte: startDate, $lte: endDate };
        } else {
            const startDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
            const endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
            query.date = { $gte: startDate, $lte: endDate };
        }
    } else if (cutoff) {
        query.date = { $gte: new Date(cutoff) };
    }

    try {
        const results = await Result.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
