import { request } from './api';
import {
  ApiResponse,
  CreateListingPayload,
  CreateListingResponse,
  Listing,
  ListingFilterQuery,
} from '../types/listing';

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
    formData.append('maxOccupants', String(payload.maxOccupants));
    formData.append('tenantType', payload.tenantType);
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

    if (payload.photoFile) {
      formData.append('photo', payload.photoFile);
    }

    return request<CreateListingResponse>('/listings', {
      method: 'POST',
      body: formData,
    });
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
};
