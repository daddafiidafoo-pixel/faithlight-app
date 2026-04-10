/**
 * BilingualToggle.jsx
 * Compact language mode switcher for the Bible reader.
 * Modes: single-en | single-om | stacked
 */
import React from 'react';
import { useI18n } from '@/components/I18nProvider';

const MODES = [
  { key: 'en',      label: 'English',      labelOm: 'Afaan Ingilizii' },
  { key: 'om',      label: 'Afaan Oromoo',  labelOm: 'Afaan Oromoo'  },
  { key: 'stacked', label: 'Bilingual',     labelOm: 'Lachuu'         },
];

export default function BilingualToggle({ mode, onChange, isDarkMode }) {
  const { lang } = useI18n();

  const bg      = isDarkMode ? '#1A1F1C' : '#F3F4F6';
  const active  = isDarkMode ? '#4ADE80' : '#166534';
  const textAct = isDarkMode ? '#0F1411' : '#FFFFFF';
  const textDef = isDarkMode ? '#9CA3AF' : '#6B7280';
  const border  = isDarkMode ? '#2A2F2C' : '#E5E7EB';

  return (
    <div
      className="flex rounded-xl overflow-hidden border"
      style={{ background: bg, borderColor: border }}
    >
      {MODES.map(m => {
        const isActive = mode === m.key;
        const label = lang === 'om' ? m.labelOm : m.label;
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className="flex-1 text-xs font-semibold px-3 py-1.5 transition-all"
            style={{
              background: isActive ? active : 'transparent',
              color: isActive ? textAct : textDef,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}