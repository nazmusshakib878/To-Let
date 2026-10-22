export type LocationType = 'city' | 'ward' | 'area' | 'landmark' | 'road';

export interface LocationItem {
  id: number;
  nameBn: string;
  nameEn: string;
  type: LocationType;
  ward: number | null;
  parentLocationId: number | null;
  latitude: number | null;
  longitude: number | null;
  aliases: string[];
  description: string | null;
  isVerified: boolean;
  source: string | null;
}

export interface WardItem {
  ward: number;
  nameBn: string;
  nameEn: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export type MapViewMode = 'list' | 'map' | 'split';
