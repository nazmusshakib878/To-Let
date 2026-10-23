import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env';
import healthRoutes from './routes/healthRoutes';
import areaRoutes from './routes/areaRoutes';
import listingRoutes from './routes/listingRoutes';
import locationRoutes from './routes/locationRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

export const app = express();

// Trust reverse proxy (important for Render, Railway, Nginx)
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tile.openstreetmap.org',
          'https://res.cloudinary.com',
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'https://*.tile.openstreetmap.org'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Response compression (gzip/deflate)
app.use(compression());

// CORS configuration supporting single or comma-separated origins
const allowedOrigins = config.corsOrigin === '*'
  ? true
  : [
      ...config.corsOrigin.split(',').map((o) => o.trim()),
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Apply general rate limiter to all API endpoints
app.use('/api', generalLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded photos with CORS headers
app.use('/uploads', express.static(config.uploadDir));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all for undefined routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'অনুরোধকৃত API রুট খুঁজে পাওয়া যায়নি (404 Not Found)',
  });
});

// Centralized error handler
app.use(errorHandler);
