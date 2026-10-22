import { prisma } from '../config/db';
import { generateDeletionToken, hashDeletionToken, verifyDeletionToken } from '../utils/crypto';
import { generatePlaceholderSvg } from '../utils/placeholder';
import { CreateListingInput, ListingQueryParams } from '../validators/listingValidator';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export interface PublicListing {
  id: number;
  name: string;
  phone: string;
  loc: string;
  addr: string;
  rent: number;
  rooms: number;
  floor: number;
  max: number; // maxOccupants
  type: string; // tenantType
  rules: string[];
  photo: string;
  imageUrl: string | null;
  cardColor: string | null;
  ward?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  coordinateAccuracy?: string | null;
  isApproximatePin: boolean;
  locationId?: number | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CARD_COLORS = ['#7fb5a0', '#e0b36a', '#8fa8d6', '#c99aa5', '#a3c48a', '#b79bd1'];

function getRandomColor(): string {
  return DEFAULT_CARD_COLORS[Math.floor(Math.random() * DEFAULT_CARD_COLORS.length)];
}

function formatPublicListing(item: any): PublicListing {
  let rulesArray: string[] = [];
  try {
    const parsed = JSON.parse(item.rules);
    if (Array.isArray(parsed)) {
      rulesArray = parsed;
    }
  } catch {
    rulesArray = item.rules ? [item.rules] : [];
  }

  const effectiveColor = item.cardColor || '#7fb5a0';
  const effectivePhoto = item.imageUrl ? item.imageUrl : generatePlaceholderSvg(effectiveColor);

  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    loc: item.loc,
    addr: item.addr,
    rent: item.rent,
    rooms: item.rooms,
    floor: item.floor,
    max: item.maxOccupants,
    type: item.tenantType,
    rules: rulesArray,
    photo: effectivePhoto,
    imageUrl: item.imageUrl,
    cardColor: item.cardColor,
    ward: item.ward,
    latitude: item.latitude,
    longitude: item.longitude,
    coordinateAccuracy: item.coordinateAccuracy,
    isApproximatePin: item.isApproximatePin || false,
    locationId: item.locationId,
    isDemo: item.isDemo,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export class ListingService {
  /**
   * Search and filter listings based on query parameters.
   */
  async getListings(query: ListingQueryParams): Promise<PublicListing[]> {
    const whereClause: any = {};

    // Location name filter: exact match if specified
    if (query.loc && query.loc.trim() !== '') {
      whereClause.loc = query.loc.trim();
    }

    // Ward filter: match ward number
    if (query.ward !== undefined) {
      whereClause.ward = query.ward;
    }

    // Location ID filter: match specific location entity
    if (query.locationId !== undefined) {
      whereClause.locationId = query.locationId;
    }

    // Geographic viewport bounds filter: "minLat,minLng,maxLat,maxLng"
    if (query.bounds) {
      const parts = query.bounds.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length === 4 && !parts.some(isNaN)) {
        const [minLat, minLng, maxLat, maxLng] = parts;
        whereClause.latitude = { gte: minLat, lte: maxLat };
        whereClause.longitude = { gte: minLng, lte: maxLng };
      }
    }

    // Maximum rent filter: rent <= maxRent
    const maxRent = query.maxRent ?? query.rent;
    if (maxRent !== undefined && maxRent > 0) {
      whereClause.rent = { lte: maxRent };
    }

    // Minimum rooms required: rooms >= minRooms
    const minRooms = query.minRooms ?? query.rooms;
    if (minRooms !== undefined && minRooms > 0) {
      whereClause.rooms = { gte: minRooms };
    }

    // Floor filter: exact match if specified
    if (query.floor !== undefined) {
      whereClause.floor = query.floor;
    }

    // Minimum capacity (accommodates members): maxOccupants >= minCapacity
    const minCap = query.minCapacity ?? query.mem;
    if (minCap !== undefined && minCap > 0) {
      whereClause.maxOccupants = { gte: minCap };
    }

    // Tenant type: if 'family' or 'bachelor', match listings of that type OR 'any'
    if (query.type) {
      whereClause.tenantType = {
        in: [query.type, 'any'],
      };
    }

    // Sorting: default is rent ASC; 'new' is newest listings first (createdAt DESC)
    const orderBy: any = query.sort === 'new' ? { createdAt: 'desc' } : { rent: 'asc' };

    const listings = await prisma.listing.findMany({
      where: whereClause,
      orderBy,
    });

    return listings.map(formatPublicListing);
  }

  /**
   * Get a single listing by ID.
   */
  async getListingById(id: number): Promise<PublicListing | null> {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) return null;
    return formatPublicListing(listing);
  }

  /**
   * Create a new listing with ownership deletion token and geographic coordinates.
   */
  async createListing(
    input: CreateListingInput,
    imageFilename?: string
  ): Promise<{ listing: PublicListing; deletionToken: string }> {
    const deletionToken = generateDeletionToken();
    const deletionHash = hashDeletionToken(deletionToken);

    const imageUrl = imageFilename ? `/uploads/${imageFilename}` : null;
    const cardColor = input.cardColor || getRandomColor();

    const created = await prisma.listing.create({
      data: {
        name: input.name,
        phone: input.phone,
        loc: input.loc,
        addr: input.addr,
        rent: input.rent,
        rooms: input.rooms,
        floor: input.floor,
        maxOccupants: input.maxOccupants || input.max || 1,
        tenantType: input.tenantType,
        rules: JSON.stringify(input.rules),
        imageUrl,
        cardColor,
        locationId: input.locationId,
        ward: input.ward,
        latitude: input.latitude,
        longitude: input.longitude,
        coordinateAccuracy: input.coordinateAccuracy || 'approximate',
        isApproximatePin: input.isApproximatePin || false,
        isDemo: false,
        deletionHash,
      },
    });

    return {
      listing: formatPublicListing(created),
      deletionToken,
    };
  }

  /**
   * Delete a listing after verifying the creator's deletion token.
   */
  async deleteListing(id: number, token: string): Promise<boolean> {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      const error: any = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    if (listing.isDemo) {
      const error: any = new Error('ডেমো সংস্করণ বিজ্ঞাপন মুছে ফেলা যাবে না');
      error.statusCode = 403;
      throw error;
    }

    const isValid = verifyDeletionToken(token, listing.deletionHash);
    if (!isValid) {
      const error: any = new Error('অননুমোদিত অনুরোধ: সঠিক ডিলিট টোকেন নেই');
      error.statusCode = 403;
      throw error;
    }

    // Delete uploaded image file from disk if present
    if (listing.imageUrl && listing.imageUrl.startsWith('/uploads/')) {
      const filename = path.basename(listing.imageUrl);
      const filePath = path.join(config.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Failed to delete file ${filePath}:`, e);
        }
      }
    }

    await prisma.listing.delete({
      where: { id },
    });

    return true;
  }
}

export const listingService = new ListingService();
