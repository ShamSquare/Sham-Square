import mongoose, { MongooseError } from 'mongoose';
import logger from '../utils/logger.util.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Singleton — all consumers share one Mongoose connection.
// Never call mongoose.connect() anywhere else in the codebase.
// ─────────────────────────────────────────────────────────────────────────────

export interface DatabaseConnectionOptions {
  uri: string;
  dbName?: string;
}

class DatabaseConnection {
  private isConnected = false;

  /**
   * Connect to MongoDB.
   * - Only connects once; subsequent calls are no-ops.
   * - Attaches global event handlers for reconnect / disconnect.
   * - Exits the process on initial connection failure.
   */
  async connect(options: DatabaseConnectionOptions): Promise<typeof mongoose> {
    if (this.isConnected) {
      logger.info('Database already connected — reusing existing connection');
      return mongoose;
    }

    mongoose.set('strictQuery', true);

    try {
      logger.info('Connecting to MongoDB...');

      await mongoose.connect(options.uri, {
        dbName: options.dbName ?? 'ashityshop',
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      this.setupHandlers();
      logger.info('MongoDB connected successfully');

      return mongoose;
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error);
      process.exit(1);
    }
  }

  /** Register once-per-connection event listeners */
  private setupHandlers(): void {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('error', (err: MongooseError) => {
      logger.error('MongoDB connection error', err);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
    });
  }

  /** Graceful disconnect (used during shutdown) */
  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected');
    } catch (error) {
      logger.error('Error during MongoDB disconnect', error);
    }
  }

  /** Check whether the database is currently connected */
  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }
}

// Singleton export
const databaseConnection = new DatabaseConnection();

export const connectDatabase = databaseConnection.connect.bind(databaseConnection);
export const disconnectDatabase = databaseConnection.disconnect.bind(databaseConnection);
export { mongoose };
export default databaseConnection;
