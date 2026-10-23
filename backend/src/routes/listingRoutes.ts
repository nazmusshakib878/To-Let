import { Router } from 'express';
import { listingController } from '../controllers/listingController';
import { upload } from '../middleware/uploadMiddleware';
import { postListingLimiter, reportLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/listings - Search & filter listings
router.get('/', listingController.getListings);

// GET /api/listings/:id - Retrieve single listing
router.get('/:id', listingController.getListingById);

// POST /api/listings - Create listing with optional photo upload (rate limited)
router.post('/', postListingLimiter, upload.single('photo'), listingController.createListing);

// PATCH /api/listings/:id/rented - Toggle or set rented status (requires deletion/manage token)
router.patch('/:id/rented', listingController.toggleRented);

// POST /api/listings/:id/renew - Renew listing expiry for 30 more days (requires token)
router.post('/:id/renew', listingController.renewListing);

// POST /api/listings/:id/report - Report fake or fraudulent listing (rate limited)
router.post('/:id/report', reportLimiter, listingController.reportListing);

// PUT /api/listings/:id - Update listing (requires deletion/manage token)
router.put('/:id', upload.single('photo'), listingController.updateListing);

// DELETE /api/listings/:id - Delete listing with deletion token
router.delete('/:id', listingController.deleteListing);

export default router;
