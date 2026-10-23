import React from 'react';
import { Home } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="app-header">
      <div
        className="app-title-group"
        onClick={onNavigateHome}
        style={{ cursor: onNavigateHome ? 'pointer' : 'default' }}
        role={onNavigateHome ? 'button' : undefined}
        tabIndex={onNavigateHome ? 0 : undefined}
        onKeyDown={(e) => {
          if (onNavigateHome && (e.key === 'Enter' || e.key === ' ')) {
            onNavigateHome();
          }
        }}
      >
        <h1>
          <Home size={30} color="var(--g)" />
          বাসা খুঁজি
        </h1>
        <p>খুলনা ও সাতক্ষীরা অঞ্চলে সরাসরি বাড়িওয়ালার ভাড়ার বাসা ও মেস</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ThemeToggle />
      </div>
    </header>
  );
};
