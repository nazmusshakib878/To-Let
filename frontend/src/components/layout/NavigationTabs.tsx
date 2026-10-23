import React from 'react';
import { Home, Search, PlusCircle, ShieldAlert } from 'lucide-react';

export type AppTab = 'home' | 'search' | 'post' | 'admin';

interface NavigationTabsProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs" role="tablist">
      <button
        role="tab"
        id="t-home"
        aria-selected={activeTab === 'home'}
        onClick={() => onTabChange('home')}
      >
        <Home size={18} />
        হোম
      </button>

      <button
        role="tab"
        id="t-search"
        aria-controls="find"
        aria-selected={activeTab === 'search'}
        onClick={() => onTabChange('search')}
      >
        <Search size={18} />
        বাসা খুঁজুন
      </button>

      <button
        role="tab"
        id="t-post"
        aria-controls="post"
        aria-selected={activeTab === 'post'}
        onClick={() => onTabChange('post')}
      >
        <PlusCircle size={18} />
        To-Let দিন
      </button>

      <button
        role="tab"
        id="t-admin"
        aria-selected={activeTab === 'admin'}
        onClick={() => onTabChange('admin')}
        style={{ fontSize: '13px' }}
      >
        <ShieldAlert size={16} />
        মডারেশন
      </button>
    </div>
  );
};
