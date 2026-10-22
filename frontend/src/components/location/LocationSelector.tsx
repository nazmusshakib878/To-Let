import React, { useState, useEffect } from 'react';
import { WardItem, LocationItem } from '../../types/location';
import { locationService } from '../../services/locationService';
import { LocationAutocomplete } from './LocationAutocomplete';
import { bn } from '../../utils/bengali';

interface LocationSelectorProps {
  selectedLocationName?: string;
  selectedWard?: number;
  onLocationSelect: (location: LocationItem | null) => void;
  onWardSelect: (ward: number | undefined) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocationName = '',
  selectedWard,
  onLocationSelect,
  onWardSelect,
}) => {
  const [wards, setWards] = useState<WardItem[]>([]);

  useEffect(() => {
    locationService
      .getWards()
      .then((data) => setWards(data))
      .catch(() => {});
  }, []);

  return (
    <div className="location-selector-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
      <div>
        <label>এলাকা বা ল্যান্ডমার্ক অনুসন্ধান</label>
        <LocationAutocomplete
          initialValue={selectedLocationName}
          onSelect={onLocationSelect}
        />
      </div>

      <div>
        <label htmlFor="fWard">কেসিসি ওয়ার্ড</label>
        <select
          id="fWard"
          value={selectedWard ?? ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onWardSelect(val);
          }}
        >
          <option value="">সকল ওয়ার্ড</option>
          {wards.map((w) => (
            <option key={w.ward} value={w.ward}>
              ওয়ার্ড {bn(w.ward)} ({w.nameBn.split('(')[1]?.replace(')', '') || w.nameEn})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
