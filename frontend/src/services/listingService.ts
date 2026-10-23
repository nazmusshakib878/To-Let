import { request } from './api';
import {
  ApiResponse,
  CreateListingPayload,
  UpdateListingPayload,
  Listing,
  ListingFilterQuery,
  ReportListingPayload,
  AdminStats,
  AdminReport,
} from '../types/listing';

export interface CreateListingResponse {
  success: boolean;
  message: string;
  data: Listing;
  deletionToken: string;
}

export const listingService = {
  /**
   * Health check
   */
  async getHealth(): Promise<{ status: string; database: string }> {
    return request<{ status: string; database: string }>('/health');
  },

  /**
   * Get supported area names
   */
  async getAreas(): Promise<string[]> {
    const res = await request<ApiResponse<string[]>>('/areas');
    return res.data;
  },

  /**
   * Fetch listings with optional search, ward, and geographic bounds parameters
   */
  async getListings(filters: ListingFilterQuery = {}): Promise<Listing[]> {
    const params = new URLSearchParams();

    if (filters.loc) params.set('loc', filters.loc);
    if (filters.ward !== undefined) params.set('ward', String(filters.ward));
    if (filters.locationId !== undefined) params.set('locationId', String(filters.locationId));
    if (filters.bounds) params.set('bounds', filters.bounds);
    if (filters.maxRent !== undefined && filters.maxRent > 0) {
      params.set('maxRent', String(filters.maxRent));
    }
    if (filters.minRooms !== undefined && filters.minRooms > 0) {
      params.set('minRooms', String(filters.minRooms));
    }
    if (filters.floor !== undefined) {
      params.set('floor', String(filters.floor));
    }
    if (filters.minCapacity !== undefined && filters.minCapacity > 0) {
      params.set('minCapacity', String(filters.minCapacity));
    }
    if (filters.type) params.set('type', filters.type);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.includeRented !== undefined) {
      params.set('includeRented', String(filters.includeRented));
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await request<ApiResponse<Listing[]>>(`/listings${queryString}`);
    return res.data;
  },

  /**
   * Fetch a single listing by ID
   */
  async getListingById(id: number): Promise<Listing> {
    const res = await request<ApiResponse<Listing>>(`/listings/${id}`);
    return res.data;
  },

  /**
   * Create a new listing with multipart/form-data and geographic coordinates
   */
  async createListing(payload: CreateListingPayload): Promise<CreateListingResponse> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('phone', payload.phone);
    formData.append('loc', payload.loc);
    formData.append('addr', payload.addr);
    formData.append('rent', String(payload.rent));
    formData.append('rooms', String(payload.rooms));
    formData.append('floor', String(payload.floor));
    const maxVal = payload.maxOccupants ?? payload.max ?? 1;
    const typeVal = payload.tenantType ?? payload.type ?? 'family';
    formData.append('maxOccupants', String(maxVal));
    formData.append('tenantType', typeVal);
    formData.append('rules', JSON.stringify(payload.rules));

    if (payload.ward !== undefined) {
      formData.append('ward', String(payload.ward));
    }
    if (payload.locationId !== undefined) {
      formData.append('locationId', String(payload.locationId));
    }
    if (payload.latitude !== undefined && payload.latitude !== null) {
      formData.append('latitude', String(payload.latitude));
    }
    if (payload.longitude !== undefined && payload.longitude !== null) {
      formData.append('longitude', String(payload.longitude));
    }
    if (payload.coordinateAccuracy) {
      formData.append('coordinateAccuracy', payload.coordinateAccuracy);
    }
    if (payload.isApproximatePin !== undefined) {
      formData.append('isApproximatePin', String(payload.isApproximatePin));
    }

    const photo = payload.photoFile || payload.photo;
    if (photo) {
      formData.append('photo', photo);
    }

    return request<CreateListingResponse>('/listings', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Toggle or update "isRented" status using owner's secret token
   */
  async toggleRented(id: number, deletionToken: string, isRented?: boolean): Promise<Listing> {
    const res = await request<ApiResponse<Listing>>(`/listings/${id}/rented`, {
      method: 'PATCH',
      headers: {
        'x-deletion-token': deletionToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRented }),
    });
    return res.data;
  },

  /**
   * Renew listing for 30 more days using owner's secret token
   */
  async renewListing(id: number, deletionToken: string): Promise<Listing> {
    const res = await request<ApiResponse<Listing>>(`/listings/${id}/renew`, {
      method: 'POST',
      headers: {
        'x-deletion-token': deletionToken,
      },
    });
    return res.data;
  },

  /**
   * Report a fake or fraudulent listing
   */
  async reportListing(id: number, payload: ReportListingPayload): Promise<{ reportId: number }> {
    const res = await request<ApiResponse<{ reportId: number }>>(`/listings/${id}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Delete a listing using owner deletion token
   */
  async deleteListing(id: number, deletionToken: string): Promise<boolean> {
    const res = await request<{ success: boolean; message: string }>(`/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'x-deletion-token': deletionToken,
      },
    });
    return res.success;
  },

  /**
   * Update an existing listing using owner deletion/management token
   */
  async updateListing(
    id: number,
    deletionToken: string,
    payload: UpdateListingPayload
  ): Promise<Listing> {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append('name', payload.name);
    if (payload.phone !== undefined) formData.append('phone', payload.phone);
    if (payload.loc !== undefined) formData.append('loc', payload.loc);
    if (payload.addr !== undefined) formData.append('addr', payload.addr);
    if (payload.rent !== undefined) formData.append('rent', String(payload.rent));
    if (payload.rooms !== undefined) formData.append('rooms', String(payload.rooms));
    if (payload.floor !== undefined) formData.append('floor', String(payload.floor));
    if (payload.maxOccupants !== undefined) {
      formData.append('maxOccupants', String(payload.maxOccupants));
    }
    if (payload.tenantType !== undefined) formData.append('tenantType', payload.tenantType);
    if (payload.rules !== undefined) formData.append('rules', JSON.stringify(payload.rules));
    if (payload.ward !== undefined) formData.append('ward', String(payload.ward));
    if (payload.latitude !== undefined) formData.append('latitude', String(payload.latitude));
    if (payload.longitude !== undefined) formData.append('longitude', String(payload.longitude));
    if (payload.isApproximatePin !== undefined) {
      formData.append('isApproximatePin', String(payload.isApproximatePin));
    }
    if (payload.photoFile) {
      formData.append('photo', payload.photoFile);
    }

    const res = await request<ApiResponse<Listing>>(`/listings/${id}`, {
      method: 'PUT',
      headers: {
        'x-deletion-token': deletionToken,
      },
      body: formData,
    });
    return res.data;
  },

  /**
   * Admin: Fetch platform metrics computed directly from database
   */
  async adminGetStats(adminKey: string): Promise<AdminStats> {
    const res = await request<ApiResponse<AdminStats>>('/admin/stats', {
      headers: {
        'x-admin-key': adminKey,
      },
    });
    return res.data;
  },

  /**
   * Admin: Fetch submitted abuse/fraud reports
   */
  async adminGetReports(adminKey: string): Promise<AdminReport[]> {
    const res = await request<ApiResponse<AdminReport[]>>('/admin/reports', {
      headers: {
        'x-admin-key': adminKey,
      },
    });
    return res.data;
  },

  /**
   * Admin: Update report review status
   */
  async adminUpdateReport(
    reportId: number,
    status: 'pending' | 'reviewed' | 'dismissed',
    adminKey: string
  ): Promise<any> {
    const res = await request<ApiResponse<any>>(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'x-admin-key': adminKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  /**
   * Admin: Hide/restore (isActive) or set rented (isRented) for any listing
   */
  async adminUpdateListingStatus(
    listingId: number,
    data: { isActive?: boolean; isRented?: boolean },
    adminKey: string
  ): Promise<Listing> {
    const res = await request<ApiResponse<Listing>>(`/admin/listings/${listingId}/status`, {
      method: 'PATCH',
      headers: {
        'x-admin-key': adminKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Admin: Delete listing permanently
   */
  async adminDeleteListing(listingId: number, adminKey: string): Promise<boolean> {
    const res = await request<{ success: boolean; message: string }>(
      `/admin/listings/${listingId}`,
      {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey,
        },
      }
    );
    return res.success;
  },
};
