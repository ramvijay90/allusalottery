import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { exec } from 'child_process';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, slug } = body;

        let cmd = '';

        if (action === 'hub') {
            cmd = 'npm run scrape:hub';
        } else if (action === 'state' && slug) {
            cmd = `npm run scrape:state ${slug}`;
        } else if (action === 'history' && slug) {
            // Just an example, might need game slug
            return NextResponse.json({ error: 'History scraping requires game slug' }, { status: 400 });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Execute in background (fire and forget for this simple API, or return success immediately)
        // For a real admin panel, we'd want to stream logs. 
        // For now, we just acknowledge receipt.
        exec(cmd, { cwd: process.cwd() });

        return NextResponse.json({ message: `Scraper triggered: ${cmd}`, status: 'Running' });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
