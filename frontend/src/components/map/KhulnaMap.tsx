import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2, RotateCcw, Layers } from 'lucide-react';
import { Listing } from '../../types/listing';
import {
  KHULNA_CENTER,
  DEFAULT_MAP_ZOOM,
  DETAIL_MAP_ZOOM,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  createPropertyMarkerIcon,
} from '../../services/mapService';
import { bn, formatRent } from '../../utils/bengali';
import { TENANT_TYPE_LABELS } from '../../constants/areas';
import { ph } from '../../utils/placeholder';
import { getWhatsAppListingUrl } from '../../utils/whatsapp';

interface KhulnaMapProps {
  listings: Listing[];
  selectedListingId?: number | null;
  onSelectListing?: (listing: Listing) => void;
  flyToCoordinates?: { lat: number; lng: number } | null;
  className?: string;
  height?: string;
}

export const KhulnaMap: React.FC<KhulnaMapProps> = ({
  listings,
  selectedListingId,
  onSelectListing,
  flyToCoordinates,
  className = '',
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [KHULNA_CENTER.lat, KHULNA_CENTER.lng],
        zoom: DEFAULT_MAP_ZOOM,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Attribution at bottom left
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution(OSM_ATTRIBUTION)
        .addTo(map);

      // Tile Layer with error handling
      const tileLayer = L.tileLayer(OSM_TILE_URL, {
        maxZoom: 19,
        attribution: OSM_ATTRIBUTION,
      });

      tileLayer.on('tileerror', () => {
        // Tile error fallback
      });

      tileLayer.addTo(map);

      // Markers Layer Group
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Invalidate size on initial mount
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (err: any) {
      console.error('Failed to initialize map:', err);
      setMapError('ম্যাপ লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers with Listings
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const geoListings = listings.filter(
      (item) => typeof item.latitude === 'number' && typeof item.longitude === 'number'
    );

    geoListings.forEach((listing) => {
      const isSelected = listing.id === selectedListingId;
      const icon = createPropertyMarkerIcon(listing.rent, isSelected, Boolean(listing.isRented));

      const marker = L.marker([listing.latitude!, listing.longitude!], {
        icon,
        title: `${listing.loc} - ${formatRent(listing.rent)}`,
      });

      // Popup Content
      const imageSrc =
        listing.imageUrl || listing.photo || ph(listing.cardColor || '#7fb5a0');
      const tenantLabel = TENANT_TYPE_LABELS[listing.type] || listing.type;
      const whatsappUrl = getWhatsAppListingUrl(listing);

      const popupHtml = `
        <div style="font-family: 'Hind Siliguri', sans-serif; width: 230px; padding: 2px;">
          <div style="position: relative; width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: var(--gt);">
            <img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="বাসার ছবি" />
            ${listing.isRented ? `
              <div style="
                position: absolute;
                top: 6px;
                left: 6px;
                background: #475569;
                color: #ffffff;
                padding: 2px 7px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 700;
              ">
                ✓ ভাড়া সম্পন্ন
              </div>
            ` : ''}
          </div>
          <div style="font-size: 18px; font-weight: 700; color: #1f6f54; margin-bottom: 2px;">
            ${formatRent(listing.rent)} <small style="font-size: 12px; font-weight: 500; color: #5b6b66;">/ মাস</small>
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #14231f; margin-bottom: 2px;">
            📍 ${listing.loc} ${listing.ward ? `(ওয়ার্ড ${bn(listing.ward)})` : ''}
          </div>
          <div style="font-size: 12px; color: #5b6b66; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${listing.addr}
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
            <span style="background: #e3f1ec; color: #1f6f54; border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600;">
              ${bn(listing.rooms)} রুম
            </span>
            <span style="background: #e3f1ec; color: #1f6f54; border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600;">
              ${bn(listing.floor)} তলা
            </span>
            <span style="background: #fbefd6; color: #7a4e00; border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600;">
              ${tenantLabel}
            </span>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 6px;">
            ${whatsappUrl ? `
              <a
                href="${whatsappUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  flex: 1;
                  background: #25D366;
                  color: #ffffff;
                  text-decoration: none;
                  font-family: inherit;
                  font-weight: 700;
                  font-size: 12px;
                  padding: 6px 8px;
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                "
              >
                WhatsApp
              </a>
            ` : ''}
            <button
              id="popup-btn-${listing.id}"
              style="
                flex: 1;
                background: #1f6f54;
                color: #ffffff;
                border: none;
                font-family: inherit;
                font-weight: 700;
                font-size: 12px;
                padding: 6px 8px;
                border-radius: 6px;
                cursor: pointer;
              "
            >
              বিস্তারিত
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        className: 'custom-leaflet-popup',
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${listing.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectListing) {
              onSelectListing(listing);
            }
          };
        }
      });

      marker.on('click', () => {
        if (onSelectListing) {
          onSelectListing(listing);
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [listings, selectedListingId, onSelectListing]);

  // Fly to selected listing or coordinate
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (flyToCoordinates) {
      map.flyTo([flyToCoordinates.lat, flyToCoordinates.lng], DETAIL_MAP_ZOOM, {
        duration: 1.2,
      });
      return;
    }

    if (selectedListingId) {
      const target = listings.find((l) => l.id === selectedListingId);
      if (target?.latitude && target?.longitude) {
        map.flyTo([target.latitude, target.longitude], DETAIL_MAP_ZOOM, {
          duration: 1.2,
        });
      }
    }
  }, [selectedListingId, flyToCoordinates, listings]);

  const handleResetPosition = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([KHULNA_CENTER.lat, KHULNA_CENTER.lng], DEFAULT_MAP_ZOOM, {
        duration: 1,
      });
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
      return next;
    });
  };

  if (mapError) {
    return (
      <div
        className="empty"
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{mapError}</p>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setMapError(null);
            mapInstanceRef.current?.invalidateSize();
          }}
        >
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div
      className={`khulna-map-wrapper ${isFullscreen ? 'map-fullscreen-active' : ''} ${className}`}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : height,
        zIndex: isFullscreen ? 99999 : 1,
        borderRadius: isFullscreen ? 0 : 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--line)',
        backgroundColor: 'var(--card)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Map Control Bar Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          zIndex: 1000,
        }}
      >
        <button
          type="button"
          onClick={handleResetPosition}
          className="btn"
          style={{
            background: 'var(--card)',
            color: 'var(--ink)',
            padding: '8px 12px',
            fontSize: '12px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="খুলনা সিটিতে ম্যাপ রিসেট করুন"
        >
          <RotateCcw size={14} color="var(--g)" />
          <span>রিসেট ম্যাপ</span>
        </button>

        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="btn"
          style={{
            background: 'var(--card)',
            color: 'var(--ink)',
            padding: '8px 12px',
            fontSize: '12px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
          }}
          title={isFullscreen ? 'ছোট স্ক্রিনে ফিরুন' : 'ফুলস্ক্রিন ম্যাপ'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Map Information Badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(20, 35, 31, 0.75)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 1000,
        }}
      >
        <Layers size={13} color="#4fbf98" />
        <span>খুলনা সিটি ম্যাপ ({bn(listings.filter((l) => l.latitude && l.longitude).length)}টি পিন)</span>
      </div>
    </div>
  );
};
