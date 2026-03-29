// import fetch from 'node-fetch'; // Not needed in Node 18+
import connectToDatabase from './lib/db';
import Game from './models/Game';

async function testApi() {
    await connectToDatabase();

    // Get AZ Pick 3 Game ID
    const game = await Game.findOne({ stateSlug: 'az', slug: 'pick3' });
    if (!game) {
        console.error('Game not found');
        process.exit(1);
    }

    const gameId = game._id.toString();
    console.log(`Testing API for Game ID: ${gameId}`);

    const url = `http://localhost:3000/api/history?gameId=${gameId}&page=2&limit=5`;
    console.log(`Fetching ${url}...`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`API Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Body:', text);
        } else {
            const json = await res.json();
            console.log('Success! Items found:', json.length);
            console.log('First item:', json[0]);
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
    process.exit(0);
}

testApi();
