import { prisma } from '../config/db';
import { generateDeletionToken, hashDeletionToken, verifyDeletionToken } from '../utils/crypto';
import { generatePlaceholderSvg } from '../utils/placeholder';
import { CreateListingInput, ListingQueryParams, UpdateListingInput } from '../validators/listingValidator';
import { storageService } from './storageService';

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

  // New Status & Expiry Fields
  isRented: boolean;
  isActive: boolean;
  expiresAt: string | null;
  isExpired: boolean;
  daysRemaining: number | null;

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

  const now = new Date();
  const expiresAtDate = item.expiresAt ? new Date(item.expiresAt) : null;
  const isExpired = expiresAtDate ? expiresAtDate.getTime() < now.getTime() : false;
  const daysRemaining = expiresAtDate
    ? Math.max(0, Math.ceil((expiresAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

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

    // Status and Expiry
    isRented: item.isRented || false,
    isActive: item.isActive !== undefined ? item.isActive : true,
    expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString() : null,
    isExpired,
    daysRemaining,

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

    // Expiry and Active filter (by default show only active, non-expired listings unless includeExpired=true)
    if (!query.includeExpired) {
      whereClause.isActive = true;
      whereClause.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    // Rented filter (by default include rented or allow filtering out rented)
    if (query.includeRented === false) {
      whereClause.isRented = false;
    }

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

    // Capacity filter: maxOccupants >= minCapacity
    const minCapacity = query.minCapacity ?? query.mem;
    if (minCapacity !== undefined && minCapacity > 0) {
      whereClause.maxOccupants = { gte: minCapacity };
    }

    // Tenant type filter: 'family' | 'bachelor' | 'any'
    if (query.type) {
      whereClause.tenantType = { in: [query.type, 'any'] };
    }

    // Sorting logic
    let orderBy: any = [{ rent: 'asc' }, { createdAt: 'desc' }];
    if (query.sort === 'new') {
      orderBy = [{ createdAt: 'desc' }];
    }

    const items = await prisma.listing.findMany({
      where: whereClause,
      orderBy,
    });

    return items.map(formatPublicListing);
  }

  /**
   * Retrieve a single listing by its ID.
   */
  async getListingById(id: number): Promise<PublicListing | null> {
    const item = await prisma.listing.findUnique({
      where: { id },
    });

    if (!item) return null;
    return formatPublicListing(item);
  }

  /**
   * Create a new listing with automatic 30-day expiry, cloud storage support, and cryptographic deletion token.
   */
  async createListing(
    input: CreateListingInput,
    uploadedFile?: Express.Multer.File
  ): Promise<{ listing: PublicListing; deletionToken: string }> {
    const deletionToken = generateDeletionToken();
    const deletionHash = hashDeletionToken(deletionToken);

    let imageUrl: string | null = null;

    if (uploadedFile) {
      const storageResult = await storageService.processUploadedFile(uploadedFile);
      imageUrl = storageResult.imageUrl;
    }

    const cardColor = input.cardColor || getRandomColor();

    // Set 30 days expiry from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
        isRented: false,
        isActive: true,
        expiresAt,
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
   * Toggle or update the "isRented" status of a listing using the creator's secret token.
   */
  async toggleRentedStatus(id: number, token: string, isRented?: boolean): Promise<PublicListing> {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      const error: any = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const isValid = verifyDeletionToken(token, listing.deletionHash);
    if (!isValid) {
      const error: any = new Error('অননুমোদিত অনুরোধ: সঠিক ম্যানেজমেন্ট টোকেন নেই');
      error.statusCode = 403;
      throw error;
    }

    const nextStatus = isRented !== undefined ? isRented : !listing.isRented;

    const updated = await prisma.listing.update({
      where: { id },
      data: { isRented: nextStatus },
    });

    return formatPublicListing(updated);
  }

  /**
   * Renew listing for another 30 days using the creator's secret token.
   */
  async renewListing(id: number, token: string): Promise<PublicListing> {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      const error: any = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const isValid = verifyDeletionToken(token, listing.deletionHash);
    if (!isValid) {
      const error: any = new Error('অননুমোদিত অনুরোধ: সঠিক ম্যানেজমেন্ট টোকেন নেই');
      error.statusCode = 403;
      throw error;
    }

    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        expiresAt: newExpiry,
        isActive: true,
      },
    });

    return formatPublicListing(updated);
  }

  /**
   * Report a fake, fraudulent, or outdated listing.
   */
  async reportListing(
    listingId: number,
    reportData: { reason: string; details?: string; reporterPhone?: string }
  ): Promise<any> {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      const error: any = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const report = await prisma.report.create({
      data: {
        listingId,
        reason: reportData.reason,
        details: reportData.details,
        reporterPhone: reportData.reporterPhone,
      },
    });

    return report;
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

    // Delete image via storage service (handles local disk or Cloudinary)
    if (listing.imageUrl) {
      await storageService.deleteImage(listing.imageUrl);
    }

    await prisma.listing.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Update an existing listing using the creator's secret token.
   */
  async updateListing(
    id: number,
    token: string,
    input: UpdateListingInput,
    uploadedFile?: Express.Multer.File
  ): Promise<PublicListing> {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      const error: any = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const isValid = verifyDeletionToken(token, listing.deletionHash);
    if (!isValid) {
      const error: any = new Error('অননুমোদিত অনুরোধ: সঠিক এডিট/ম্যানেজমেন্ট টোকেন নেই');
      error.statusCode = 403;
      throw error;
    }

    let imageUrl = listing.imageUrl;
    if (uploadedFile) {
      // If there was an old image, remove it
      if (listing.imageUrl) {
        await storageService.deleteImage(listing.imageUrl);
      }
      const storageResult = await storageService.processUploadedFile(uploadedFile);
      imageUrl = storageResult.imageUrl;
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.loc !== undefined) updateData.loc = input.loc;
    if (input.addr !== undefined) updateData.addr = input.addr;
    if (input.rent !== undefined) updateData.rent = input.rent;
    if (input.rooms !== undefined) updateData.rooms = input.rooms;
    if (input.floor !== undefined) updateData.floor = input.floor;
    if (input.maxOccupants !== undefined) updateData.maxOccupants = input.maxOccupants;
    if (input.tenantType !== undefined) updateData.tenantType = input.tenantType;
    if (input.rules !== undefined) updateData.rules = JSON.stringify(input.rules);
    if (input.ward !== undefined) updateData.ward = input.ward;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.isApproximatePin !== undefined) updateData.isApproximatePin = input.isApproximatePin;
    if (imageUrl !== listing.imageUrl) updateData.imageUrl = imageUrl;

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    return formatPublicListing(updated);
  }

  /**
   * Admin: Get comprehensive platform stats derived directly from real database records.
   */
  async getAdminStats(): Promise<{
    totalListings: number;
    activeListings: number;
    rentedListings: number;
    expiredListings: number;
    demoListings: number;
    totalReports: number;
    pendingReports: number;
  }> {
    const now = new Date();
    const [
      totalListings,
      activeListings,
      rentedListings,
      expiredListings,
      demoListings,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.listing.count({ where: { isRented: true } }),
      prisma.listing.count({
        where: {
          expiresAt: { lte: now },
        },
      }),
      prisma.listing.count({ where: { isDemo: true } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'pending' } }),
    ]);

    return {
      totalListings,
      activeListings,
      rentedListings,
      expiredListings,
      demoListings,
      totalReports,
      pendingReports,
    };
  }

  /**
   * Admin: Retrieve all reports with their associated listing data (safe, no deletion tokens exposed).
   */
  async getAdminReports(): Promise<any[]> {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            phone: true,
            loc: true,
            addr: true,
            rent: true,
            ward: true,
            isActive: true,
            isRented: true,
            isDemo: true,
            createdAt: true,
          },
        },
      },
    });

    return reports.map((r) => ({
      id: r.id,
      listingId: r.listingId,
      reason: r.reason,
      details: r.details,
      reporterPhone: r.reporterPhone,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      listing: r.listing
        ? {
            ...r.listing,
            createdAt: r.listing.createdAt.toISOString(),
          }
        : null,
    }));
  }

  /**
   * Admin: Update report status (e.g. reviewed, dismissed).
   */
  async updateReportStatus(reportId: number, status: string): Promise<any> {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      const error: any = new Error('রিপোর্টটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    return prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
  }

  /**
   * Admin: Toggle or set listing active status (hide/restore) or rented status.
   */
  async adminUpdateListingStatus(
    id: number,
    data: { isActive?: boolean; isRented?: boolean }
  ): Promise<PublicListing> {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      const error: any = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.listing.update({
      where: { id },
      data,
    });

    return formatPublicListing(updated);
  }

  /**
   * Admin: Permanently delete a listing.
   */
  async adminDeleteListing(id: number): Promise<boolean> {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      const error: any = new Error('বিজ্ঞাপনটি পাওয়া যায়নি');
      error.statusCode = 404;
      throw error;
    }

    if (listing.imageUrl) {
      await storageService.deleteImage(listing.imageUrl);
    }

    await prisma.listing.delete({ where: { id } });
    return true;
  }
}

export const listingService = new ListingService();
