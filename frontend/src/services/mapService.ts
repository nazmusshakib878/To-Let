import L from 'leaflet';
import { formatRent } from '../utils/bengali';
import { MapCoordinates } from '../types/location';

export const KHULNA_CENTER: MapCoordinates = {
  lat: 22.8456,
  lng: 89.5403,
};

export const DEFAULT_MAP_ZOOM = 13;
export const DETAIL_MAP_ZOOM = 15;

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

/**
 * Creates a custom SVG DivIcon for a rental property marker with price badge.
 */
export function createPropertyMarkerIcon(rent: number, isSelected = false): L.DivIcon {
  const pinColor = isSelected ? '#e9a23b' : '#1f6f54';
  const shadowColor = isSelected ? 'rgba(233, 162, 59, 0.45)' : 'rgba(31, 111, 84, 0.35)';
  const formattedPrice = formatRent(rent);

  const html = `
    <div class="custom-map-marker ${isSelected ? 'marker-selected' : ''}" style="
      position: relative;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      filter: drop-shadow(0 3px 6px ${shadowColor});
    ">
      <div style="
        background: ${pinColor};
        color: #ffffff;
        font-family: 'Hind Siliguri', sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 99px;
        white-space: nowrap;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        gap: 3px;
        margin-bottom: -4px;
        z-index: 2;
      ">
        <span>${formattedPrice}</span>
      </div>
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="z-index: 1;">
        <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 34 14 34C14 34 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
        <path d="M8 14.5L14 9.5L20 14.5V20H16V16H12V20H8V14.5Z" fill="#ffffff"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'leaflet-property-icon-wrapper',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -36],
  });
}

/**
 * Creates a draggable pin icon for the interactive Location Picker in the post form.
 */
export function createPickerMarkerIcon(isApproximate = false): L.DivIcon {
  const pinColor = isApproximate ? '#e9a23b' : '#0284c7';
  const label = isApproximate ? 'আনুমানিক পিন' : 'বাসার অবস্থান';

  const html = `
    <div style="
      position: relative;
      cursor: grab;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    ">
      <div style="
        background: ${pinColor};
        color: #fff;
        font-family: 'Hind Siliguri', sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 99px;
        margin-bottom: -3px;
        border: 1.5px solid #fff;
        white-space: nowrap;
        z-index: 2;
      ">
        ${label}
      </div>
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="${pinColor}" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="16" cy="15" r="5" fill="#ffffff"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'leaflet-picker-icon-wrapper',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
