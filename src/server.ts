// ═══════════════════════════════════════════════════════════════════════════════
// 1. Environment variables  (loaded first — every other module depends on them)
// ═══════════════════════════════════════════════════════════════════════════════
//  env.config.ts calls dotenv.config() as its top-level side-effect.
//  Importing it here guarantees .env is loaded before anything else runs.
import './config/env.config';

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Logger  (uses env vars via lazy getter — safe after dotenv is loaded)
// ═══════════════════════════════════════════════════════════════════════════════
import logger from './utils/logger.util';

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Config & DB
// ═══════════════════════════════════════════════════════════════════════════════
import env from './config/env.config';
import { connectDatabase, disconnectDatabase } from './database/connection';

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Express app  (routes, middleware, swagger — all registered here)
// ═══════════════════════════════════════════════════════════════════════════════
import app from './app';
import { realtimeService } from './services/RealtimeService';

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Global error handlers  (catch anything that slips through)
// ═══════════════════════════════════════════════════════════════════════════════

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', err);
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION', err);
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Bootstrap  (the startup sequence below runs in strict order)
// ═══════════════════════════════════════════════════════════════════════════════

async function startServer(): Promise<void> {
  logger.info('Starting AshityShop server...');

  // ── 6a. Connect to database ──────────────────────────────────────────
  await connectDatabase();
  logger.info('Database connected');

  // ── 6b. Start HTTP server ────────────────────────────────────────────
  const server = app.listen(env.app.port, () => {
    logger.info(`Server listening on port ${env.app.port}`);
  });
  realtimeService.initialize(server);

  // ── 6c. Graceful shutdown ────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force exit after 10 s regardless
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  logger.error('Failed to start server', err);
  // Fallback in case logger hasn't flushed
  console.error('[FATAL] Failed to start server:', err?.message ?? err);
  process.exit(1);
});
