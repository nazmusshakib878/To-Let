import React from 'react';
import { Listing } from '../../types/listing';
import { ListingCard } from './ListingCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { Home, RefreshCw } from 'lucide-react';

interface ListingListProps {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isMyListing: (id: number) => boolean;
  onCopyPhone: (phone: string) => void;
  onDeleteRequest: (listing: Listing) => void;
  onToggleRented?: (listing: Listing) => void;
  onRenewListing?: (listing: Listing) => void;
  onViewDetails?: (listing: Listing) => void;
  onEditRequest?: (listing: Listing) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ListingList: React.FC<ListingListProps> = ({
  listings,
  isLoading,
  error,
  onRetry,
  isMyListing,
  onCopyPhone,
  onDeleteRequest,
  onToggleRented,
  onRenewListing,
  onViewDetails,
  onEditRequest,
  onShowToast,
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="empty" style={{ borderColor: 'var(--danger)' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>
        <button type="button" className="btn ghost" onClick={onRetry} style={{ marginTop: '12px' }}>
          <RefreshCw size={16} />
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="empty">
        <Home size={36} color="var(--mute)" style={{ marginBottom: '8px' }} />
        <p style={{ fontWeight: 600, color: 'var(--ink)' }}>মিলছে এমন কোনো বাসা নেই।</p>
        <p>ভাড়ার সীমা বাড়ান অথবা তলা ও রুমের ফিল্টার “যেকোনো” করে আবার খুঁজুন।</p>
      </div>
    );
  }

  return (
    <div className="list" id="list">
      {listings.map((item) => (
        <ListingCard
          key={item.id}
          listing={item}
          isOwner={isMyListing(item.id)}
          onCopyPhone={onCopyPhone}
          onDeleteRequest={onDeleteRequest}
          onToggleRented={onToggleRented}
          onRenewListing={onRenewListing}
          onViewDetails={onViewDetails}
          onEditRequest={onEditRequest}
          onShowToast={onShowToast}
        />
      ))}
    </div>
  );
};
