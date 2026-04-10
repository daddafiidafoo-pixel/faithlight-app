import React from 'react';
import { useLanguageStore } from '@/components/languageStore';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', label: 'EN', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'አማ', nativeLabel: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'OM', nativeLabel: 'Oromoo', flag: '🇪🇹' },
  { code: 'ar', label: 'عر', nativeLabel: 'العربية', flag: '🇸🇦', rtl: true },
];

/**
 * WidgetLanguageSwitcher
 * Switches uiLanguage, bibleLanguage and audioLanguage simultaneously.
 * When Arabic is selected, sets dir="rtl" on the nearest layout container.
 */
export default function WidgetLanguageSwitcher() {
  const { uiLanguage, setLanguage } = useLanguageStore();

  const handleSelect = (code) => {
    setLanguage(code);
    // Apply RTL/LTR to document for layout propagation
    document.documentElement.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', code);
  };

  return (
    <div
      role="group"
      aria-label="Select language"
      className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100"
      dir="ltr"
    >
      {LANGUAGES.map((l) => {
        const active = uiLanguage === l.code;
        return (
          <motion.button
            key={l.code}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelect(l.code)}
            aria-label={l.nativeLabel}
            aria-pressed={active}
            title={l.nativeLabel}
            className={`relative px-2.5 py-1.5 min-h-[44px] min-w-[44px] rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
              active
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
            style={l.rtl ? { fontFamily: 'Arial, sans-serif' } : {}}
          >
            {active && (
              <motion.div
                layoutId="lang-pill"
                className="absolute inset-0 rounded-lg bg-indigo-600"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{l.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}