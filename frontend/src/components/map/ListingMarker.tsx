import L from 'leaflet';
import { Listing } from '../../types/listing';
import { createPropertyMarkerIcon } from '../../services/mapService';
import { bn, formatRent } from '../../utils/bengali';
import { TENANT_TYPE_LABELS } from '../../constants/areas';
import { ph } from '../../utils/placeholder';
import { getWhatsAppListingUrl } from '../../utils/whatsapp';

export interface CreateListingMarkerOptions {
  listing: Listing;
  isSelected?: boolean;
  onSelect?: (listing: Listing) => void;
  onViewDetails?: (listing: Listing) => void;
}

/**
 * Creates a Leaflet Marker for a rental property with custom price tag and popup.
 */
export function createListingMarker({
  listing,
  isSelected = false,
  onSelect,
  onViewDetails,
}: CreateListingMarkerOptions): L.Marker | null {
  if (typeof listing.latitude !== 'number' || typeof listing.longitude !== 'number') {
    return null;
  }

  const icon = createPropertyMarkerIcon(listing.rent, isSelected, Boolean(listing.isRented));
  const marker = L.marker([listing.latitude, listing.longitude], {
    icon,
    title: `${listing.loc} - ${formatRent(listing.rent)}`,
    riseOnHover: true,
  });

  const imageSrc =
    listing.imageUrl || listing.photo || ph(listing.cardColor || '#7fb5a0');
  const tenantLabel = TENANT_TYPE_LABELS[listing.type] || listing.type;
  const isApproximate = listing.isApproximatePin;
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
      ${isApproximate ? `
        <div style="font-size: 11px; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px; margin-bottom: 8px; display: inline-block;">
          📍 আনুমানিক এলাকা পিন
        </div>
      ` : ''}

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
    if (onSelect) onSelect(listing);
    const btn = document.getElementById(`popup-btn-${listing.id}`);
    if (btn) {
      btn.onclick = () => {
        if (onViewDetails) onViewDetails(listing);
      };
    }
  });

  return marker;
}
