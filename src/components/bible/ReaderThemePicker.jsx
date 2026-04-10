import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { THEMES, saveReaderTheme } from '@/lib/readerTheme';

const ICONS = {
  light: Sun,
  sepia: () => <span className="text-sm font-bold" style={{ color: '#7C6547' }}>S</span>,
  dark: Moon,
};

export default function ReaderThemePicker({ currentThemeId, onThemeChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ backgroundColor: '#F3F4F6' }}>
      {Object.values(THEMES).map(theme => {
        const Icon = ICONS[theme.id];
        const active = currentThemeId === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => { saveReaderTheme(theme.id); onThemeChange(theme); }}
            aria-label={`${theme.label} mode`}
            title={theme.label}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: active ? theme.cardBg : 'transparent',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            <Icon className="w-4 h-4" style={{ color: active ? '#8B5CF6' : '#9CA3AF' }} />
          </button>
        );
      })}
    </div>
  );
}