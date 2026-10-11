import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/environment.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './utils/response.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS Configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 3. Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. HTTP Request Logging (disabled during automated tests)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// 5. General Rate Limiter
app.use('/api', apiLimiter);

// 6. Base API Router Mounts
const apiV1 = express.Router();
apiV1.use('/', healthRoutes);
apiV1.use('/auth', authRoutes);
apiV1.use('/categories', categoryRoutes);
apiV1.use('/listings', listingRoutes);
apiV1.use('/media', mediaRoutes);
apiV1.use('/availability', availabilityRoutes);
apiV1.use('/cart', cartRoutes);
apiV1.use('/quotes', quoteRoutes);

app.use('/api/v1', apiV1);

// 7. 404 Handler for undefined routes
app.use('*', (req, res) => {
  return sendError(
    res,
    `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
    404,
    'ROUTE_NOT_FOUND'
  );
});

// 8. Global Error Handler
app.use(errorHandler);

export default app;
