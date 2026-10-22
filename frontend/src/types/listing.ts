export type TenantType = 'family' | 'bachelor' | 'any';

export interface Listing {
  id: number;
  name: string;
  phone: string;
  loc: string;
  addr: string;
  rent: number;
  rooms: number;
  floor: number;
  max: number; // Max occupants
  type: TenantType;
  rules: string[];
  photo: string;
  imageUrl?: string | null;
  cardColor?: string | null;
  isDemo?: boolean;
  
  // Geographic and Location fields
  ward?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  coordinateAccuracy?: string | null;
  isApproximatePin?: boolean;
  locationId?: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface ListingFilterQuery {
  loc?: string;
  ward?: number;
  locationId?: number;
  bounds?: string; // "minLat,minLng,maxLat,maxLng"
  maxRent?: number;
  minRooms?: number;
  floor?: number;
  minCapacity?: number;
  type?: string;
  sort?: 'rent' | 'new';
}

export interface CreateListingPayload {
  name: string;
  phone: string;
  loc: string;
  addr: string;
  rent: number;
  rooms: number;
  floor: number;
  maxOccupants: number;
  tenantType: TenantType;
  rules: string[];
  photoFile?: File | null;
  
  // Geographic and Location fields
  locationId?: number;
  ward?: number;
  latitude?: number;
  longitude?: number;
  coordinateAccuracy?: 'exact' | 'approximate';
  isApproximatePin?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export interface CreateListingResponse {
  success: boolean;
  message: string;
  data: Listing;
  deletionToken: string;
}

export interface StoredOwnership {
  listingId: number;
  deletionToken: string;
  createdAt: string;
}
