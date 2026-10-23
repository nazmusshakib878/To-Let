import { Request, Response, NextFunction } from 'express';
import { listingService } from '../services/listingService';
import {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
  toggleRentedSchema,
  reportListingSchema,
} from '../validators/listingValidator';

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
      const result = await listingService.createListing(validatedData, req.file);

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

  async toggleRented(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      const token =
        (req.headers['x-deletion-token'] as string) ||
        req.body?.deletionToken ||
        (req.query?.token as string);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'ম্যানেজমেন্ট টোকেন প্রয়োজন। অননুমোদিত অনুরোধ।',
        });
        return;
      }

      const validatedBody = await toggleRentedSchema.parseAsync(req.body || {});
      const updated = await listingService.toggleRentedStatus(id, token, validatedBody.isRented);

      res.json({
        success: true,
        message: updated.isRented
          ? 'বিজ্ঞাপনটিকে "ভাড়া সম্পন্ন" হিসেবে চিহ্নিত করা হয়েছে'
          : 'বিজ্ঞাপনটিকে পুনরায় "উপলভ্য" করা হয়েছে',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async renewListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      const token =
        (req.headers['x-deletion-token'] as string) ||
        req.body?.deletionToken ||
        (req.query?.token as string);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'ম্যানেজমেন্ট টোকেন প্রয়োজন। অননুমোদিত অনুরোধ।',
        });
        return;
      }

      const renewed = await listingService.renewListing(id, token);

      res.json({
        success: true,
        message: 'বিজ্ঞাপনের মেয়াদ সফলভাবে আরো ৩০ দিন বৃদ্ধি করা হয়েছে',
        data: renewed,
      });
    } catch (error) {
      next(error);
    }
  }

  async reportListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      const validated = await reportListingSchema.parseAsync(req.body);
      const report = await listingService.reportListing(id, validated);

      res.status(201).json({
        success: true,
        message: 'আপনার রিপোর্ট সফলভাবে জমা হয়েছে। আমাদের মডারেশন টিম এটি পর্যালোচনা করবে। ধন্যবাদ।',
        data: { reportId: report.id },
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

  async updateListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      const token =
        (req.headers['x-deletion-token'] as string) ||
        req.body?.deletionToken ||
        (req.query?.token as string);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'ম্যানেজমেন্ট টোকেন প্রয়োজন। অননুমোদিত অনুরোধ।',
        });
        return;
      }

      const validatedData = await updateListingSchema.parseAsync(req.body);
      const updated = await listingService.updateListing(id, token, validatedData, req.file);

      res.json({
        success: true,
        message: 'বিজ্ঞাপন সফলভাবে হালনাগাদ করা হয়েছে',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const listingController = new ListingController();
