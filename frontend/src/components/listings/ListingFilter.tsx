import React, { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { ListingFilterQuery } from '../../types/listing';
import { DEFAULT_AREAS } from '../../constants/areas';
import { listingService } from '../../services/listingService';
import { locationService } from '../../services/locationService';
import { LocationAutocomplete } from '../location/LocationAutocomplete';
import { LocationItem, WardItem } from '../../types/location';
import { bn } from '../../utils/bengali';

interface ListingFilterProps {
  filters: ListingFilterQuery;
  onSearch: (filters: ListingFilterQuery) => void;
  onReset: () => void;
  onLocationSelect?: (location: LocationItem | null) => void;
}

export const ListingFilter: React.FC<ListingFilterProps> = ({
  filters,
  onSearch,
  onReset,
  onLocationSelect,
}) => {
  const [areas, setAreas] = useState<string[]>(DEFAULT_AREAS);
  const [wards, setWards] = useState<WardItem[]>([]);
  const [localFilters, setLocalFilters] = useState<ListingFilterQuery>(filters);

  // Sync when external filters change (e.g. on reset)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Load dynamic areas and wards from backend
  useEffect(() => {
    listingService
      .getAreas()
      .then((data) => {
        if (data && data.length) setAreas(data);
      })
      .catch(() => {});

    locationService
      .getWards()
      .then((data) => {
        if (data && data.length) setWards(data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (field: keyof ListingFilterQuery, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAutocompleteSelect = (loc: LocationItem | null) => {
    if (loc) {
      const updated: ListingFilterQuery = {
        ...localFilters,
        loc: loc.nameBn,
        ward: loc.ward ?? undefined,
        locationId: loc.id,
      };
      setLocalFilters(updated);
      onSearch(updated);
      if (onLocationSelect) onLocationSelect(loc);
    } else {
      const updated: ListingFilterQuery = {
        ...localFilters,
        loc: '',
        ward: undefined,
        locationId: undefined,
      };
      setLocalFilters(updated);
      onSearch(updated);
      if (onLocationSelect) onLocationSelect(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localFilters);
  };

  const handleResetClick = () => {
    onReset();
  };

  return (
    <form className="panel" onSubmit={handleSubmit} role="search" aria-label="বাসা অনুসন্ধান ফিল্টার">
      {/* Smart Location Search Bar on Top */}
      <div style={{ marginBottom: '14px' }}>
        <label>স্মার্ট লোকেশন অনুসন্ধান (বাংলা বা ইংরেজি)</label>
        <LocationAutocomplete
          initialValue={localFilters.loc || ''}
          placeholder="এলাকা, ওয়ার্ড বা মোড় খুঁজুন (যেমন: সোনাডাঙ্গা, Nirala, Ward 24, গল্লামারী, বিআইডিসি রোড)..."
          onSelect={handleAutocompleteSelect}
        />
      </div>

      <div className="grid">
        <div>
          <label htmlFor="fLoc">এলাকা</label>
          <select
            id="fLoc"
            value={localFilters.loc || ''}
            onChange={(e) => handleChange('loc', e.target.value)}
          >
            <option value="">সব এলাকা</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fWard">কেসিসি ওয়ার্ড</label>
          <select
            id="fWard"
            value={localFilters.ward ?? ''}
            onChange={(e) =>
              handleChange(
                'ward',
                e.target.value === '' ? undefined : parseInt(e.target.value, 10)
              )
            }
          >
            <option value="">সকল ওয়ার্ড</option>
            {wards.map((w) => (
              <option key={w.ward} value={w.ward}>
                ওয়ার্ড {bn(w.ward)} ({w.nameBn.split('(')[1]?.replace(')', '') || w.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fRent">সর্বোচ্চ ভাড়া (৳)</label>
          <input
            id="fRent"
            type="number"
            min={500}
            step={100}
            placeholder="যেকোনো"
            value={localFilters.maxRent !== undefined ? localFilters.maxRent : ''}
            onChange={(e) =>
              handleChange(
                'maxRent',
                e.target.value === '' ? undefined : parseInt(e.target.value, 10)
              )
            }
          />
        </div>

        <div>
          <label htmlFor="fRooms">রুম লাগবে</label>
          <select
            id="fRooms"
            value={localFilters.minRooms ?? 0}
            onChange={(e) => handleChange('minRooms', parseInt(e.target.value, 10))}
          >
            <option value={0}>যেকোনো</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>

        <div>
          <label htmlFor="fFloor">তলা</label>
          <select
            id="fFloor"
            value={localFilters.floor !== undefined ? localFilters.floor : ''}
            onChange={(e) =>
              handleChange(
                'floor',
                e.target.value === '' ? undefined : parseInt(e.target.value, 10)
              )
            }
          >
            <option value="">যেকোনো</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>

        <div>
          <label htmlFor="fMem">পরিবারের সদস্য</label>
          <input
            id="fMem"
            type="number"
            min={1}
            placeholder="যেকোনো"
            value={localFilters.minCapacity !== undefined ? localFilters.minCapacity : ''}
            onChange={(e) =>
              handleChange(
                'minCapacity',
                e.target.value === '' ? undefined : parseInt(e.target.value, 10)
              )
            }
          />
        </div>

        <div>
          <label htmlFor="fType">ভাড়াটিয়া</label>
          <select
            id="fType"
            value={localFilters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="">যেকোনো</option>
            <option value="family">ফ্যামিলি</option>
            <option value="bachelor">ব্যাচেলর</option>
          </select>
        </div>
      </div>

      <div className="row">
        <button type="submit" className="btn" id="go">
          <Search size={16} />
          খুঁজুন
        </button>
        <button type="button" className="btn ghost" id="reset" onClick={handleResetClick}>
          <RotateCcw size={16} />
          ফিল্টার মুছুন
        </button>
      </div>
    </form>
  );
};
