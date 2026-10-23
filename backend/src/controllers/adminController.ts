import { Request, Response, NextFunction } from 'express';
import { listingService } from '../services/listingService';
import {
  adminUpdateListingStatusSchema,
  adminUpdateReportStatusSchema,
} from '../validators/listingValidator';

export class AdminController {
  /**
   * GET /api/admin/stats
   * Returns verified statistics computed directly from database tables.
   */
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await listingService.getAdminStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/reports
   * Returns list of reported listings with reason, details, status.
   */
  async getReports(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reports = await listingService.getAdminReports();
      res.json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/reports/:id
   * Update report status: 'pending' | 'reviewed' | 'dismissed'
   */
  async updateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ রিপোর্ট আইডি' });
        return;
      }

      const validated = await adminUpdateReportStatusSchema.parseAsync(req.body);
      const updated = await listingService.updateReportStatus(id, validated.status);

      res.json({
        success: true,
        message: 'রিপোর্ট স্ট্যাটাস আপডেট করা হয়েছে',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/listings/:id/status
   * Hide/restore (isActive) or set rented (isRented) for a listing.
   */
  async updateListingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      const validated = await adminUpdateListingStatusSchema.parseAsync(req.body);
      const updated = await listingService.adminUpdateListingStatus(id, validated);

      res.json({
        success: true,
        message: 'বিজ্ঞাপনের স্ট্যাটাস সফলভাবে পরিবর্তিত হয়েছে',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/listings/:id
   * Permanently delete a listing by admin authority.
   */
  async deleteListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'অবৈধ বিজ্ঞাপন আইডি' });
        return;
      }

      await listingService.adminDeleteListing(id);

      res.json({
        success: true,
        message: 'বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলা হয়েছে',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
