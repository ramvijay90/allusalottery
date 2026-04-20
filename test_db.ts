import connectToDatabase from './lib/db';
import Game from './models/Game';

connectToDatabase().then(async () => {
    const g = await Game.findOne({ slug: 'triple-twist' });
    console.log(JSON.stringify(g, null, 2));
    process.exit();
});
