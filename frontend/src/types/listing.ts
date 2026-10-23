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
  
  // Status and Expiry
  isRented?: boolean;
  isActive?: boolean;
  expiresAt?: string | null;
  isExpired?: boolean;
  daysRemaining?: number | null;

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
  includeRented?: boolean;
}

export interface CreateListingPayload {
  name: string;
  phone: string;
  loc: string;
  addr: string;
  rent: number;
  rooms: number;
  floor: number;
  max?: number;
  maxOccupants?: number;
  type?: TenantType;
  tenantType?: TenantType;
  rules: string[];
  cardColor?: string;
  locationId?: number;
  ward?: number;
  latitude?: number;
  longitude?: number;
  coordinateAccuracy?: 'exact' | 'approximate';
  isApproximatePin?: boolean;
  photo?: File | null;
  photoFile?: File | null;
}

export interface ReportListingPayload {
  reason: 'fake' | 'incorrect_info' | 'rented_already' | 'fraud' | 'other';
  details?: string;
  reporterPhone?: string;
}

export interface UpdateListingPayload {
  name?: string;
  phone?: string;
  loc?: string;
  addr?: string;
  rent?: number;
  rooms?: number;
  floor?: number;
  maxOccupants?: number;
  tenantType?: TenantType;
  rules?: string[];
  ward?: number;
  latitude?: number;
  longitude?: number;
  isApproximatePin?: boolean;
  photoFile?: File | null;
}

export interface AdminStats {
  totalListings: number;
  activeListings: number;
  rentedListings: number;
  expiredListings: number;
  demoListings: number;
  totalReports: number;
  pendingReports: number;
}

export interface AdminReport {
  id: number;
  listingId: number;
  reason: string;
  details?: string;
  reporterPhone?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
  listing?: {
    id: number;
    name: string;
    phone: string;
    loc: string;
    addr: string;
    rent: number;
    ward?: number | null;
    isActive: boolean;
    isRented: boolean;
    isDemo: boolean;
    createdAt: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  deletionToken?: string;
}
