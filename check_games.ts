import Game from './models/Game';
import connectToDatabase from './lib/db';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    await connectToDatabase();

    // Check AZ games
    const games = await Game.find({ stateSlug: 'az' });
    console.log(`Found ${games.length} games for AZ:`);
    games.forEach(g => {
        console.log(`- Name: ${g.name}`);
        console.log(`  Slug: ${g.slug}`);
        console.log(`  HistoryURL: ${g.historyUrl}`);
    });

    process.exit(0);
}

check();
