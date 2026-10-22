import { useState, useEffect, useCallback } from 'react';
import { Listing, ListingFilterQuery } from '../types/listing';
import { listingService } from '../services/listingService';

export const INITIAL_FILTERS: ListingFilterQuery = {
  loc: '',
  maxRent: 3000,
  minRooms: 2,
  floor: 2,
  minCapacity: 4,
  type: 'family',
  sort: 'rent',
};

export const EMPTY_FILTERS: ListingFilterQuery = {
  loc: '',
  maxRent: undefined,
  minRooms: 0,
  floor: undefined,
  minCapacity: undefined,
  type: '',
  sort: 'rent',
};

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<ListingFilterQuery>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (currentFilters: ListingFilterQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listingService.getListings(currentFilters);
      setListings(data);
    } catch (err: any) {
      setError(err?.message || 'বিজ্ঞাপন লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [fetchListings, filters]);

  const updateFilters = useCallback((newFilters: Partial<ListingFilterQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const refetch = useCallback(() => {
    return fetchListings(filters);
  }, [fetchListings, filters]);

  return {
    listings,
    filters,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    refetch,
    setFilters,
  };
}
