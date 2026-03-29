import connectToDatabase from './lib/db';
import State from './models/State';

async function cleanup() {
    await connectToDatabase();

    console.log('Cleaning up Europe entries...');
    const res = await State.deleteMany({ country: 'Europe' });
    console.log(`Deleted ${res.deletedCount} Europe entries.`);

    // Also verify if we have any left
    const count = await State.countDocuments({ country: 'Europe' });
    console.log(`Remaining Europe entries: ${count}`);

    process.exit(0);
}

cleanup();
