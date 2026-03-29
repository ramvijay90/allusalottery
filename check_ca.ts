import connectToDatabase from './lib/db';
import Game from './models/Game';

async function check() {
    await connectToDatabase();
    const games = await Game.find({ stateSlug: 'ca' }, 'name slug list').lean();
    console.log(`CA games count: ${games.length}`);
    for (const g of games) {
        console.log(`- ${g.name} (${g.slug})`);
    }
    process.exit(0);
}

check();
