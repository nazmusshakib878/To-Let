import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'To-Let API (বাসা খুঁজি)',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'To-Let API (বাসা খুঁজি)',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
