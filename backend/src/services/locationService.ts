import { prisma } from '../config/db';

export interface PublicLocation {
  id: number;
  nameBn: string;
  nameEn: string;
  type: string;
  ward: number | null;
  parentLocationId: number | null;
  latitude: number | null;
  longitude: number | null;
  aliases: string[];
  description: string | null;
  isVerified: boolean;
  source: string | null;
}

function formatLocation(loc: any): PublicLocation {
  let aliases: string[] = [];
  try {
    if (loc.aliases) {
      aliases = JSON.parse(loc.aliases);
    }
  } catch {
    aliases = [];
  }

  return {
    id: loc.id,
    nameBn: loc.nameBn,
    nameEn: loc.nameEn,
    type: loc.type,
    ward: loc.ward,
    parentLocationId: loc.parentLocationId,
    latitude: loc.latitude,
    longitude: loc.longitude,
    aliases,
    description: loc.description,
    isVerified: loc.isVerified,
    source: loc.source,
  };
}

export class LocationService {
  /**
   * Get all locations, optionally filtered by type.
   */
  async getAllLocations(type?: string): Promise<PublicLocation[]> {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: [{ type: 'asc' }, { ward: 'asc' }, { nameEn: 'asc' }],
    });

    return locations.map(formatLocation);
  }

  /**
   * Smart bilingual search with phonetic aliases and ward matching.
   */
  async searchLocations(rawQuery: string): Promise<PublicLocation[]> {
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      // Default: return major areas and first few wards
      const defaults = await prisma.location.findMany({
        where: {
          OR: [{ type: 'area' }, { type: 'landmark' }],
        },
        take: 20,
        orderBy: { nameBn: 'asc' },
      });
      return defaults.map(formatLocation);
    }

    // Check if query is looking for a ward (e.g. "ward 24", "২৪", "24 no ward", "ward24")
    const wardNumberMatch = query.match(/(?:ward|ওয়ার্ড|ওয়ার্ড|নং|no\.?)?\s*(\d+|[০-৯]+)/i);
    let wardNum: number | undefined;

    if (wardNumberMatch) {
      const numStr = wardNumberMatch[1].replace(/[০-৯]/g, (d) =>
        String('০১২৩৪৫৬৭৮৯'.indexOf(d))
      );
      const parsed = parseInt(numStr, 10);
      if (parsed >= 1 && parsed <= 31) {
        wardNum = parsed;
      }
    }

    // Search in SQLite database
    const locations = await prisma.location.findMany({
      where: {
        OR: [
          ...(wardNum !== undefined ? [{ ward: wardNum }] : []),
          { nameBn: { contains: query } },
          { nameEn: { contains: query } },
          { aliases: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 25,
    });

    // Score and rank results: exact prefix matches first, then areas, then landmarks, then wards
    const ranked = locations.map(formatLocation).sort((a, b) => {
      const aNameBn = a.nameBn.toLowerCase();
      const aNameEn = a.nameEn.toLowerCase();
      const bNameBn = b.nameBn.toLowerCase();
      const bNameEn = b.nameEn.toLowerCase();

      const aStarts = aNameBn.startsWith(query) || aNameEn.startsWith(query);
      const bStarts = bNameBn.startsWith(query) || bNameEn.startsWith(query);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Prioritize area over landmark over ward
      const typePriority: Record<string, number> = { area: 1, landmark: 2, ward: 3, city: 4 };
      return (typePriority[a.type] || 5) - (typePriority[b.type] || 5);
    });

    return ranked;
  }

  /**
   * Get all 31 KCC Wards.
   */
  async getWards(): Promise<PublicLocation[]> {
    const wards = await prisma.location.findMany({
      where: { type: 'ward' },
      orderBy: { ward: 'asc' },
    });
    return wards.map(formatLocation);
  }

  /**
   * Get a single location by ID.
   */
  async getLocationById(id: number): Promise<PublicLocation | null> {
    const loc = await prisma.location.findUnique({
      where: { id },
      include: {
        childLocations: true,
      },
    });

    if (!loc) return null;
    return formatLocation(loc);
  }
}

export const locationService = new LocationService();
