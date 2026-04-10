import React from 'react';
import { Loader2, Radio, AlertCircle } from 'lucide-react';

const LANG_NAMES = {
  en: 'English', om: 'Afaan Oromoo', am: 'Amharic', ar: 'Arabic', fr: 'French',
  sw: 'Kiswahili', tir: 'Tigrinya', tig: 'Tigrayit', hae: 'Hadiyya',
  pt: 'Português', es: 'Español', de: 'Deutsch', hi: 'हिन्दी',
};

export default function AudioVersionPicker({ lang, versions, selectedVersion, onSelect, loading, error }) {
  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
      <span>Finding audio versions for {LANG_NAMES[lang] || lang}…</span>
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p>Could not load versions: {error}</p>
    </div>
  );

  if (!loading && versions.length === 0) return (
    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800">
      No audio versions found for {LANG_NAMES[lang] || lang}.
    </div>
  );

  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Audio Version</p>
      <div className="flex flex-wrap gap-2">
        {versions.map(v => {
          const isActive = selectedVersion?.filesetId === v.filesetId;
          return (
            <button
              key={v.filesetId}
              onClick={() => onSelect(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'border-gray-200 text-gray-700 bg-white hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <Radio className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{v.bibleName}</span>
              <span className={`text-xs ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                {v.type === 'audio_drama' ? '🎭' : '🔊'}
                {v.size && v.size !== 'C' ? ` ${v.size}` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}