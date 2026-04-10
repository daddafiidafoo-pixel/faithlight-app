import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from './store/appStore';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useAppStore();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-gray-700" />
      ) : (
        <Sun size={20} className="text-gray-200" />
      )}
    </button>
  );
}