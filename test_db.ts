import connectToDatabase from './lib/db';
import Game from './models/Game';

connectToDatabase().then(async () => {
    const states = ['az', 'ar', 'ca', 'ny', 'tx'];
    for (const st of states) {
        const g = await Game.findOne({ stateSlug: st });
        if (g) {
            console.log(`[${st}] ${g.name} - Last Draw: ${g.lastDrawDate} - UpdatedAt: ${g.updatedAt}`);
        } else {
            console.log(`[${st}] No games found`);
        }
    }
    process.exit();
});
