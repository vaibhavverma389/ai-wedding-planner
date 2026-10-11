import app from './app.js';
import { env } from './config/environment.js';
import { connectDB, disconnectDB } from './config/database.js';
import { logger } from './utils/logger.js';

let server;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Start HTTP Server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 ShaadiSaathi Backend Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
      logger.info(`📡 API endpoint: http://localhost:${env.PORT}/api/v1`);
      logger.info(`🩺 Health check: http://localhost:${env.PORT}/api/v1/health`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

// Launch if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { server, startServer };
