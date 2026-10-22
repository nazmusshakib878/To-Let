import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'ছবির সাইজ অনেক বড়। সর্বোচ্চ ৫ মেগাবাইট (5MB) ছবি আপলোড করা যাবে।',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `ছবি আপলোড ত্রুটি: ${err.message}`,
    });
    return;
  }

  // Handle custom upload format error from fileFilter
  if (err && err.message && err.message.includes('অননুমোদিত ফাইল')) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error('Unhandled Server Error:', err);
  }
  const message =
    err.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে। দয়া করে পরে আবার চেষ্টা করুন।';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
