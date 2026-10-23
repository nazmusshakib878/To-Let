import React, { useState } from 'react';
import {
  Phone,
  Copy,
  Trash2,
  MapPin,
  Check,
  Share2,
  AlertTriangle,
  CheckCircle,
  RotateCw,
  Clock,
  Eye,
  Edit,
} from 'lucide-react';
import { Listing } from '../../types/listing';
import { bn, formatRent } from '../../utils/bengali';
import { TENANT_TYPE_LABELS } from '../../constants/areas';
import { ph } from '../../utils/placeholder';
import { getWhatsAppListingUrl } from '../../utils/whatsapp';
import { getFullAssetUrl } from '../../services/api';
import { ReportModal } from './ReportModal';

interface ListingCardProps {
  listing: Listing;
  isOwner: boolean;
  onCopyPhone: (phone: string) => void;
  onDeleteRequest: (listing: Listing) => void;
  onToggleRented?: (listing: Listing) => void;
  onRenewListing?: (listing: Listing) => void;
  onViewDetails?: (listing: Listing) => void;
  onEditRequest?: (listing: Listing) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isOwner,
  onCopyPhone,
  onDeleteRequest,
  onToggleRented,
  onRenewListing,
  onViewDetails,
  onEditRequest,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleCopy = () => {
    onCopyPhone(listing.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `বাসা ভাড়া — ${listing.loc}`,
      text: `${listing.loc} এ ${bn(listing.rooms)} রুমের বাসা ভাড়া (${formatRent(listing.rent)}/মাস)। সরাসরি বাড়িওয়ালার সাথে যোগাযোগ করুন।`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (onShowToast) {
        onShowToast('বিজ্ঞাপনের লিংক ক্লিপবোর্ডে কপি হয়েছে!', 'success');
      }
    } catch {
      if (onShowToast) {
        onShowToast('লিংক কপি করতে ব্যর্থ হয়েছে', 'error');
      }
    }
  };

  const imageSrc =
    getFullAssetUrl(listing.imageUrl || listing.photo) ||
    ph(listing.cardColor || '#7fb5a0');

  const tenantLabel = TENANT_TYPE_LABELS[listing.type] || listing.type;
  const whatsappUrl = getWhatsAppListingUrl(listing);

