import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import healthRoutes from './routes/healthRoutes';
import areaRoutes from './routes/areaRoutes';
import listingRoutes from './routes/listingRoutes';
import locationRoutes from './routes/locationRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Security and CORS
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded photos
app.use('/uploads', express.static(config.uploadDir));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/listings', listingRoutes);

// Catch-all for undefined routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'অনুরোধকৃত API রুট খুঁজে পাওয়া যায়নি (404 Not Found)',
  });
});

// Centralized error handler
app.use(errorHandler);
