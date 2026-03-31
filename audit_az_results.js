const { MongoClient } = require('mongodb');

async function checkAzResults() {
  const uri = "mongodb+srv://vijayaram7568_db_user:cvFIrvCVIHiJmm6V@cluster0.eyqy3lw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    
    // Find Arizona state
    const az = await db.collection('states').findOne({ slug: 'az' });
    if (!az) {
        console.log("Arizona state not found in DB.");
        return;
    }

    // Find Arizona games
    const games = await db.collection('games').find({ stateSlug: 'az' }).toArray();
    console.log(`\nArizona Games found: ${games.length}`);

    for (const game of games) {
        const latestResult = await db.collection('results').find({ gameId: game._id }).sort({ date: -1 }).limit(1).toArray();
        if (latestResult.length > 0) {
            console.log(`- ${game.name}: Latest result date in DB: ${latestResult[0].date} numbers: ${latestResult[0].numbers}`);
        } else {
            console.log(`- ${game.name}: NO RESULTS FOUND IN DB.`);
        }
    }

  } finally {
    await client.close();
  }
}

checkAzResults();
