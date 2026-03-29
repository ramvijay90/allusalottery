import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import State from './models/State';
import connectToDatabase from './lib/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import Game from './models/Game';

async function checkState() {
    await connectToDatabase();
    const state = await State.findOne({ slug: 'qc' });
    console.log('State QC:', state);

    if (state) {
        const games = await Game.find({ stateSlug: 'qc' });
        console.log(`Games found for QC: ${games.length}`);
        games.forEach(g => console.log(` - ${g.name}`));
    }

    process.exit(0);
}

checkState();
