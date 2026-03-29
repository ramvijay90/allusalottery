import connectToDatabase from './lib/db';
import Game from './models/Game';

async function cleanAndRun() {
    await connectToDatabase();
    console.log('Deleting all games to start fresh...');
    await Game.deleteMany({});
    console.log('✅ Deleted all games in the database. Ready for a clean scrape.');
    process.exit(0);
}

cleanAndRun();
