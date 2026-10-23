import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/env';

/**
 * Timing-safe string equality check.
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Server-side Admin Authentication Middleware.
 * Protects administrative routes using secure, environment-configured ADMIN_API_KEY.
 * Prevents timing attacks and rejects when admin key is unconfigured.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const configuredKey = config.adminApiKey?.trim();

  if (!configuredKey) {
    res.status(503).json({
      success: false,
      message: 'সার্ভার অ্যাডমিন সুবিধা এখনও কনফিগার করা হয়নি (ADMIN_API_KEY অনুপস্থিত)',
    });
    return;
  }

  // Extract from x-admin-key header or Authorization Bearer header
  const headerKey = (req.headers['x-admin-key'] as string) || '';
  const authHeader = req.headers['authorization'] || '';
  let bearerKey = '';
  if (authHeader.startsWith('Bearer ')) {
    bearerKey = authHeader.substring(7).trim();
  }

  const providedKey = (headerKey || bearerKey).trim();

  if (!providedKey) {
    res.status(401).json({
      success: false,
      message: 'অননুমোদিত: অ্যাডমিন অ্যাক্সেসের জন্য x-admin-key অথবা Authorization Bearer হেডার প্রয়োজন',
    });
    return;
  }

  if (!safeCompare(providedKey, configuredKey)) {
    res.status(401).json({
      success: false,
      message: 'অননুমোদিত অ্যাডমিন অ্যাক্সেস: প্রদত্ত অ্যাডমিন কি (API Key) সঠিক নয়',
    });
    return;
  }

  next();
};
