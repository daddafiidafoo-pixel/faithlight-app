import React from 'react';
import { Settings, Type, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const FONT_SIZES = [
  { label: 'XS', value: 'text-xs' },
  { label: 'S',  value: 'text-sm' },
  { label: 'M',  value: 'text-base' },
  { label: 'L',  value: 'text-lg' },
  { label: 'XL', value: 'text-xl' },
];

const THEMES = [
  { label: 'Light',  bg: 'bg-white',        icon: Sun,  preview: '#FFFFFF' },
  { label: 'Sepia',  bg: 'bg-amber-50',      icon: Sun,  preview: '#FFFBF2' },
  { label: 'Dark',   bg: 'bg-gray-900',      icon: Moon, preview: '#111827' },
];

export default function ReaderSettingsPanel({
  isDarkMode,
  onToggleDark,
  fontSize,
  onFontSizeChange,
  bgColor,
  onBgColorChange,
}) {
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          style={{ color: primaryColor }}
          title="Reader settings"
        >
          <Type className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-4 rounded-xl shadow-xl"
        style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
        align="end"
      >
        {/* Font Size */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: primaryColor }}>
            Font Size
          </p>
          <div className="flex gap-1">
            {FONT_SIZES.map((f) => (
              <button
                key={f.value}
                onClick={() => onFontSizeChange(f.value)}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: fontSize === f.value ? primaryColor : 'transparent',
                  color: fontSize === f.value ? '#fff' : textColor,
                  border: `1px solid ${fontSize === f.value ? primaryColor : borderColor}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: primaryColor }}>
            Theme
          </p>
          <div className="flex gap-2">
            {THEMES.map((theme) => {
              const isActive = bgColor === theme.bg;
              return (
                <button
                  key={theme.label}
                  onClick={() => {
                    onBgColorChange(theme.bg);
                    if (theme.label === 'Dark' && !isDarkMode) onToggleDark();
                    if (theme.label !== 'Dark' && isDarkMode) onToggleDark();
                  }}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
                  style={{
                    border: `2px solid ${isActive ? primaryColor : borderColor}`,
                    background: theme.preview,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{ background: theme.preview, borderColor }}
                  />
                  <span className="text-xs font-medium" style={{ color: theme.label === 'Dark' ? '#E5E7EB' : '#374151' }}>
                    {theme.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}