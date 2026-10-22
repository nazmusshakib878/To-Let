import { request } from './api';
import { ApiResponse } from '../types/listing';
import { LocationItem, WardItem } from '../types/location';

export const locationService = {
  /**
   * Search locations by Bengali, English, alias or ward number
   */
  async searchLocations(query: string): Promise<LocationItem[]> {
    const encoded = encodeURIComponent(query.trim());
    const res = await request<ApiResponse<LocationItem[]>>(`/locations/search?q=${encoded}`);
    return res.data;
  },

  /**
   * Get all 31 KCC Wards
   */
  async getWards(): Promise<WardItem[]> {
    const res = await request<ApiResponse<WardItem[]>>('/locations/wards');
    return res.data;
  },

  /**
   * Get all locations optionally filtered by type
   */
  async getLocations(type?: string): Promise<LocationItem[]> {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    const res = await request<ApiResponse<LocationItem[]>>(`/locations${query}`);
    return res.data;
  },

  /**
   * Get location details by ID
   */
  async getLocationById(id: number): Promise<LocationItem> {
    const res = await request<ApiResponse<LocationItem>>(`/locations/${id}`);
    return res.data;
  },
};
