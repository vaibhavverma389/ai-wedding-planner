/**
 * Structured application logger
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
};

export const logger = {
  info: (msg, meta) => console.log(formatMessage('info', msg, meta)),
  warn: (msg, meta) => console.warn(formatMessage('warn', msg, meta)),
  error: (msg, meta) => console.error(formatMessage('error', msg, meta)),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', msg, meta));
    }
  }
};
