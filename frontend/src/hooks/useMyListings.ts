import { useState, useCallback } from 'react';

const STORAGE_KEY = 'tolet-ownership-v1';

export function useMyListings() {
  const [tokens, setTokens] = useState<Record<number, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveOwnership = useCallback((listingId: number, deletionToken: string) => {
    setTokens((prev) => {
      const updated = { ...prev, [listingId]: deletionToken };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save listing ownership to localStorage', e);
      }
      return updated;
    });
  }, []);

  const removeOwnership = useCallback((listingId: number) => {
    setTokens((prev) => {
      const updated = { ...prev };
      delete updated[listingId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update localStorage', e);
      }
      return updated;
    });
  }, []);

  const isMyListing = useCallback(
    (listingId: number): boolean => {
      return Boolean(tokens[listingId]);
    },
    [tokens]
  );

  const getDeletionToken = useCallback(
    (listingId: number): string | undefined => {
      return tokens[listingId];
    },
    [tokens]
  );

  return {
    saveOwnership,
    removeOwnership,
    isMyListing,
    getDeletionToken,
  };
}
