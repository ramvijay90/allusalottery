import connectToDatabase from './lib/db';
import Game from './models/Game';

async function cleanAndRun() {
    await connectToDatabase();
    await Game.deleteMany({ stateSlug: 'ar' });
    console.log('✅ Deleted old Arkansas games.');
    process.exit(0);
}

cleanAndRun();
