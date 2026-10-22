import React from 'react';
import { Phone, Copy, Trash2, MapPin, Check } from 'lucide-react';
import { Listing } from '../../types/listing';
import { bn, formatRent } from '../../utils/bengali';
import { TENANT_TYPE_LABELS } from '../../constants/areas';
import { ph } from '../../utils/placeholder';

interface ListingCardProps {
  listing: Listing;
  isOwner: boolean;
  onCopyPhone: (phone: string) => void;
  onDeleteRequest: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isOwner,
  onCopyPhone,
  onDeleteRequest,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopyPhone(listing.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const imageSrc =
    listing.imageUrl ||
    listing.photo ||
    ph(listing.cardColor || '#7fb5a0');

  const tenantLabel = TENANT_TYPE_LABELS[listing.type] || listing.type;

  return (
    <article className="card animate-fade-in" id={`listing-${listing.id}`}>
      <div className="card-media">
        <img
          src={imageSrc}
          alt={`রুমের ছবি - ${listing.loc}`}
          loading="lazy"
          onError={(e) => {
            // Fallback to placeholder if uploaded image is missing
            (e.target as HTMLImageElement).src = ph(listing.cardColor || '#7fb5a0');
          }}
        />
        {listing.isDemo && <span className="card-badge">নমুনা বিজ্ঞাপন</span>}
      </div>

      <div className="body">
        <div className="price">
          {formatRent(listing.rent)} <small>/ মাস</small>
        </div>

        <p className="loc">
          <MapPin size={16} color="var(--g)" />
          {listing.loc}
        </p>

        <p className="addr">{listing.addr}</p>

        <div className="tags">
          <span className="tag">{bn(listing.rooms)} রুম</span>
          <span className="tag">{bn(listing.floor)} তলা</span>
          <span className="tag">সর্বোচ্চ {bn(listing.max)} জন</span>
          <span className="tag y">{tenantLabel}</span>
        </div>

        {listing.rules && listing.rules.length > 0 && (
          <ul className="rules">
            {listing.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        )}

        <div className="action-row">
          <a className="call" href={`tel:${listing.phone}`}>
            <Phone size={15} />
            কল করুন {listing.phone}
          </a>

          <button
            type="button"
            className="cp"
            onClick={handleCopy}
            title="ফোন নম্বর ক্লিপবোর্ডে কপি করুন"
          >
            {copied ? <Check size={15} color="var(--g)" /> : <Copy size={15} />}
            <span>{copied ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
          </button>

          <span className="owner">মালিক: {listing.name}</span>

          {isOwner && (
            <button
              type="button"
              className="del"
              onClick={() => onDeleteRequest(listing)}
              title="আমার তৈরি করা বিজ্ঞাপনটি মুছুন"
            >
              <Trash2 size={14} />
              আমার পোস্ট মুছুন
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
