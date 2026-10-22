import { Request, Response, NextFunction } from 'express';
import { listingService } from '../services/listingService';
import { createListingSchema, listingQuerySchema } from '../validators/listingValidator';

export class ListingController {
  async getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = await listingQuerySchema.parseAsync(req.query);
      const listings = await listingService.getListings(validatedQuery);
      res.json({
        success: true,
        count: listings.length,
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      const listing = await listingService.getListingById(id);
      if (!listing) {
        res.status(404).json({ success: false, message: 'বিজ্ঞাপনটি পাওয়া যায়নি' });
        return;
      }

      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  async createListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate incoming data
      const validatedData = await createListingSchema.parseAsync(req.body);
      const imageFilename = req.file ? req.file.filename : undefined;

      const result = await listingService.createListing(validatedData, imageFilename);

      res.status(201).json({
        success: true,
        message: 'বিজ্ঞাপনটি সফলভাবে তৈরি হয়েছে',
        data: result.listing,
        deletionToken: result.deletionToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      // Read token from header or body
      const token =
        (req.headers['x-deletion-token'] as string) ||
        req.body?.deletionToken ||
        (req.query?.token as string);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'ডিলিট টোকেন প্রয়োজন। অননুমোদিত অনুরোধ।',
        });
        return;
      }

      await listingService.deleteListing(id, token);

      res.json({
        success: true,
        message: 'পোস্ট মুছে ফেলা হয়েছে',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const listingController = new ListingController();
