import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Check, X, Shield, Crosshair } from 'lucide-react';
import {
  KHULNA_CENTER,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  createPickerMarkerIcon,
} from '../../services/mapService';
import { LocationAutocomplete } from '../location/LocationAutocomplete';
import { LocationItem } from '../../types/location';

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialApproximate?: boolean;
  onConfirm: (result: {
    latitude: number;
    longitude: number;
    isApproximatePin: boolean;
    locationName?: string;
    ward?: number;
    locationId?: number;
  }) => void;
  onCancel: () => void;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialLat = KHULNA_CENTER.lat,
  initialLng = KHULNA_CENTER.lng,
  initialApproximate = false,
  onConfirm,
  onCancel,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [isApproximate, setIsApproximate] = useState<boolean>(initialApproximate);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(OSM_TILE_URL, {
      maxZoom: 19,
      attribution: OSM_ATTRIBUTION,
    }).addTo(map);

    // Draggable Picker Marker
    const marker = L.marker([coords.lat, coords.lng], {
      draggable: true,
      icon: createPickerMarkerIcon(isApproximate),
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCoords({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) });
    });

    // Tap/Click on Map to Move Marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const cleanLat = parseFloat(lat.toFixed(6));
      const cleanLng = parseFloat(lng.toFixed(6));
      marker.setLatLng([cleanLat, cleanLng]);
      setCoords({ lat: cleanLat, lng: cleanLng });
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker icon if isApproximate changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createPickerMarkerIcon(isApproximate));
    }
  }, [isApproximate]);

  const handleAutocompleteSelect = (loc: LocationItem | null) => {
    if (!loc) return;
    setSelectedLocation(loc);

    if (loc.latitude && loc.longitude && mapInstanceRef.current && markerRef.current) {
      const targetLat = loc.latitude;
      const targetLng = loc.longitude;
      mapInstanceRef.current.flyTo([targetLat, targetLng], 15);
      markerRef.current.setLatLng([targetLat, targetLng]);
      setCoords({ lat: targetLat, lng: targetLng });
    }
  };

  const handleConfirm = () => {
    onConfirm({
      latitude: coords.lat,
      longitude: coords.lng,
      isApproximatePin: isApproximate,
      locationName: selectedLocation?.nameBn,
      ward: selectedLocation?.ward ?? undefined,
      locationId: selectedLocation?.id ?? undefined,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onCancel} style={{ zIndex: 99999 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          padding: '20px',
          width: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--g)" />
              ম্যাপে বাসার অবস্থান নির্ধারণ করুন
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
              ম্যাপে ক্লিক করে বা পিনটি টেনে নিয়ে সঠিক অবস্থানে বসান
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--mute)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar inside picker */}
        <div style={{ marginBottom: '12px' }}>
          <LocationAutocomplete
            placeholder="এলাকা বা মোড় খুঁজে সরাসরি পিন নিয়ে যান..."
            onSelect={handleAutocompleteSelect}
          />
        </div>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '350px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--line)',
            position: 'relative',
          }}
        />

        {/* Coordinates and Privacy Settings */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'var(--gt)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Crosshair size={16} color="var(--g)" />
            <span>
              অক্ষাংশ (Lat): <strong>{coords.lat}</strong>, দ্রাঘিমাংশ (Lng): <strong>{coords.lng}</strong>
            </span>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              margin: 0,
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={isApproximate}
              onChange={(e) => setIsApproximate(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            <Shield size={14} color="var(--y)" />
            <span>গোপনীয়তার জন্য আনুমানিক পিন দেখান</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button type="button" className="btn ghost" onClick={onCancel}>
            বাতিল
          </button>
          <button type="button" className="btn" onClick={handleConfirm}>
            <Check size={16} />
            অবস্থান নিশ্চিত করুন
          </button>
        </div>
      </div>
    </div>
  );
};
