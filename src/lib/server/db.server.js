import { MongoClient } from "mongodb";

const client = new MongoClient(import.meta.env.VITE_MONGO_DB_URI);

export const connection = client.connect();
export const db = client.db(import.meta.env.VITE_MONGO_DB_NAME);
