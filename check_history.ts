import Result from './models/Result';
import connectToDatabase from './lib/db';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    await connectToDatabase();
    const count = await Result.countDocuments();
    console.log(`Total History Results: ${count}`);

    if (count > 0) {
        const sample = await Result.findOne().populate('gameId');
        console.log('Sample Result:', JSON.stringify(sample, null, 2));
    } else {
        console.log("No history data found. Did you run 'npm run scrape:history'?");
    }

    process.exit(0);
}

check();
