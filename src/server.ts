import app from './app.ts';
import { connectDatabase } from './database/connection.ts';
import env from './config/env.config.ts';
import logger from './utils/logger.util.ts';

// Handle uncaught errors (very important)
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION 💥', err);
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION 💥', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    // 1. Connect to DB first
    await connectDatabase({
          uri: env.database.mongodbUri,
  dbName: 'ashityshop',
    });

    logger.info('📦 Database connected successfully');

    // 2. Start server
    const server = app.listen(env.app.port, () => {
      logger.info(`🚀 Server running on port ${env.app.port}`);
    });

    // 3. Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

startServer();