import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { KHULNA_LOCATIONS } from '../src/data/khulnaLocations';

const prisma = new PrismaClient();

const DEMO_LISTINGS = [
  {
    id: 1,
    name: 'আব্দুল করিম',
    phone: '01711000001',
    loc: 'সোনাডাঙ্গা',
    addr: 'সোনাডাঙ্গা বাস স্ট্যান্ড সংলগ্ন, মসজিদ রোড',
    rent: 2800,
    rooms: 2,
    floor: 2,
    maxOccupants: 5,
    tenantType: 'family',
    rules: JSON.stringify(['গ্যাস ও পানির বিল আলাদা', 'রাত ১০টায় গেট বন্ধ', '১ মাসের অগ্রিম']),
    cardColor: '#7fb5a0',
    ward: 17,
    latitude: 22.8225,
    longitude: 89.5392,
    coordinateAccuracy: 'exact',
    isApproximatePin: false,
    isDemo: true,
  },
  {
    id: 2,
    name: 'শফিকুল ইসলাম',
    phone: '01811000002',
    loc: 'বয়রা',
    addr: 'বয়রা বাজার থেকে ৫ মিনিট',
    rent: 3000,
    rooms: 2,
    floor: 2,
    maxOccupants: 4,
    tenantType: 'family',
    rules: JSON.stringify(['পোষা প্রাণী নিষেধ', 'বিদ্যুৎ বিল মিটার অনুযায়ী']),
    cardColor: '#e0b36a',
    ward: 15,
    latitude: 22.8428,
    longitude: 89.5368,
    coordinateAccuracy: 'exact',
    isApproximatePin: false,
    isDemo: true,
  },
  {
    id: 3,
    name: 'মিসেস রহিমা',
    phone: '01911000003',
    loc: 'সোনাডাঙ্গা',
    addr: 'নিউ মার্কেট গলি, ৩য় বাড়ি',
    rent: 2500,
    rooms: 1,
    floor: 1,
    maxOccupants: 3,
    tenantType: 'any',
    rules: JSON.stringify(['ধূমপান নিষেধ', '২ মাসের অগ্রিম']),
    cardColor: '#8fa8d6',
    ward: 18,
    latitude: 22.826,
    longitude: 89.541,
    coordinateAccuracy: 'approximate',
    isApproximatePin: true,
    isDemo: true,
  },
  {
    id: 4,
    name: 'জাহাঙ্গীর আলম',
    phone: '01611000004',
    loc: 'খালিশপুর',
    addr: 'খালিশপুর ১ নং গেট',
    rent: 3500,
    rooms: 3,
    floor: 3,
    maxOccupants: 7,
    tenantType: 'family',
    rules: JSON.stringify(['লিফট নেই', 'পার্কিং আছে (বাইক)']),
    cardColor: '#c99aa5',
    ward: 8,
    latitude: 22.8595,
    longitude: 89.5385,
    coordinateAccuracy: 'exact',
    isApproximatePin: false,
    isDemo: true,
  },
  {
    id: 5,
    name: 'মো. সাইফুল',
    phone: '01511000005',
    loc: 'বয়রা',
    addr: 'বয়রা মেইন রোড, ব্যাংকের পাশে',
    rent: 2900,
    rooms: 2,
    floor: 2,
    maxOccupants: 5,
    tenantType: 'family',
    rules: JSON.stringify(['গ্যাস লাইন আছে', 'সন্ধ্যার পর অতিথি সীমিত']),
    cardColor: '#a3c48a',
    ward: 15,
    latitude: 22.8435,
    longitude: 89.5375,
    coordinateAccuracy: 'exact',
    isApproximatePin: false,
    isDemo: true,
  },
  {
    id: 6,
    name: 'নুরুল হক',
    phone: '01311000006',
    loc: 'সাতক্ষীরা সদর',
    addr: 'কলেজ রোড',
    rent: 2000,
    rooms: 1,
    floor: 1,
    maxOccupants: 2,
    tenantType: 'bachelor',
    rules: JSON.stringify(['ছাত্রদের জন্য', 'রাত ১১টায় গেট বন্ধ']),
    cardColor: '#b79bd1',
    latitude: 22.7185,
    longitude: 89.0705,
    coordinateAccuracy: 'approximate',
    isApproximatePin: true,
    isDemo: true,
  },
];

async function main() {
  console.log('🌱 Seeding Khulna Location Hierarchy...');

  // 1. Seed Locations
  for (const loc of KHULNA_LOCATIONS) {
    const existing = await prisma.location.findFirst({
      where: { nameEn: loc.nameEn },
    });

    if (existing) {
      await prisma.location.update({
        where: { id: existing.id },
        data: {
          nameBn: loc.nameBn,
          type: loc.type,
          ward: loc.ward,
          latitude: loc.latitude,
          longitude: loc.longitude,
          aliases: JSON.stringify(loc.aliases),
          description: loc.description,
          isVerified: loc.isVerified,
          source: loc.source,
        },
      });
    } else {
      await prisma.location.create({
        data: {
          nameBn: loc.nameBn,
          nameEn: loc.nameEn,
          type: loc.type,
          ward: loc.ward,
          latitude: loc.latitude,
          longitude: loc.longitude,
          aliases: JSON.stringify(loc.aliases),
          description: loc.description,
          isVerified: loc.isVerified,
          source: loc.source,
        },
      });
    }
  }

  const locationCount = await prisma.location.count();
  console.log(`✅ Khulna Locations seeded: ${locationCount} verified records`);

  // 2. Seed Demo Properties
  console.log('🌱 Seeding database with demo listings and coordinates...');
  const demoDeletionHash = crypto
    .createHash('sha256')
    .update('DEMO_PROTECTED_LISTING_DO_NOT_DELETE')
    .digest('hex');

  for (const item of DEMO_LISTINGS) {
    // Attempt to match locationId by name
    const matchedLocation = await prisma.location.findFirst({
      where: {
        OR: [
          { nameBn: item.loc },
          { nameEn: item.loc },
          { aliases: { contains: item.loc } },
        ],
      },
    });

    await prisma.listing.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        phone: item.phone,
        loc: item.loc,
        addr: item.addr,
        rent: item.rent,
        rooms: item.rooms,
        floor: item.floor,
        maxOccupants: item.maxOccupants,
        tenantType: item.tenantType,
        rules: item.rules,
        cardColor: item.cardColor,
        ward: item.ward,
        latitude: item.latitude,
        longitude: item.longitude,
        coordinateAccuracy: item.coordinateAccuracy,
        isApproximatePin: item.isApproximatePin,
        locationId: matchedLocation?.id || null,
        isDemo: item.isDemo,
      },
      create: {
        id: item.id,
        name: item.name,
        phone: item.phone,
        loc: item.loc,
        addr: item.addr,
        rent: item.rent,
        rooms: item.rooms,
        floor: item.floor,
        maxOccupants: item.maxOccupants,
        tenantType: item.tenantType,
        rules: item.rules,
        cardColor: item.cardColor,
        ward: item.ward,
        latitude: item.latitude,
        longitude: item.longitude,
        coordinateAccuracy: item.coordinateAccuracy,
        isApproximatePin: item.isApproximatePin,
        locationId: matchedLocation?.id || null,
        isDemo: item.isDemo,
        deletionHash: demoDeletionHash,
      },
    });
  }

  const listingCount = await prisma.listing.count();
  console.log(`✅ Database seeding completed. Total listings: ${listingCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
