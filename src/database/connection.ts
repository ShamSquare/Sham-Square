import mongoose from 'mongoose';

export interface DatabaseConnectionOptions {
  uri: string;
  dbName?: string;
}

export async function connectDatabase(
  options: DatabaseConnectionOptions
): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  return mongoose.connect(options.uri, {
    dbName: options.dbName ?? 'ashityshop',
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export { mongoose };
