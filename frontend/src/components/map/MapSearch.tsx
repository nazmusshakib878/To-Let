import React from 'react';
import { LocationAutocomplete } from '../location/LocationAutocomplete';
import { LocationItem } from '../../types/location';

interface MapSearchProps {
  onSelectLocation: (location: LocationItem | null) => void;
  className?: string;
  placeholder?: string;
}

export const MapSearch: React.FC<MapSearchProps> = ({
  onSelectLocation,
  className = '',
  placeholder = 'খুলনার এলাকা বা ওয়ার্ড খুঁজুন...',
}) => {
  return (
    <div
      className={`map-in-search ${className}`}
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 500,
        width: 'calc(100% - 100px)',
        maxWidth: '340px',
      }}
    >
      <LocationAutocomplete
        placeholder={placeholder}
        onSelect={onSelectLocation}
      />
    </div>
  );
};
