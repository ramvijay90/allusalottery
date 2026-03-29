import connectToDatabase from './lib/db';
import Game from './models/Game';

async function checkSlugs() {
    await connectToDatabase();
    const games = await Game.find({ 
        name: { $in: [/Powerball/i, /Mega Millions/i, /Lotto Max/i] } 
    }).limit(20).lean();

    console.log('--- FOUND GAMES ---');
    games.forEach(g => {
        console.log(`Name: ${g.name} | Slug: ${g.slug} | State: ${g.stateSlug}`);
    });
    process.exit(0);
}

checkSlugs();
