import React, { useState } from 'react';
import { getUILanguages, isBibleAvailable } from '@/lib/languageConfig';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';

export default function LanguageSelectorWithBibleStatus() {
  const { language, setLanguage } = useLanguage();
  const languages = getUILanguages();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">
          {languages.find(l => l.code === language)?.displayName || 'English'}
        </span>
      </Button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="p-2 space-y-1">
            {languages.map(lang => {
              const hasBible = isBibleAvailable(lang.code);
              const isSelected = language === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{lang.displayName}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                  <div className="text-xs mt-1 opacity-70">
                    {hasBible ? (
                      <span className="text-green-600 dark:text-green-400">✓ Bible available</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">UI only</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}