import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'om', name: 'Afaan Oromoo', native: 'Afaan Oromoo' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ' },
];

export default function LanguageSwitcherHeader() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Change language, currently ${currentLang?.name}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>{currentLang?.name}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <ul role="listbox" className="py-1">
            {LANGUAGES.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  aria-label={`Select ${lang.name}`}
                  aria-selected={language === lang.code}
                  role="option"
                  className={`w-full text-left px-4 py-2.5 min-h-[44px] text-sm transition-colors ${
                    language === lang.code
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}