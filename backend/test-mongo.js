import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@'));

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

async function run() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
