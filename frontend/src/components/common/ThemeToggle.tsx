import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useDarkMode();

  const getIcon = () => {
    if (theme === 'dark') return <Moon size={18} />;
    if (theme === 'light') return <Sun size={18} />;
    return <Laptop size={18} />;
  };

  const getLabel = () => {
    if (theme === 'dark') return 'ডার্ক মোড সক্রিয় (ক্লিক করে লাইট মোড করুন)';
    if (theme === 'light') return 'লাইট মোড সক্রিয় (ক্লিক করে সিস্টেম থিম করুন)';
    return 'সিস্টেম থিম সক্রিয় (ক্লিক করে ডার্ক মোড করুন)';
  };

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
};
