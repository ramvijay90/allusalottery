import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

async function checkDb() {
  const uri = "mongodb+srv://vijayaram7568_db_user:cvFIrvCVIHiJmm6V@cluster0.eyqy3lw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  console.log("Connecting to DB to check progress...");
  
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const stateCount = await db.collection('states').countDocuments();
  const gameCount = await db.collection('games').countDocuments();
  const resultCount = await db.collection('results').countDocuments();
  
  console.log("\n--- Database Status ---");
  console.log(`States: ${stateCount}`);
  console.log(`Games:  ${gameCount}`);
  console.log(`Results: ${resultCount}`);
  
  if (resultCount > 0) {
    const latest = await db.collection('results').find().sort({ date: -1 }).limit(1).toArray();
    console.log(`Latest Result Added: ${latest[0]?.date} for game ${latest[0]?.gameId}`);
  }
  
  await mongoose.disconnect();
}

checkDb();
