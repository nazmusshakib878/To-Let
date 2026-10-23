import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// Protect all admin endpoints with server-side admin authentication
router.use(requireAdmin);

// GET /api/admin/stats - Platform metrics derived from real database records
router.get('/stats', adminController.getStats);

// GET /api/admin/reports - Review all submitted reports
router.get('/reports', adminController.getReports);

// PATCH /api/admin/reports/:id - Update report moderation status
router.patch('/reports/:id', adminController.updateReport);

// PATCH /api/admin/listings/:id/status - Hide/restore or update listing status
router.patch('/listings/:id/status', adminController.updateListingStatus);

// DELETE /api/admin/listings/:id - Admin remove listing
router.delete('/listings/:id', adminController.deleteListing);

export default router;
