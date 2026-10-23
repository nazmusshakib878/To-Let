import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bn, formatRent, isValidBangladeshPhone } from '../src/utils/bengali';
import { normalizeBdPhoneForWhatsApp, getWhatsAppListingUrl } from '../src/utils/whatsapp';
import { Listing } from '../src/types/listing';

describe('Frontend Bengali & WhatsApp Utilities', () => {
  it('should correctly convert English numbers to Bengali numerals', () => {
    assert.equal(bn(1234567890), '১২৩৪৫৬৭৮৯০');
    assert.equal(bn('Room 3, Floor 4'), 'Room ৩, Floor ৪');
  });

  it('should format monthly rent in BDT with Bengali numerals', () => {
    assert.equal(formatRent(5000), '৳৫,০০০');
    assert.equal(formatRent(12500), '৳১২,৫০০');
  });

  it('should validate Bangladeshi mobile phone numbers accurately', () => {
    assert.equal(isValidBangladeshPhone('01712345678'), true);
    assert.equal(isValidBangladeshPhone('+8801912345678'), true);
    assert.equal(isValidBangladeshPhone('8801812345678'), true);
    assert.equal(isValidBangladeshPhone('01212345678'), false); // invalid operator 012
    assert.equal(isValidBangladeshPhone('017123456'), false); // too short
    assert.equal(isValidBangladeshPhone('abcd12345678'), false);
  });

  it('should normalize Bangladeshi phone numbers for WhatsApp', () => {
    assert.equal(normalizeBdPhoneForWhatsApp('01712345678'), '8801712345678');
    assert.equal(normalizeBdPhoneForWhatsApp('+8801812345678'), '8801812345678');
  });

  it('should generate proper WhatsApp click-to-chat URL with listing details', () => {
    const mockListing: Listing = {
      id: 101,
      name: 'হাসান সাহেব',
      phone: '01711223344',
      loc: 'সোনাডাঙ্গা',
      addr: 'মজিদ সরণি, রোড ২',
      rent: 8500,
      rooms: 2,
      floor: 3,
      maxOccupants: 4,
      tenantType: 'family',
      rules: 'ধূমপান নিষেধ',
      photo: null,
      isRented: false,
      ward: 17,
      district: 'খুলনা',
      city: 'খুলনা',
      road: 'মজিদ সরণি',
      houseNumber: '১২',
      landmark: 'মজিদ স্কয়ার',
      isExactPin: true,
      hasWhatsapp: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const url = getWhatsAppListingUrl(mockListing);
    assert.ok(url.startsWith('https://wa.me/8801711223344?text='));
    assert.ok(url.includes(encodeURIComponent('সোনাডাঙ্গা')));
    assert.ok(url.includes(encodeURIComponent('৳৮,৫০০')));
  });
});
