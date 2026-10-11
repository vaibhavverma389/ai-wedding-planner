import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return sendError(
      res,
      `A record with that ${field} ('${value}') already exists.`,
      409,
      'DUPLICATE_ENTRY'
    );
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      `Invalid resource identifier format for parameter: ${err.path}`,
      400,
      'INVALID_ID'
    );
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    return sendError(res, 'Database validation error', 400, 'VALIDATION_ERROR', details);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Malformed or invalid authentication token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired', 401, 'TOKEN_EXPIRED');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  return sendError(
    res,
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : message,
    statusCode,
    errorCode
  );
};
