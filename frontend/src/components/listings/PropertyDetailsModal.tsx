import React from 'react';
import {
  X,
  MapPin,
  Phone,
  Copy,
  Share2,
  AlertTriangle,
  CheckCircle,
  Home,
  Users,
  Shield,
  Layers,
  Clock,
  Edit,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { Listing } from '../../types/listing';
import { bn, formatRent } from '../../utils/bengali';
import { TENANT_TYPE_LABELS } from '../../constants/areas';
import { ph } from '../../utils/placeholder';
import { getWhatsAppListingUrl } from '../../utils/whatsapp';
import { getFullAssetUrl } from '../../services/api';

interface PropertyDetailsModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  onCopyPhone: (phone: string) => void;
  onOpenReport: (listing: Listing) => void;
  onOpenEdit?: (listing: Listing) => void;
  onToggleRented?: (listing: Listing) => void;
  onRenewListing?: (listing: Listing) => void;
  onDeleteRequest?: (listing: Listing) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  listing,
  isOpen,
  onClose,
  isOwner,
  onCopyPhone,
  onOpenReport,
  onOpenEdit,
  onToggleRented,
  onRenewListing,
  onDeleteRequest,
  onShowToast,
}) => {
  if (!isOpen || !listing) return null;

  const imageSrc =
    getFullAssetUrl(listing.imageUrl || listing.photo) ||
    ph(listing.cardColor || '#7fb5a0');

  const tenantLabel = TENANT_TYPE_LABELS[listing.type] || listing.type;
  const whatsappUrl = getWhatsAppListingUrl(listing);

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
        // user cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      if (onShowToast) onShowToast('বিজ্ঞাপনের লিংক ক্লিপবোর্ডে কপি হয়েছে!', 'success');
    } catch {
      if (onShowToast) onShowToast('লিংক কপি করতে ব্যর্থ হয়েছে', 'error');
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-details-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 21, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Cover Image & Header Controls */}
        <div style={{ position: 'relative', width: '100%', height: '280px', background: 'var(--gt)' }}>
          <img
            src={imageSrc}
            alt={`বাসার ছবি - ${listing.loc}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = ph(listing.cardColor || '#7fb5a0');
            }}
          />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
            }}
          >
            <X size={20} />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="শেয়ার করুন"
            title="বিজ্ঞাপন শেয়ার করুন"
            style={{
              position: 'absolute',
              top: '12px',
              right: '56px',
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
            }}
          >
            <Share2 size={18} />
          </button>

          {/* Status Badges */}
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '8px' }}>
            {listing.isRented && (
              <span
                style={{
                  background: '#475569',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                ✓ ভাড়া সম্পন্ন
              </span>
            )}
            {listing.isDemo && !listing.isRented && (
              <span
                style={{
                  background: 'var(--y)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                নমুনা বিজ্ঞাপন
              </span>
            )}
            {listing.isApproximatePin && (
              <span
                style={{
                  background: 'rgba(254, 243, 199, 0.95)',
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Shield size={13} /> গোপনীয় আনুমানিক পিন
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Rent and Location Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2
                id="property-details-title"
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MapPin size={22} color="var(--g)" />
                {listing.loc}
                {listing.ward && (
                  <span style={{ fontSize: '15px', color: 'var(--mute)', fontWeight: 500 }}>
                    (কেসিসি ওয়ার্ড {bn(listing.ward)})
                  </span>
                )}
              </h2>
              <p style={{ margin: 0, color: 'var(--mute)', fontSize: '15px' }}>
                {listing.addr}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--g)' }}>
                {formatRent(listing.rent)} <small style={{ fontSize: '14px', color: 'var(--mute)', fontWeight: 500 }}>/ মাস</small>
              </div>
              {typeof listing.daysRemaining === 'number' && (
                <div style={{ fontSize: '12px', color: listing.daysRemaining <= 5 ? '#dc2626' : 'var(--mute)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                  <Clock size={12} />
                  মেয়াদ আর {bn(listing.daysRemaining)} দিন
                </div>
              )}
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              margin: '20px 0',
              padding: '16px',
              background: 'var(--gt)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--mute)', display: 'block' }}>রুম সংখ্যা</span>
              <strong style={{ fontSize: '16px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Home size={16} color="var(--g)" /> {bn(listing.rooms)} রুম
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--mute)', display: 'block' }}>তলা / ফ্লোর</span>
              <strong style={{ fontSize: '16px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="var(--g)" /> {bn(listing.floor)} তলা
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--mute)', display: 'block' }}>সর্বোচ্চ সদস্য</span>
              <strong style={{ fontSize: '16px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="var(--g)" /> {bn(listing.max)} জন
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--mute)', display: 'block' }}>ভাড়াটিয়া ধরন</span>
              <strong style={{ fontSize: '16px', color: 'var(--g)' }}>
                {tenantLabel}
              </strong>
            </div>
          </div>

          {/* House Rules */}
          {listing.rules && listing.rules.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--ink)' }}>
                বাসার নিয়মাবলি ও শর্তসমূহ:
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--ink)', fontSize: '14px', lineHeight: 1.8 }}>
                {listing.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Privacy & Geographic Note */}
          {listing.isApproximatePin && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: '#fef3c7',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #fde68a',
                fontSize: '13px',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Shield size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>মালিকের গোপনীয়তা সংরক্ষিত:</strong> বাড়িওয়ালার অনুরোধে ম্যাপে বাসার সঠিক পিনের পরিবর্তে সংশ্লিষ্ট এলাকার আনুমানিক পিন প্রদর্শন করা হয়েছে।
              </div>
            </div>
          )}

          {/* Contact Actions Row */}
          <div
            style={{
              padding: '16px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--mute)' }}>বাড়িওয়ালার নাম</span>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>{listing.name}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--mute)' }}>পোস্টের তারিখ</span>
                <div style={{ fontSize: '13px', color: 'var(--ink)' }}>
                  {new Date(listing.createdAt).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={`tel:${listing.phone}`}
                className="btn"
                style={{
                  flex: '1 1 180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  background: 'var(--g)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                }}
              >
                <Phone size={18} />
                কল করুন {listing.phone}
              </a>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: '1 1 150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    background: '#25D366',
                    color: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.133.562 4.135 1.545 5.867l-1.645 6.009 6.177-1.62c1.716.945 3.684 1.488 5.777 1.488 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                className="btn ghost"
                onClick={() => onCopyPhone(listing.phone)}
                style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Copy size={16} />
                <span>নম্বর কপি</span>
              </button>
            </div>
          </div>

          {/* Footer Control: Owner Management & Abuse Report */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => onOpenReport(listing)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mute)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <AlertTriangle size={15} color="#dc2626" />
              <span>ভুয়া বা ভুল বিজ্ঞাপন রিপোর্ট করুন</span>
            </button>

            {isOwner && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {onOpenEdit && (
                  <button
                    type="button"
                    onClick={() => onOpenEdit(listing)}
                    className="btn ghost"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    <Edit size={14} />
                    <span>এডিট করুন</span>
                  </button>
                )}

                {onToggleRented && (
                  <button
                    type="button"
                    onClick={() => onToggleRented(listing)}
                    style={{
                      background: listing.isRented ? '#1f6f54' : '#f1f5f9',
                      color: listing.isRented ? '#ffffff' : '#334155',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {listing.isRented ? 'পুনরায় খালি করুন' : 'ভাড়া সম্পন্ন'}
                  </button>
                )}

                {onRenewListing && (
                  <button
                    type="button"
                    onClick={() => onRenewListing(listing)}
                    style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="বিজ্ঞাপনের মেয়াদ আরো ৩০ দিন বৃদ্ধি করুন"
                  >
                    <RotateCw size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    নবায়ন
                  </button>
                )}

                {onDeleteRequest && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDeleteRequest(listing);
                    }}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="বিজ্ঞাপনটি মুছে ফেলুন"
                  >
                    <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    মুছুন
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
