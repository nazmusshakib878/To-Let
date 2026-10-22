import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { LocationItem } from '../../types/location';
import { locationService } from '../../services/locationService';
import { bn } from '../../utils/bengali';

interface LocationAutocompleteProps {
  placeholder?: string;
  initialValue?: string;
  onSelect: (location: LocationItem | null) => void;
  className?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  placeholder = 'এলাকা, ওয়ার্ড বা মোড়ের নাম খুঁজুন (যেমন: সোনাডাঙ্গা, Nirala, Ward 24)...',
  initialValue = '',
  onSelect,
  className = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      onSelect(null);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const data = await locationService.searchLocations(searchQuery);
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  const handleSelect = (item: LocationItem) => {
    setQuery(item.nameBn);
    setIsOpen(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSelect(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getTypeBadge = (type: string, ward: number | null) => {
    if (ward) return `ওয়ার্ড ${bn(ward)}`;
    if (type === 'area') return 'আবাসিক এলাকা';
    if (type === 'landmark') return 'মোড় / ল্যান্ডমার্ক';
    if (type === 'city') return 'সিটি / জেলা';
    return 'এলাকা';
  };

  return (
    <div className={`location-autocomplete-container ${className}`} ref={containerRef} style={{ position: 'relative' }}>
      <div className="autocomplete-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <MapPin
          size={18}
          color="var(--g)"
          style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
        />

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          style={{
            paddingLeft: '38px',
            paddingRight: query ? '34px' : '12px',
          }}
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />

        {isLoading && (
          <Loader2
            size={16}
            className="animate-spin"
            style={{ position: 'absolute', right: '12px', color: 'var(--mute)' }}
          />
        )}

        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--mute)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
            title="মুছুন"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          className="autocomplete-dropdown"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 9999,
            listStyle: 'none',
            margin: 0,
            padding: '6px 0',
          }}
        >
          {results.map((item, idx) => (
            <li
              key={item.id}
              role="option"
              aria-selected={idx === selectedIndex}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: idx === selectedIndex ? 'var(--gt)' : 'transparent',
                borderBottom: '1px solid var(--line)',
                transition: 'var(--transition)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{item.nameBn}</div>
                <div style={{ fontSize: '12px', color: 'var(--mute)' }}>{item.nameEn}</div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--gt)',
                  color: 'var(--g)',
                  whiteSpace: 'nowrap',
                }}
              >
                {getTypeBadge(item.type, item.ward)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
