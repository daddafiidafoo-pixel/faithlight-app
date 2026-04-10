import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/components/languageStore';

const LABELS = {
  en: { select: 'Select language', done: 'Done' },
  om: { select: 'Afaan Filadhu', done: 'Xumuri' },
};

export default function HomeLangSwitcher() {
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState([]);
  const { uiLanguage, setUiLanguage } = useLanguageStore();

  // Load active languages from BibleLanguage entity
  useEffect(() => {
    base44.entities.BibleLanguage.filter({ is_active: true }, 'sort_order', 20)
      .then(rows => { if (rows?.length) setLanguages(rows); })
      .catch(() => {});
  }, []);

  const L = LABELS[uiLanguage] || LABELS.en;
  const currentLang = languages.find(l => l.language_code === uiLanguage);
  const displayName = currentLang?.native_name || (uiLanguage === 'om' ? 'Afaan Oromoo' : 'English');

  const handleSelect = async (lang) => {
    const code = lang.language_code;
    setUiLanguage(code);
    // Sync I18nProvider (and any other language listeners) via the global event
    try {
      window.dispatchEvent(new CustomEvent('faithlight-lang-changed', { detail: code }));
    } catch {}
    // Save to user preferences if authenticated
    try {
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        const existing = await base44.entities.UserSettings.filter({ user_id: user.id }, null, 1).catch(() => []);
        if (existing?.length) {
          await base44.entities.UserSettings.update(existing[0].id, { preferred_language: code }).catch(() => {});
        }
      }
    } catch {}
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-medium"
      >
        <Globe className="w-4 h-4" />
        <span>{displayName}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-80" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-base text-gray-900">{L.select}</h3>
              <button onClick={() => setOpen(false)} className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-gray-100" aria-label="Close language selector">
                 <X className="w-5 h-5 text-gray-500" />
               </button>
            </div>
            <div className="p-2">
              {languages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  {uiLanguage === 'om' ? 'Afaan hin argamne' : 'No languages available'}
                </p>
              )}
              {languages.map(lang => (
                <button
                  key={lang.language_code}
                  onClick={() => handleSelect(lang)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">{lang.native_name}</p>
                    <p className="text-xs text-gray-400">{lang.language_name}</p>
                  </div>
                  {uiLanguage === lang.language_code && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                {L.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}