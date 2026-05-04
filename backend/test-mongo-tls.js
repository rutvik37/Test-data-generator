import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@'));

const client = new MongoClient(uri, { 
  serverSelectionTimeoutMS: 5000,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true 
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB with fallback TLS options!");
  } catch (err) {
    console.error("❌ Connection failed with fallback TLS options!");
  } finally {
    await client.close();
  }
}
run();
