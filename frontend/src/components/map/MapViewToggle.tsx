import React from 'react';
import { List, Map, Columns2 } from 'lucide-react';
import { MapViewMode } from '../../types/location';

interface MapViewToggleProps {
  viewMode: MapViewMode;
  onViewModeChange: (mode: MapViewMode) => void;
}

export const MapViewToggle: React.FC<MapViewToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div
      className="map-view-toggle"
      role="radiogroup"
      aria-label="ভিউ মোড নির্বাচন করুন"
      style={{
        display: 'inline-flex',
        background: 'var(--gt)',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        gap: '4px',
      }}
    >
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'list'}
        onClick={() => onViewModeChange('list')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: 600,
          background: viewMode === 'list' ? 'var(--g)' : 'transparent',
          color: viewMode === 'list' ? 'var(--on)' : 'var(--ink)',
          boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
          transition: 'var(--transition)',
        }}
        title="শুধু তালিকা দেখুন"
      >
        <List size={15} />
        <span>তালিকা ভিউ</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'map'}
        onClick={() => onViewModeChange('map')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: 600,
          background: viewMode === 'map' ? 'var(--g)' : 'transparent',
          color: viewMode === 'map' ? 'var(--on)' : 'var(--ink)',
          boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none',
          transition: 'var(--transition)',
        }}
        title="শুধু ম্যাপ দেখুন"
      >
        <Map size={15} />
        <span>ম্যাপ ভিউ</span>
      </button>

      <button
        type="button"
        className="split-view-button"
        role="radio"
        aria-checked={viewMode === 'split'}
        onClick={() => onViewModeChange('split')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: 600,
          background: viewMode === 'split' ? 'var(--g)' : 'transparent',
          color: viewMode === 'split' ? 'var(--on)' : 'var(--ink)',
          boxShadow: viewMode === 'split' ? 'var(--shadow-sm)' : 'none',
          transition: 'var(--transition)',
        }}
        title="তালিকা ও ম্যাপ পাশাপাশি দেখুন"
      >
        <Columns2 size={15} />
        <span>স্প্লিট ভিউ</span>
      </button>
    </div>
  );
};
