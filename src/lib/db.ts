import "@/lib/dns";
import mongoose from "mongoose";
import { resolveMongoUri } from "@/lib/mongo-uri";

const MONGODB_URI = process.env.MONGODB_URI!;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  resolvedUri: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
  resolvedUri: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = cached.resolvedUri ?? (await resolveMongoUri(MONGODB_URI));
      cached.resolvedUri = uri;
      return mongoose.connect(uri, { bufferCommands: false });
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