  return (
    <>
      <article
        className={`card animate-fade-in ${listing.isRented ? 'card-rented' : ''}`}
        id={`listing-${listing.id}`}
        style={listing.isRented ? { opacity: 0.85, filter: 'grayscale(15%)' } : {}}
      >
        <div className="card-media" style={{ position: 'relative' }}>
          <img
            src={imageSrc}
            alt={`রুমের ছবি - ${listing.loc}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ph(listing.cardColor || '#7fb5a0');
            }}
          />

          {/* Rented status badge */}
          {listing.isRented && (
            <span
              className="card-badge"
              style={{
                background: '#475569',
                color: '#ffffff',
                left: '8px',
                right: 'auto',
                fontWeight: 700,
                letterSpacing: '0.3px',
              }}
            >
              ✓ ভাড়া সম্পন্ন
            </span>
          )}

          {/* Demo badge if applicable */}
          {!listing.isRented && listing.isDemo && (
            <span className="card-badge">নমুনা বিজ্ঞাপন</span>
          )}

          {/* Expired badge if applicable */}
          {listing.isExpired && (
            <span
              className="card-badge"
              style={{
                background: '#dc2626',
                color: '#ffffff',
                left: '8px',
                right: 'auto',
              }}
            >
              মেয়াদ শেষ
            </span>
          )}

          {/* Share button overlay */}
          <button
            type="button"
            onClick={handleShare}
            className="media-share-btn"
            title="বিজ্ঞাপন শেয়ার করুন"
            aria-label="বিজ্ঞাপন শেয়ার করুন"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(4px)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
            }}
          >
            <Share2 size={15} />
          </button>
        </div>

        <div className="body">
          <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="price">
              {formatRent(listing.rent)} <small>/ মাস</small>
            </div>
            {typeof listing.daysRemaining === 'number' && !listing.isExpired && (
              <span
                style={{
                  fontSize: '11px',
                  color: listing.daysRemaining <= 5 ? '#dc2626' : 'var(--mute, #6b7280)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
                title="বিজ্ঞাপনের অবশিষ্ট মেয়াদ"
              >
                <Clock size={12} />
                আর {bn(listing.daysRemaining)} দিন
              </span>
            )}
          </div>

          <p className="loc">
            <MapPin size={16} color="var(--g)" />
            <span>{listing.loc}</span>
            {listing.ward && <small style={{ color: 'var(--mute)' }}> (ওয়ার্ড {bn(listing.ward)})</small>}
          </p>

          <p className="addr">{listing.addr}</p>

          <div className="tags">
            <span className="tag">{bn(listing.rooms)} রুম</span>
            <span className="tag">{bn(listing.floor)} তলা</span>
            <span className="tag">সর্বোচ্চ {bn(listing.max)} জন</span>
            <span className="tag y">{tenantLabel}</span>
            {listing.isApproximatePin && (
              <span className="tag" style={{ background: '#fef3c7', color: '#92400e' }}>
                📍 এলাকা পিন
              </span>
            )}
          </div>

          {listing.rules && listing.rules.length > 0 && (
            <ul className="rules">
              {listing.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          )}

          {/* Primary Action Row: Call & WhatsApp */}
          <div className="action-row" style={{ marginTop: '12px' }}>
            <a className="call" href={`tel:${listing.phone}`}>
              <Phone size={15} />
              কল করুন {listing.phone}
            </a>

            {whatsappUrl && (
              <a
                className="whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp এ সরাসরি কথা বলুন"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  fontWeight: 600,
                  fontSize: '12px',
                  textDecoration: 'none',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.133.562 4.135 1.545 5.867l-1.645 6.009 6.177-1.62c1.716.945 3.684 1.488 5.777 1.488 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              className="cp"
              onClick={handleCopy}
              title="ফোন নম্বর ক্লিপবোর্ডে কপি করুন"
            >
              {copied ? <Check size={15} color="var(--g)" /> : <Copy size={15} />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
            </button>

            {onViewDetails && (
              <button
                type="button"
                className="view-details-btn"
                onClick={() => onViewDetails(listing)}
                title="সম্পূর্ণ বিস্তারিত বিবরণ ও নিয়মাবলি দেখুন"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'var(--gt)',
                  color: 'var(--g)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
              >
                <Eye size={14} />
                <span>বিস্তারিত</span>
              </button>
            )}
          </div>

          {/* Secondary Row: Owner Name, Report button, Owner Management Buttons */}
          <div
            className="secondary-action-row"
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--line, #e5e7eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span className="owner" style={{ fontSize: '12px', color: 'var(--mute)' }}>
              মালিক: {listing.name}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Report button */}
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                title="ভুয়া বা সমস্যাযুক্ত বিজ্ঞাপন রিপোর্ট করুন"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mute, #6b7280)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                }}
              >
                <AlertTriangle size={13} color="#9ca3af" />
                <span>রিপোর্ট</span>
              </button>

              {/* Owner actions: Edit, Toggle Rented, Renew, Delete */}
              {isOwner && (
                <>
                  {onEditRequest && (
                    <button
                      type="button"
                      onClick={() => onEditRequest(listing)}
                      style={{
                        background: '#f8fafc',
                        color: '#334155',
                        border: '1px solid var(--line, #e2e8f0)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="বিজ্ঞাপন সংশোধন বা এডিট করুন"
                    >
                      <Edit size={12} />
                      <span>এডিট</span>
                    </button>
                  )}

                  {onToggleRented && (
                    <button
                      type="button"
                      onClick={() => onToggleRented(listing)}
                      style={{
                        background: listing.isRented ? '#1f6f54' : '#f1f5f9',
                        color: listing.isRented ? '#ffffff' : '#334155',
                        border: '1px solid var(--line, #e2e8f0)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title={listing.isRented ? 'বাসাটি পুনরায় খালি/উপলভ্য করুন' : 'বাসাটি ভাড়া হয়ে গেছে চিহ্নিত করুন'}
                    >
                      <CheckCircle size={12} />
                      <span>{listing.isRented ? 'পুনরায় উপলভ্য করুন' : 'ভাড়া সম্পন্ন'}</span>
                    </button>
                  )}

                  {onRenewListing && (listing.isExpired || (typeof listing.daysRemaining === 'number' && listing.daysRemaining <= 7)) && (
                    <button
                      type="button"
                      onClick={() => onRenewListing(listing)}
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="বিজ্ঞাপনের মেয়াদ আরো ৩০ দিন বৃদ্ধি করুন"
                    >
                      <RotateCw size={12} />
                      <span>নবায়ন (+৩০ দিন)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="del"
                    onClick={() => onDeleteRequest(listing)}
                    title="আমার তৈরি করা বিজ্ঞাপনটি মুছুন"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={13} />
                    <span>মুছুন</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Report Modal */}
      <ReportModal
        listing={listing}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={(msg) => onShowToast && onShowToast(msg, 'success')}
        onError={(msg) => onShowToast && onShowToast(msg, 'error')}
      />
    </>
  );
};
