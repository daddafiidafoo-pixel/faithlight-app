/**
 * LanguageQuickPicker
 * Compact but visible panel for setting UI, Bible, and Audio language.
 * Used on the Home page header and can be embedded anywhere.
 */
import React, { useState } from 'react';
import { Globe, ChevronDown, BookOpen, Headphones, Monitor, Check } from 'lucide-react';
import { useI18n } from './I18nProvider';
import { useAppStore } from './store/appStore';
import { logEvent, Events } from './services/analytics/eventLogger';

// flagImg: path to a custom image flag (overrides emoji flag)
export const LANGUAGES = [
  { code: 'en', label: 'English',      native: 'English',      flag: '🇬🇧' },
  { code: 'om', label: 'Afaan Oromoo', native: 'Afaan Oromoo', flag: '🇪🇹', flagImg: 'https://media.base44.com/images/public/698916b90dfeb3e2d260ca97/60d04c765_image.png' },
  { code: 'am', label: 'Amharic',      native: 'አማርኛ',         flag: '🇪🇹' },
  { code: 'sw', label: 'Swahili',      native: 'Kiswahili',    flag: '🇹🇿' },
  { code: 'ar', label: 'Arabic',       native: 'العربية',       flag: '🇸🇦' },
  { code: 'fr', label: 'Français',     native: 'Français',     flag: '🇫🇷' },
  { code: 'ti', label: 'Tigrinya',     native: 'ትግርኛ',          flag: '🇪🇷' },
];

function LangRow({ icon: Icon, label, value, onChange, accent = '#6C5CE7' }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <Icon size={12} style={{ color: accent }} />
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            aria-label={`${l.label}${value === l.code ? ' (selected)' : ''}`}
            aria-current={value === l.code ? 'true' : undefined}
            className={`flex items-center gap-1 min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              value === l.code
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            {l.flagImg
              ? <img src={l.flagImg} alt={l.label} className="w-5 h-3.5 object-cover rounded-sm inline-block" onError={(e) => { e.target.style.display='none'; }} />
              : <span aria-hidden="true">{l.flag}</span>
            }
            <span>{l.native}</span>
            {value === l.code && <Check size={10} className="text-indigo-600" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LanguageQuickPicker({ compact = false }) {
  const { lang, setLang } = useI18n();
  const { bibleLanguage, setBibleLanguage, audioLanguage, setAudioLanguage } = useAppStore();
  const [open, setOpen] = useState(false);

  const currentLangObj = LANGUAGES.find(l => l.code === lang);
  const currentFlag = currentLangObj?.flag || '🌐';
  const currentFlagImg = currentLangObj?.flagImg || null;
  const currentLabel = currentLangObj?.native || lang;

  const handleUI = (code) => {
    logEvent(Events.LANGUAGE_CHANGED, { type: 'ui', from: lang, to: code });
    setLang(code);
  };
  const handleBible = (code) => setBibleLanguage(code);
  const handleAudio = (code) => setAudioLanguage(code);

  return (
    <div className="relative">
      <button
         onClick={() => setOpen(!open)}
         aria-label={`Language settings. Current: ${currentLabel}`}
         aria-expanded={open}
         aria-haspopup="true"
         className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:border-indigo-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
       >
         <Globe size={14} className="text-indigo-500" aria-hidden="true" />
         {currentFlagImg
           ? <img src={currentFlagImg} alt={currentLabel} className="w-5 h-3.5 object-cover rounded-sm inline-block" onError={(e) => { e.target.style.display='none'; }} />
           : <span aria-hidden="true">{currentFlag}</span>
         }
         {!compact && <span className="hidden sm:inline">{currentLabel}</span>}
         <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
       </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-500" /> Language Settings
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close language settings" className="min-h-[44px] min-w-[44px] h-auto py-2 px-3 flex items-center justify-center text-base text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">✕</button>
            </div>

            <LangRow
              icon={Monitor}
              label="UI Language"
              value={lang}
              onChange={(c) => { handleUI(c); }}
            />
            <LangRow
              icon={BookOpen}
              label="Bible Reading Language"
              value={bibleLanguage}
              onChange={handleBible}
              accent="#10b981"
            />
            <LangRow
              icon={Headphones}
              label="Audio Language"
              value={audioLanguage}
              onChange={handleAudio}
              accent="#f59e0b"
            />

            <p className="text-[10px] text-gray-400 border-t pt-2">
              You can also change these anytime in Settings → Languages
            </p>
          </div>
        </>
      )}
    </div>
  );
}