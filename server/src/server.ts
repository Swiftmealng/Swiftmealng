import dotenv from 'dotenv';

// Load env vars FIRST before any other imports
dotenv.config();

// Suppress Mongoose duplicate index warning early (development only)
if (process.env.NODE_ENV === 'development') {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = function (warning: any, ...args: any[]) {
    if (typeof warning === 'string' && warning.includes('Duplicate schema index')) {
      return; // Suppress duplicate index warnings
    }
    return originalEmitWarning.call(process, warning, ...args);
  };
}

import { createServer } from 'http';
import app from './app';
import connectDB from './config/database/connection';
import Logger from './utils/logger';
import { initializeSocket } from './config/socket/socket';
import { startDelayMonitoringBackup } from './utils/delayDetection';

// Handle uncaught exceptions (must be at the top)
process.on('uncaughtException', (err: Error) => {
  Logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Initialize external services after env is loaded
import('./config/cloudinary/cloudinary');
import('./services/sms.service');

// Connect to database
connectDB()
  .then(() => {
    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    initializeSocket(httpServer);

    // Start backup delay monitoring (primary detection is event-based)
    startDelayMonitoringBackup();

    // Start server only after database connection
    httpServer.listen(PORT, () => {
      Logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      Logger.info('Socket.io enabled on /tracking and /dashboard namespaces');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      Logger.error('Unhandled Promise Rejection:', { error: err.message, stack: err.stack });
      httpServer.close(() => process.exit(1));
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      Logger.info('SIGTERM received. Closing server gracefully...');
      httpServer.close(() => {
        Logger.info('Server closed');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    Logger.error('Failed to start server:', { error: err.message, stack: err.stack });
    process.exit(1);
  });
