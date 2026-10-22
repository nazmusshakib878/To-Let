import React from 'react';
import { Search, PlusCircle } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: 'search' | 'post';
  onTabChange: (tab: 'search' | 'post') => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs" role="tablist">
      <button
        role="tab"
        id="t1"
        aria-controls="find"
        aria-selected={activeTab === 'search'}
        onClick={() => onTabChange('search')}
      >
        <Search size={18} />
        বাসা খুঁজুন
      </button>

      <button
        role="tab"
        id="t2"
        aria-controls="post"
        aria-selected={activeTab === 'post'}
        onClick={() => onTabChange('post')}
      >
        <PlusCircle size={18} />
        To-Let দিন
      </button>
    </div>
  );
};
