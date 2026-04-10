import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Globe, Lock } from 'lucide-react';

// Fallback translations in case DB isn't seeded yet
const FALLBACK_TRANSLATIONS = [
  { abbrev: 'WEB', name: 'World English Bible', language: 'en', description: 'Modern English, public domain', offline_allowed: true },
  { abbrev: 'ASV', name: 'American Standard Version', language: 'en', description: 'Classic formal English', offline_allowed: true },
];

export default function TranslationSelector({
  currentAbbrev,
  onTranslationChange,
  isDarkMode = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [translations, setTranslations] = useState(FALLBACK_TRANSLATIONS);

  useEffect(() => {
    base44.entities.BibleTranslation.list().then(list => {
      if (list && list.length > 0) setTranslations(list);
    }).catch(() => {});
  }, []);

  const bgColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const selectedBg = isDarkMode ? '#2A3A2A' : '#F0F8F0';
  const hoverBg = isDarkMode ? '#2A3A2A' : '#F8F8F8';

  const handleSelect = (t) => {
    onTranslationChange(t.abbrev, t);
    localStorage.setItem('preferred_translation', t.abbrev);
    setIsOpen(false);
  };

  const current = translations.find(t => t.abbrev === currentAbbrev) || translations[0];

  // Group by language
  const byLang = translations.reduce((acc, t) => {
    const key = t.language || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const langLabels = { en: 'English', om: 'Afaan Oromoo', am: 'Amharic', ar: 'Arabic' };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-8 px-3 gap-2 text-xs font-medium"
        style={{ backgroundColor: bgColor, borderColor, color: textColor }}
      >
        <Globe className="w-3 h-3" />
        {currentAbbrev}
        <ChevronDown className="w-3 h-3" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl max-w-2xl mx-auto w-full overflow-y-auto max-h-[80vh]"
          style={{ backgroundColor: bgColor }}
        >
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: borderColor }} />
            </div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: textColor }}>Choose Bible Translation</h2>
            <p className="text-xs mb-5" style={{ color: isDarkMode ? '#888' : '#999' }}>
              All translations shown are from licensed sources — not AI generated.
            </p>

            {Object.entries(byLang).map(([lang, list]) => (
              <div key={lang} className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>
                  {langLabels[lang] || lang}
                </p>
                <div className="space-y-2">
                  {list.map(t => {
                    const isSelected = t.abbrev === currentAbbrev;
                    return (
                      <button
                        key={t.abbrev}
                        onClick={() => handleSelect(t)}
                        className="w-full p-4 rounded-lg border-2 transition-all text-left"
                        style={{
                          backgroundColor: isSelected ? selectedBg : bgColor,
                          borderColor: isSelected ? primaryColor : borderColor,
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = hoverBg; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = bgColor; }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm" style={{ color: textColor }}>{t.abbrev}</span>
                              {t.offline_allowed && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: primaryColor + '22', color: primaryColor }}>offline ✓</span>
                              )}
                              {isSelected && <Check className="w-4 h-4" style={{ color: primaryColor }} />}
                            </div>
                            <p className="text-xs mt-1 font-medium" style={{ color: textColor }}>{t.name}</p>
                            {t.description && (
                              <p className="text-xs mt-0.5" style={{ color: isDarkMode ? '#A0A0A0' : '#6E6E6E' }}>{t.description}</p>
                            )}
                            {t.license_name && (
                              <p className="text-xs mt-1" style={{ color: isDarkMode ? '#888' : '#AAA' }}>
                                📜 {t.license_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-4 pt-4 border-t text-center" style={{ borderColor }}>
              <p className="text-xs" style={{ color: isDarkMode ? '#888' : '#AAA' }}>
                Bible text is served from trusted licensed datasets only.
                AI is used for study tools and commentary — never for Bible verse translation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}