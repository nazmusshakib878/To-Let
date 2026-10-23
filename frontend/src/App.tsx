import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { NavigationTabs, AppTab } from './components/layout/NavigationTabs';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PostListingPage } from './pages/PostListingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PropertyDetailsModal } from './components/listings/PropertyDetailsModal';
import { EditListingModal } from './components/forms/EditListingModal';
import { ReportModal } from './components/listings/ReportModal';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { useListings } from './hooks/useListings';
import { useMyListings } from './hooks/useMyListings';
import { useToast } from './hooks/useToast';
import { Listing, ListingFilterQuery } from './types/listing';
import { listingService } from './services/listingService';
import './styles/globals.css';
import './styles/components.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const {
    listings,
    filters,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    refetch,
    setFilters,
  } = useListings();

  const { saveOwnership, removeOwnership, isMyListing, getDeletionToken } = useMyListings();
  const { toastMessage, showToast } = useToast();

  // Global modals state
  const [detailsListing, setDetailsListing] = useState<Listing | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [reportingListing, setReportingListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handlePostSuccess = (listingId: number, deletionToken: string) => {
    saveOwnership(listingId, deletionToken);
    showToast('বিজ্ঞাপন সফলভাবে প্রকাশিত হয়েছে!');
    resetFilters();
    refetch();
    setActiveTab('search');
  };

  const handleSortChange = (sort: 'rent' | 'new') => {
    updateFilters({ sort });
  };

  const handleCopyPhone = (phone: string) => {
    try {
      navigator.clipboard.writeText(phone).then(
        () => showToast('ফোন নম্বর কপি হয়েছে'),
        () => showToast(`নম্বর: ${phone}`)
      );
    } catch {
      showToast(`নম্বর: ${phone}`);
    }
  };

  const handleToggleRented = async (listing: Listing) => {
    const token = getDeletionToken(listing.id);
    if (!token) {
      showToast('অননুমোদিত: এই পোস্ট পরিবর্তনের সিক্রেট টোকেন নেই', 'error');
      return;
    }

    try {
      const updated = await listingService.toggleRented(listing.id, token, !listing.isRented);
      showToast(
        updated.isRented
          ? 'বিজ্ঞাপনটি "ভাড়া সম্পন্ন" চিহ্নিত করা হয়েছে'
          : 'বিজ্ঞাপনটি পুনরায় "উপলভ্য" করা হয়েছে',
        'success'
      );
      refetch();
      if (detailsListing?.id === listing.id) {
        setDetailsListing(updated);
      }
    } catch (err: any) {
      showToast(err?.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleRenewListing = async (listing: Listing) => {
    const token = getDeletionToken(listing.id);
    if (!token) {
      showToast('অননুমোদিত: এই পোস্ট নবায়নের সিক্রেট টোকেন নেই', 'error');
      return;
    }

    try {
      const updated = await listingService.renewListing(listing.id, token);
      showToast('বিজ্ঞাপনের মেয়াদ সফলভাবে আরো ৩০ দিন বৃদ্ধি করা হয়েছে!', 'success');
      refetch();
      if (detailsListing?.id === listing.id) {
        setDetailsListing(updated);
      }
    } catch (err: any) {
      showToast(err?.message || 'বিজ্ঞাপন নবায়ন করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingListing) return;

    const token = getDeletionToken(deletingListing.id);
    if (!token) {
      showToast('অননুমোদিত: এই পোস্ট মুছে ফেলার টোকেন পাওয়া যায়নি', 'error');
      setDeletingListing(null);
      return;
    }

    setIsDeleting(true);
    try {
      await listingService.deleteListing(deletingListing.id, token);
      removeOwnership(deletingListing.id);
      showToast('বিজ্ঞাপনটি মুছে ফেলা হয়েছে', 'success');
      refetch();
      if (detailsListing?.id === deletingListing.id) {
        setDetailsListing(null);
      }
    } catch (err: any) {
      showToast(err?.message || 'পোস্ট মুছতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsDeleting(false);
      setDeletingListing(null);
    }
  };

  const handleNavigateToSearch = (newFilters?: Partial<ListingFilterQuery>) => {
    if (newFilters) {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
    }
    setActiveTab('search');
  };

  return (
    <div className="app-container">
      <div className="wrap">
        <Header onNavigateHome={() => setActiveTab('home')} />

        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <main>
          {activeTab === 'home' && (
            <HomePage
              listings={listings}
              onNavigateToSearch={handleNavigateToSearch}
              onNavigateToPost={() => setActiveTab('post')}
              onViewDetails={(item) => setDetailsListing(item)}
              isMyListing={isMyListing}
              onCopyPhone={handleCopyPhone}
              onDeleteRequest={(item) => setDeletingListing(item)}
              onToggleRented={handleToggleRented}
              onRenewListing={handleRenewListing}
              onEditRequest={(item) => setEditingListing(item)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'search' && (
            <SearchPage
              listings={listings}
              filters={filters}
              isLoading={isLoading}
              error={error}
              onSearch={setFilters}
              onReset={resetFilters}
              onSortChange={handleSortChange}
              onRetry={refetch}
              isMyListing={isMyListing}
              getDeletionToken={getDeletionToken}
              removeOwnership={removeOwnership}
              showToast={showToast}
              refetchListings={refetch}
            />
          )}

          {activeTab === 'post' && (
            <PostListingPage onSuccess={handlePostSuccess} showToast={showToast} />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard showToast={showToast} onRefreshListings={refetch} />
          )}
        </main>
      </div>

      <Footer />

      {/* Global Modals for Seamless Access from Home, Search or Details */}
      <PropertyDetailsModal
        listing={detailsListing}
        isOpen={Boolean(detailsListing)}
        onClose={() => setDetailsListing(null)}
        isOwner={detailsListing ? isMyListing(detailsListing.id) : false}
        onCopyPhone={handleCopyPhone}
        onOpenReport={(item) => setReportingListing(item)}
        onOpenEdit={(item) => setEditingListing(item)}
        onToggleRented={handleToggleRented}
        onRenewListing={handleRenewListing}
        onDeleteRequest={(item) => setDeletingListing(item)}
        onShowToast={showToast}
      />

      <EditListingModal
        listing={editingListing}
        isOpen={Boolean(editingListing)}
        onClose={() => setEditingListing(null)}
        token={editingListing ? getDeletionToken(editingListing.id) || '' : ''}
        onSuccess={() => refetch()}
        showToast={showToast}
      />

      {reportingListing && (
        <ReportModal
          listing={reportingListing}
          isOpen={Boolean(reportingListing)}
          onClose={() => setReportingListing(null)}
          onSuccess={(msg) => showToast(msg, 'success')}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deletingListing)}
        listingTitle={deletingListing ? `${deletingListing.loc} (${deletingListing.name})` : ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingListing(null)}
      />

      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
