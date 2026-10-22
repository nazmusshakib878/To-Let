import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { SearchPage } from './pages/SearchPage';
import { PostListingPage } from './pages/PostListingPage';
import { useListings } from './hooks/useListings';
import { useMyListings } from './hooks/useMyListings';
import { useToast } from './hooks/useToast';
import './styles/globals.css';
import './styles/components.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'post'>('search');

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

  const handlePostSuccess = (listingId: number, deletionToken: string) => {
    saveOwnership(listingId, deletionToken);
    showToast('পোস্ট সফলভাবে প্রকাশিত হয়েছে');
    resetFilters();
    refetch();
    setActiveTab('search');
  };

  const handleSortChange = (sort: 'rent' | 'new') => {
    updateFilters({ sort });
  };

  return (
    <div className="app-container">
      <div className="wrap">
        <Header />

        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <main>
          {activeTab === 'search' ? (
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
          ) : (
            <PostListingPage onSuccess={handlePostSuccess} showToast={showToast} />
          )}
        </main>
      </div>

      <Footer />

      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
