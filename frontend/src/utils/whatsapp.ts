import { Listing } from '../types/listing';
import { formatRent } from './bengali';

/**
 * Normalizes a Bangladeshi phone number to international WhatsApp format (8801XXXXXXXX).
 */
export function normalizeBdPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  // Remove spaces, hyphens, and parentheses
  let digits = phone.replace(/[^\d+]/g, '');

  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }

  // If starts with 01X (11 digits), prepend 88
  if (digits.startsWith('01') && digits.length === 11) {
    return '88' + digits;
  }

  // If already starts with 8801 (13 digits)
  if (digits.startsWith('8801') && digits.length === 13) {
    return digits;
  }

  return digits;
}

/**
 * Generates a direct WhatsApp click-to-chat URL with a polite Bengali message.
 */
export function getWhatsAppListingUrl(listing: Listing): string {
  const normalizedPhone = normalizeBdPhoneForWhatsApp(listing.phone);
  if (!normalizedPhone) return '';

  const message = `আসসালামু আলাইকুম, আমি "বাসা খুঁজি" (To-Let) ওয়েবসাইটে আপনার বাসা ভাড়ার বিজ্ঞাপনটি দেখেছি।
📍 এলাকা: ${listing.loc}${listing.ward ? ` (ওয়ার্ড ${listing.ward})` : ''}
💰 ভাড়া: ${formatRent(listing.rent)}/মাস
🚪 রুম: ${listing.rooms}টি, তলা: ${listing.floor}

বাসাটি কি এখনো ভাড়ার জন্য খালি আছে? বিস্তারিত জানতে চাচ্ছিলাম।`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
