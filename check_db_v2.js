const { MongoClient } = require('mongodb');

async function checkDb() {
  const uri = "mongodb+srv://vijayaram7568_db_user:cvFIrvCVIHiJmm6V@cluster0.eyqy3lw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test'); // Default DB
    
    const states = await db.collection('states').countDocuments();
    const games = await db.collection('games').countDocuments();
    const results = await db.collection('results').countDocuments();

    console.log(`\n✅ PRODUCTION DB CHECK:`);
    console.log(`- States Found: ${states}`);
    console.log(`- Games Found:  ${games}`);
    console.log(`- Results Found: ${results}`);

    if (results > 0) {
        console.log(`🚀 Automated scraper is successfully writing data to your website!`);
    } else {
        console.log(`⚠️ Database is still empty. Your scraper hasn't finished its first run yet.`);
    }

  } finally {
    await client.close();
  }
}

checkDb();
