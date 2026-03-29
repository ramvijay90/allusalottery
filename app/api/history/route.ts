import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Result from '@/models/Result';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const gameId = searchParams.get('gameId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cutoff = searchParams.get('cutoff');

    if (!gameId) {
        return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    await connectToDatabase();

    const skip = (page - 1) * limit;

    let query: any = { gameId };
    if (cutoff) {
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
