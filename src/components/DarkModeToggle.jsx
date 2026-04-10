import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

// Exported hook — reads/writes the 3-way theme preference
export function useThemeMode() {
  const getSystemDark = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('faithlight_theme_mode') || 'system'; } catch { return 'system'; }
  });

  // Derive effective dark flag
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark());

  const applyTheme = (effective) => {
    const root = document.documentElement;
    if (effective) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Update meta theme-color
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = effective ? '#0F172A' : '#312E81';

    // Legacy event for other components that listen
    window.dispatchEvent(new CustomEvent('faithlight-theme-change', { detail: effective ? 'dark' : 'light' }));
  };

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (mode === 'system') applyTheme(mq.matches); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setThemeMode = (newMode) => {
    try { localStorage.setItem('faithlight_theme_mode', newMode); } catch {}
    setMode(newMode);
  };

  return { mode, isDark, setThemeMode };
}

// Legacy compat: some components use useDarkMode
export function useDarkMode() {
  const { isDark, setThemeMode } = useThemeMode();
  const toggle = () => setThemeMode(isDark ? 'light' : 'dark');
  return { isDark, toggle };
}

const MODES = [
  { key: 'system', Icon: Monitor, label: 'System' },
  { key: 'light',  Icon: Sun,     label: 'Light' },
  { key: 'dark',   Icon: Moon,    label: 'Dark' },
];

export default function DarkModeToggle({ className = '' }) {
  const { mode, setThemeMode } = useThemeMode();

  const current = MODES.find(m => m.key === mode) || MODES[0];
  const { Icon } = current;

  // Cycle through modes on click
  const handleClick = () => {
    const idx = MODES.findIndex(m => m.key === mode);
    const next = MODES[(idx + 1) % MODES.length];
    setThemeMode(next.key);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium
        bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
      title={`Theme: ${current.label} (click to cycle)`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  );
}