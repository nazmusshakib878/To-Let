import { z } from 'zod';
import { BANGLADESH_PHONE_REGEX, TENANT_TYPES } from '../utils/bengali';

export const listingQuerySchema = z.object({
  loc: z.string().optional(),
  ward: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(1).max(31).optional()),
  locationId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().positive().optional()),
  bounds: z.string().optional(), // "minLat,minLng,maxLat,maxLng"
  maxRent: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().positive().optional()),
  rent: z // Support backward compatibility with original 'rent' query param
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().positive().optional()),
  minRooms: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(0).optional()),
  rooms: z // Support alias
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(0).optional()),
  floor: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(0).optional()),
  minCapacity: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().positive().optional()),
  mem: z // Support original alias 'mem'
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().positive().optional()),
  type: z.enum(['', ...TENANT_TYPES]).optional(),
  sort: z.enum(['rent', 'new']).default('rent').optional(),
  includeRented: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  includeExpired: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export const toggleRentedSchema = z.object({
  isRented: z.boolean().optional(),
});

export const reportListingSchema = z.object({
  reason: z.enum(['fake', 'incorrect_info', 'rented_already', 'fraud', 'other'], {
    errorMap: () => ({ message: 'সঠিক রিপোর্টের কারণ নির্বাচন করুন' }),
  }),
  details: z.string().trim().max(500, 'বিস্তারিত সর্বোচ্চ ৫০০ অক্ষরের মধ্যে হতে হবে').optional(),
  reporterPhone: z.string().trim().optional(),
});

export const createListingSchema = z.object({
  name: z
    .string({ required_error: 'নাম প্রদান করা আবশ্যক' })
    .trim()
    .min(1, 'নাম প্রদান করা আবশ্যক')
    .max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের মধ্যে হতে হবে'),
  phone: z
    .string({ required_error: 'ফোন নম্বর আবশ্যক' })
    .trim()
    .transform((val) => val.replace(/[\s-]/g, ''))
    .refine((val) => BANGLADESH_PHONE_REGEX.test(val), {
      message: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678 বা +8801712345678)',
    }),
  loc: z
    .string({ required_error: 'এলাকা নির্বাচন করুন' })
    .trim()
    .min(1, 'এলাকা নির্বাচন করুন'),
  addr: z
    .string({ required_error: 'ঠিকানা বা ল্যান্ডমার্ক দিন' })
    .trim()
    .min(1, 'ঠিকানা বা ল্যান্ডমার্ক দিন')
    .max(250, 'ঠিকানা সর্বোচ্চ ২৫০ অক্ষরের মধ্যে হতে হবে'),
  rent: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val >= 500, {
      message: 'মাসিক ভাড়া কমপক্ষে ৫০০ ৳ হতে হবে',
    }),
  rooms: z
    .union([z.number(), z.string()])
    .optional()
    .default(1)
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'রুম সংখ্যা কমপক্ষে ১ হতে হবে',
    }),
  floor: z
    .union([z.number(), z.string()])
    .optional()
    .default(1)
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'তলা ০ বা তার বেশি হতে হবে',
    }),
  maxOccupants: z
    .union([z.number(), z.string()])
    .optional()
    .default(1)
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'সর্বোচ্চ সদস্য কমপক্ষে ১ হতে হবে',
    }),
  max: z // alias for maxOccupants
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
  tenantType: z.enum(TENANT_TYPES).default('family'),
  rules: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .default([])
    .transform((val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean);
        } catch {
          // Newline-separated string from textarea
          return val.split('\n').map((s) => s.trim()).filter(Boolean);
        }
      }
      return [];
    }),
  cardColor: z.string().optional(),

  // Geographic fields
  locationId: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? parseInt(String(val), 10) : undefined)),
  ward: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? parseInt(String(val), 10) : undefined)),
  latitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined && val !== '' ? parseFloat(String(val)) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= -90 && val <= 90), {
      message: 'অবৈধ অক্ষাংশ (Latitude -90 থেকে 90 এর মধ্যে হতে হবে)',
    }),
  longitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined && val !== '' ? parseFloat(String(val)) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= -180 && val <= 180), {
      message: 'অবৈধ দ্রাঘিমাংশ (Longitude -180 থেকে 180 এর মধ্যে হতে হবে)',
    }),
  coordinateAccuracy: z.enum(['exact', 'approximate']).optional().default('approximate'),
  isApproximatePin: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? val === 'true' : Boolean(val)))
    .default(false),
});

export const updateListingSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s-]/g, ''))
    .refine((val) => BANGLADESH_PHONE_REGEX.test(val), {
      message: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন',
    })
    .optional(),
  loc: z.string().trim().min(1).optional(),
  addr: z.string().trim().min(1).max(250).optional(),
  rent: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 500), {
      message: 'মাসিক ভাড়া কমপক্ষে ৫০০ ৳ হতে হবে',
    }),
  rooms: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 1), {
      message: 'রুম সংখ্যা কমপক্ষে ১ হতে হবে',
    }),
  floor: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'তলা ০ বা তার বেশি হতে হবে',
    }),
  maxOccupants: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 1), {
      message: 'সর্বোচ্চ সদস্য কমপক্ষে ১ হতে হবে',
    }),
  tenantType: z.enum(TENANT_TYPES).optional(),
  rules: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean);
        } catch {
          return val.split('\n').map((s) => s.trim()).filter(Boolean);
        }
      }
      return undefined;
    }),
  ward: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? parseInt(String(val), 10) : undefined)),
  latitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined && val !== '' ? parseFloat(String(val)) : undefined)),
  longitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined && val !== '' ? parseFloat(String(val)) : undefined)),
  isApproximatePin: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? val === 'true' : Boolean(val))),
});

export const adminUpdateListingStatusSchema = z.object({
  isActive: z.boolean().optional(),
  isRented: z.boolean().optional(),
});

export const adminUpdateReportStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'dismissed'], {
    errorMap: () => ({ message: 'স্ট্যাটাস pending, reviewed অথবা dismissed হতে হবে' }),
  }),
});

export type ListingQueryParams = z.infer<typeof listingQuerySchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

