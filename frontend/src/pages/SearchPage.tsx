import React, { useState, useEffect } from 'react';
import { Listing, ListingFilterQuery } from '../types/listing';
import { MapViewMode, LocationItem } from '../types/location';
import { ListingFilter } from '../components/listings/ListingFilter';
import { ListingSortBar } from '../components/listings/ListingSortBar';
import { ListingList } from '../components/listings/ListingList';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { MapViewToggle } from '../components/map/MapViewToggle';
import { KhulnaMap } from '../components/map/KhulnaMap';
import { ListingCard } from '../components/listings/ListingCard';
import { listingService } from '../services/listingService';

interface SearchPageProps {
  listings: Listing[];
  filters: ListingFilterQuery;
  isLoading: boolean;
  error: string | null;
  onSearch: (filters: ListingFilterQuery) => void;
  onReset: () => void;
  onSortChange: (sort: 'rent' | 'new') => void;
  onRetry: () => void;
  isMyListing: (id: number) => boolean;
  getDeletionToken: (id: number) => string | undefined;
  removeOwnership: (id: number) => void;
  showToast: (msg: string) => void;
  refetchListings: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  listings,
  filters,
  isLoading,
  error,
  onSearch,
  onReset,
  onSortChange,
  onRetry,
  isMyListing,
  getDeletionToken,
  removeOwnership,
  showToast,
  refetchListings,
}) => {
  const [viewMode, setViewMode] = useState<MapViewMode>(() => {
    return window.innerWidth >= 860 ? 'split' : 'list';
  });

  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [flyToCoordinates, setFlyToCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Responsive viewMode adjustment on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 860 && viewMode === 'split') {
        setViewMode('list');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const handleCopyPhone = (phone: string) => {
    try {
      navigator.clipboard.writeText(phone).then(
        () => showToast('নম্বর কপি হয়েছে'),
        () => showToast(`নম্বর: ${phone}`)
      );
    } catch {
      showToast(`নম্বর: ${phone}`);
    }
  };

  const handleLocationSelect = (loc: LocationItem | null) => {
    if (loc && loc.latitude && loc.longitude) {
      setFlyToCoordinates({ lat: loc.latitude, lng: loc.longitude });
    }
  };

  const handleSelectListingFromMap = (listing: Listing) => {
    setSelectedListingId(listing.id);

    // Scroll to listing card if in split or list view
    if (viewMode !== 'map') {
      const cardEl = document.getElementById(`listing-${listing.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleDeleteRequest = (listing: Listing) => {
    setDeletingListing(listing);
  };

  const handleToggleRented = async (listing: Listing) => {
    const token = getDeletionToken(listing.id);
    if (!token) {
      showToast('অননুমোদিত: এই পোস্ট পরিবর্তনের সিক্রেট টোকেন নেই');
      return;
    }

    try {
      const updated = await listingService.toggleRented(listing.id, token, !listing.isRented);
      showToast(
        updated.isRented
          ? 'বিজ্ঞাপনটি "ভাড়া সম্পন্ন" চিহ্নিত করা হয়েছে'
          : 'বিজ্ঞাপনটি পুনরায় "উপলভ্য" করা হয়েছে'
      );
      refetchListings();
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const handleRenewListing = async (listing: Listing) => {
    const token = getDeletionToken(listing.id);
    if (!token) {
      showToast('অননুমোদিত: এই পোস্ট নবায়নের সিক্রেট টোকেন নেই');
      return;
    }

    try {
      await listingService.renewListing(listing.id, token);
      showToast('বিজ্ঞাপনের মেয়াদ সফলভাবে আরো ৩০ দিন বৃদ্ধি করা হয়েছে!');
      refetchListings();
    } catch (err: any) {
      showToast(err.message || 'বিজ্ঞাপন নবায়ন করতে সমস্যা হয়েছে');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingListing) return;

    const token = getDeletionToken(deletingListing.id);
    if (!token) {
      showToast('অননুমোদিত: এই পোস্ট মুছে ফেলার টোকেন পাওয়া যায়নি');
      setDeletingListing(null);
      return;
    }

    setIsDeleting(true);
    try {
      await listingService.deleteListing(deletingListing.id, token);
      removeOwnership(deletingListing.id);
      showToast('পোস্ট মুছে ফেলা হয়েছে');
      refetchListings();
    } catch (err: any) {
      showToast(err?.message || 'পোস্ট মুছতে ব্যর্থ হয়েছে');
    } finally {
      setIsDeleting(false);
      setDeletingListing(null);
    }
  };

  const selectedListing = listings.find((l) => l.id === selectedListingId);

  return (
    <section id="find" role="tabpanel" aria-labelledby="t1">
      <ListingFilter
        filters={filters}
        onSearch={onSearch}
        onReset={() => {
          onReset();
          setFlyToCoordinates(null);
          setSelectedListingId(null);
        }}
        onLocationSelect={handleLocationSelect}
      />

      <div
        className="search-controls-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          margin: '20px 0 14px',
        }}
      >
        <ListingSortBar
          count={listings.length}
          currentSort={filters.sort || 'rent'}
          onSortChange={onSortChange}
        />

        <MapViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* VIEW MODES */}
      {viewMode === 'split' && (
        <div
          className="split-view-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Listings */}
          <div className="split-listings-col">
            <ListingList
              listings={listings}
              isLoading={isLoading}
              error={error}
              onRetry={onRetry}
              isMyListing={isMyListing}
              onCopyPhone={handleCopyPhone}
              onDeleteRequest={handleDeleteRequest}
              onToggleRented={handleToggleRented}
              onRenewListing={handleRenewListing}
              onShowToast={showToast}
            />
          </div>

          {/* Right Column: Interactive Map (Sticky) */}
          <div
            className="split-map-col"
            style={{
              position: 'sticky',
              top: '20px',
            }}
          >
            <KhulnaMap
              listings={listings}
              selectedListingId={selectedListingId}
              onSelectListing={handleSelectListingFromMap}
              flyToCoordinates={flyToCoordinates}
              height="620px"
            />
          </div>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="map-view-container" style={{ position: 'relative' }}>
          <KhulnaMap
            listings={listings}
            selectedListingId={selectedListingId}
            onSelectListing={handleSelectListingFromMap}
            flyToCoordinates={flyToCoordinates}
            height="580px"
          />

          {/* Bottom Selected Property Card Overlay on Map Mode */}
          {selectedListing && (
            <div
              className="map-selected-card-overlay"
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                maxWidth: '560px',
                margin: '0 auto',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <ListingCard
                listing={selectedListing}
                isOwner={isMyListing(selectedListing.id)}
                onCopyPhone={handleCopyPhone}
                onDeleteRequest={handleDeleteRequest}
                onToggleRented={handleToggleRented}
                onRenewListing={handleRenewListing}
                onShowToast={showToast}
              />
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="list-view-container">
          <ListingList
            listings={listings}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            isMyListing={isMyListing}
            onCopyPhone={handleCopyPhone}
            onDeleteRequest={handleDeleteRequest}
            onToggleRented={handleToggleRented}
            onRenewListing={handleRenewListing}
            onShowToast={showToast}
          />
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deletingListing)}
        listingTitle={deletingListing ? `${deletingListing.loc} (${deletingListing.name})` : ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingListing(null)}
      />
    </section>
  );
};
