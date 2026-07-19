import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

// Spin up an in-memory MongoDB and set the secrets the app reads at runtime.
export const connect = async () => {
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
  process.env.JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
  process.env.JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

export const disconnect = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

export const clear = async () => {
  for (const c of Object.values(mongoose.connection.collections)) {
    await c.deleteMany({});
  }
};
