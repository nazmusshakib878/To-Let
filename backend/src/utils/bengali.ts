export const SUPPORTED_AREAS = [
  'সোনাডাঙ্গা',
  'বয়রা',
  'খালিশপুর',
  'দৌলতপুর',
  'শিরোমনি',
  'সাতক্ষীরা সদর',
] as const;

export type SupportedArea = (typeof SUPPORTED_AREAS)[number];

export const TENANT_TYPES = ['family', 'bachelor', 'any'] as const;
export type TenantType = (typeof TENANT_TYPES)[number];

export const BANGLADESH_PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

/**
 * Converts English digits to Bengali digits.
 */
export function toBengaliNumber(val: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
}
