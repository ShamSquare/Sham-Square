import supabaseConfig from '../config/supabase.config';
import logger from '../utils/logger.util';

class DatabaseConnection {
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected — reusing existing connection');
      return;
    }

    try {
      logger.info('Connecting to Supabase...');
      const healthy = await supabaseConfig.healthCheck();
      if (!healthy) {
        throw new Error('Supabase health check failed');
      }
      this.isConnected = true;
      logger.info('Supabase connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Supabase', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    logger.info('Supabase disconnected');
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }
}

const databaseConnection = new DatabaseConnection();

export const connectDatabase = databaseConnection.connect.bind(databaseConnection);
export const disconnectDatabase = databaseConnection.disconnect.bind(databaseConnection);
export default databaseConnection;
