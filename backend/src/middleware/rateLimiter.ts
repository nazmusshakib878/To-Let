import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * Standard API rate limiter to protect against brute-force and DoS
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'অতিরিক্ত অনুরোধ করা হয়েছে। দয়া করে ১৫ মিনিট পরে আবার চেষ্টা করুন।',
  },
});

/**
 * Stricter limiter for creating new listings to prevent spam
 */
export const postListingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: config.rateLimit.postListingMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'আপনি খুব দ্রুত বিজ্ঞাপন পোস্ট করছেন। দয়া করে ১৫ মিনিট পর পুনরায় চেষ্টা করুন।',
  },
});

/**
 * Rate limiter for reporting listings to prevent spam reports
 */
export const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.reportMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'অল্প সময়ে একাধিক রিপোর্ট করা হয়েছে। দয়া করে কিছুক্ষণ অপেক্ষা করুন।',
  },
});
