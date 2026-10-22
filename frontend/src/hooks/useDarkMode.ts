import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('tolet-theme') as Theme;
    return saved || 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const systemDark = mediaQuery.matches;
      let effectiveDark = systemDark;

      if (theme === 'dark') {
        effectiveDark = true;
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (theme === 'light') {
        effectiveDark = false;
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
        effectiveDark = systemDark;
      }

      setIsDark(effectiveDark);
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark';
      localStorage.setItem('tolet-theme', nextTheme);
      return nextTheme;
    });
  };

  return { theme, isDark, toggleTheme };
}
