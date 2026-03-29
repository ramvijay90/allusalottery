import State from './models/State';
import connectToDatabase from './lib/db';
import * as dotenv from 'dotenv';
import path from 'path';
import Game from './models/Game';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    await connectToDatabase();
    const stateCount = await State.countDocuments();
    const gameCount = await Game.countDocuments();
    const Result = (await import('./models/Result')).default;
    const resultCount = await Result.countDocuments();

    console.log(`- States:  ${stateCount}`);
    console.log(`- Games:   ${gameCount}`);
    console.log(`- Results: ${resultCount}`);

    // List all slugs to see what we have
    const all = await State.find({}).sort({ name: 1 }).select('slug name');
    // console.log(all.map(s => `${s.name} (${s.slug})`).join(', '));

    process.exit(0);
}

check();
