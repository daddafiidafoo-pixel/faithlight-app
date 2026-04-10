import React, { useState } from 'react';
import { SERMON_LANGUAGES } from '@/lib/sermonLanguageConfig';
import { Globe, AlertCircle, Check } from 'lucide-react';

/**
 * SermonLanguageSelector - Required language selection for sermon generation
 * Displays supported and fallback languages with clear messaging
 */
export default function SermonLanguageSelector({ value, onChange, appLanguage }) {
  const [showDetails, setShowDetails] = useState(false);

  const selectedLang = SERMON_LANGUAGES[value];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Globe size={16} />
          Sermon Output Language
          <span className="text-red-600">*</span>
          <span className="text-xs font-normal text-gray-500">(required)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Display languages in requested order: OM, AM, AR, SW, FR, TI, EN */}
          {['om', 'am', 'ar', 'sw', 'fr', 'ti', 'en'].map((code) => {
            const lang = SERMON_LANGUAGES[code];
            if (!lang) return null;
            const isSelected = value === lang.code;
            const isSupported = lang.supported;

            return (
              <button
                key={lang.code}
                onClick={() => onChange(lang.code)}
                className={`relative p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                } ${!isSupported ? 'opacity-75' : ''}`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{lang.name}</div>
                  {!isSupported && (
                    <div className="text-xs text-amber-600 mt-1">
                      {lang.description}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5">
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick preset for current app language */}
        {appLanguage && appLanguage !== value && SERMON_LANGUAGES[appLanguage] && (
          <button
            onClick={() => onChange(appLanguage)}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            → Use current app language ({SERMON_LANGUAGES[appLanguage]?.nativeName})
          </button>
        )}
      </div>

      {/* Fallback warning */}
      {selectedLang && !selectedLang.supported && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Limited generation support</p>
              <p className="text-amber-700 mt-1">
                Full sermon generation is not yet available in {selectedLang.name}. We'll generate
                in English and provide a high-quality translation.
              </p>
              <p className="text-xs text-amber-600 mt-2">Quality may vary. For important sermons, please review with a native speaker.</p>
            </div>
          </div>
        </div>
      )}

      {/* Supported languages info */}
       <button
         onClick={() => setShowDetails(!showDetails)}
         className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
       >
         {showDetails ? '▼' : '▶'} Afaan kamiitu guutummaatti deeggarsa qaba?
       </button>

      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs text-gray-700">
          <p className="font-semibold text-gray-900">Fully Supported (Native Generation):</p>
          <ul className="list-disc list-inside space-y-1">
            {Object.values(SERMON_LANGUAGES)
              .filter((l) => l.supported)
              .map((l) => (
                <li key={l.code}>
                  {l.nativeName} — {l.description}
                </li>
              ))}
          </ul>
          <p className="font-semibold text-gray-900 mt-3">Translation Available:</p>
          <ul className="list-disc list-inside space-y-1">
            {Object.values(SERMON_LANGUAGES)
              .filter((l) => !l.supported)
              .map((l) => (
                <li key={l.code}>
                  {l.nativeName} — {l.description}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}