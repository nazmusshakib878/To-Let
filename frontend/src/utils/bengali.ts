/**
 * Converts English numerical digits to Bengali digits.
 */
export function bn(n: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

/**
 * Formats a currency amount in Bengali: ৳ ২,৮০০
 */
export function formatRent(amount: number): string {
  return `৳${bn(amount.toLocaleString('en-US'))}`;
}

/**
 * Bangladesh phone number validator: matches 013-019 11 digits, optional +88
 */
export function isValidBangladeshPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?88)?01[3-9]\d{8}$/.test(cleaned);
}
