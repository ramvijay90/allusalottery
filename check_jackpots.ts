import connectToDatabase from './lib/db';
import Game from './models/Game';

async function checkJackpots() {
    await connectToDatabase();
    
    const powerball = await Game.findOne({ name: /Powerball/i }).sort({ lastDrawDate: -1 }).lean();
    const mega = await Game.findOne({ name: /Mega Millions/i }).sort({ lastDrawDate: -1 }).lean();
    const lottomax = await Game.findOne({ name: /Lotto Max/i }).sort({ lastDrawDate: -1 }).lean();

    console.log('Powerball:', powerball?.name, powerball?.jackpot, powerball?.lastDrawDate);
    console.log('Mega:', mega?.name, mega?.jackpot, mega?.lastDrawDate);
    console.log('Lotto Max:', lottomax?.name, lottomax?.jackpot, lottomax?.lastDrawDate);
    
    process.exit(0);
}

checkJackpots();
