const { MongoClient } = require('mongodb');

async function checkStates() {
  const uri = "mongodb+srv://vijayaram7568_db_user:cvFIrvCVIHiJmm6V@cluster0.eyqy3lw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    
    const states = await db.collection('states').find({}).toArray();
    console.log(`\nFound ${states.length} total states in DB.`);
    
    const az = states.find(s => s.slug === 'az' || s.name.includes('Arizona'));
    if (az) {
        console.log(`✅ Arizona Found: Name: ${az.name}, Slug: ${az.slug}`);
    } else {
        console.log(`❌ Arizona NOT FOUND in states collection.`);
    }

    const first5 = states.slice(0, 5);
    console.log(`\nFirst 5 states slugs: ${first5.map(s => s.slug).join(', ')}`);

  } finally {
    await client.close();
  }
}

checkStates();
