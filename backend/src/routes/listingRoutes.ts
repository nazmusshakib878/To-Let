import { Router } from 'express';
import { listingController } from '../controllers/listingController';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// GET /api/listings - Search & filter listings
router.get('/', listingController.getListings);

// GET /api/listings/:id - Retrieve single listing
router.get('/:id', listingController.getListingById);

// POST /api/listings - Create listing with optional photo upload
router.post('/', upload.single('photo'), listingController.createListing);

// DELETE /api/listings/:id - Delete listing with deletion token
router.delete('/:id', listingController.deleteListing);

export default router;
