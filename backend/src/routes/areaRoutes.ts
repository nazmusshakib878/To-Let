import { Router } from 'express';
import { SUPPORTED_AREAS } from '../utils/bengali';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: SUPPORTED_AREAS,
  });
});

export default router;
