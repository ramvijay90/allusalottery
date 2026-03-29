import connectToDatabase from './lib/db';
import Game from './models/Game';
import State from './models/State';

async function cleanupGames() {
    await connectToDatabase();

    console.log('Cleaning up orphan games...');

    // Get all valid state slugs
    const validStates = await State.find({}).distinct('slug');
    console.log(`Found ${validStates.length} valid states.`);

    // Delete games where stateSlug is NOT in validStates
    const res = await Game.deleteMany({ stateSlug: { $nin: validStates } });

    console.log(`Deleted ${res.deletedCount} orphan games.`);
    process.exit(0);
}

cleanupGames();
