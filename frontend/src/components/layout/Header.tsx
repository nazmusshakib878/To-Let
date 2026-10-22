import React from 'react';
import { Home } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="app-title-group">
        <h1>
          <Home size={30} color="var(--g)" />
          বাসা খুঁজি
        </h1>
        <p>সাতক্ষীরা–খুলনা অঞ্চলে ভাড়া বাসা, সরাসরি বাড়িওয়ালার কাছ থেকে</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ThemeToggle />
      </div>
    </header>
  );
};
