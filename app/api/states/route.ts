import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import State from '@/models/State';

export async function GET() {
    await connectToDatabase();
    const states = await State.find({}).sort({ name: 1 });
    return NextResponse.json(states);
}
