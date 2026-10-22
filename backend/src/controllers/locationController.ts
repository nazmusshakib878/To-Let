import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/locationService';

export class LocationController {
  async getAllLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.query.type as string | undefined;
      const locations = await locationService.getAllLocations(type);
      res.json({
        success: true,
        count: locations.length,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const results = await locationService.searchLocations(query);
      res.json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWards(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wards = await locationService.getWards();
      res.json({
        success: true,
        count: wards.length,
        data: wards,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLocationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ লোকেশন আইডি' });
        return;
      }

      const location = await locationService.getLocationById(id);
      if (!location) {
        res.status(404).json({ success: false, message: 'লোকেশন খুঁজে পাওয়া যায়নি' });
        return;
      }

      res.json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const locationController = new LocationController();
