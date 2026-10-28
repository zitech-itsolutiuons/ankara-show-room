import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

export const hasMongoUri = Boolean(uri);

/** Returns a connection, or null when MONGODB_URI is not set. Throws if the connection fails. */
export async function connectDB() {
  if (!uri) return null;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 4000 });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
