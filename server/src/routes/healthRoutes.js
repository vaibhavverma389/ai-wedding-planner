import express from 'express';
import { getDBStatus } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

router.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }, 'ShaadiSaathi API service is operational');
});

router.get('/health/readiness', (req, res) => {
  const dbStatus = getDBStatus();
  const isReady = dbStatus.readyState === 1;

  const data = {
    status: isReady ? 'ready' : 'unhealthy',
    database: dbStatus,
    memory: {
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    },
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  };

  if (!isReady) {
    return sendError(res, 'Database is not connected', 503, 'SERVICE_UNAVAILABLE', data);
  }

  return sendSuccess(res, data, 'ShaadiSaathi API is fully ready and accepting traffic');
});

export default router;
