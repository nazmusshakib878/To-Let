import React from 'react';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetView: () => void;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isFullscreen,
  onToggleFullscreen,
  onResetView,
  className = '',
}) => {
  return (
    <div
      className={`map-floating-controls ${className}`}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <button
        type="button"
        onClick={onResetView}
        className="map-control-btn"
        title="খুলনা সিটিতে রিসেট করুন"
        aria-label="খুলনা সিটিতে রিসেট করুন"
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--fg, #111827)',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RotateCcw size={16} />
      </button>

      <button
        type="button"
        onClick={onToggleFullscreen}
        className="map-control-btn"
        title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ করুন' : 'ম্যাপ ফুলস্ক্রিন করুন'}
        aria-label={isFullscreen ? 'ফুলস্ক্রিন বন্ধ করুন' : 'ম্যাপ ফুলস্ক্রিন করুন'}
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--fg, #111827)',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </div>
  );
};
