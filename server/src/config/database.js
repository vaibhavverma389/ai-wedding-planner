import mongoose from 'mongoose';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDB = async (customUri = null) => {
  const uri = customUri || env.MONGODB_URI;

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    logger.info(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully.');
  }
};

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};
