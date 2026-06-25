/**
 * Database Configuration
 * MongoDB and Mongoose connection setup
 */

import mongoose, { Connection, MongooseError } from 'mongoose';
import envConfig from './env.config.ts';
import logger from '../utils/logger.util.ts';

class DatabaseConfig {
  private connection: Connection | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize database connection
   */
  async initialize(): Promise<Connection> {
    if (this.isConnected && this.connection) {
      logger.info('Database already connected');
      return this.connection;
    }

    try {
      logger.info('Connecting to MongoDB...');
      
      await mongoose.connect(envConfig.database.mongodbUri, {
        maxPoolSize: 10,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.connection = mongoose.connection;
      this.isConnected = true;

      this.setupConnectionHandlers();
      logger.info('MongoDB connected successfully');
      return this.connection;
    } catch (error) {
      logger.error('MongoDB connection error', error);
      throw error;
    }
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    this.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    this.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
    });

    this.connection.on('error', (error: MongooseError) => {
      logger.error('MongoDB connection error', error);
    });

    this.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
    });
  }

  /**
   * Get current connection
   */
  getConnection(): Connection {
    if (!this.connection) {
      throw new Error('Database not connected. Call initialize() first.');
    }
    return this.connection;
  }

  /**
   * Check if database is connected
   */
  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        logger.info('MongoDB disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', error);
      throw error;
    }
  }
}

export default new DatabaseConfig();
