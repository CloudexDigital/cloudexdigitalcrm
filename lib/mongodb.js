import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}
if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

let cachedClient = null;
let cachedDb     = null;

export async function getDb() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  cachedDb     = client.db(dbName);
  return cachedDb;
}
