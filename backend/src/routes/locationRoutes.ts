import { Router } from 'express';
import { locationController } from '../controllers/locationController';

const router = Router();

// GET /api/locations - Get all locations (supports ?type=ward|area|landmark)
router.get('/', locationController.getAllLocations);

// GET /api/locations/search - Smart bilingual search (?q=query)
router.get('/search', locationController.searchLocations);

// GET /api/locations/wards - Get all 31 KCC wards
router.get('/wards', locationController.getWards);

// GET /api/locations/:id - Get location details by ID
router.get('/:id', locationController.getLocationById);

export default router;
