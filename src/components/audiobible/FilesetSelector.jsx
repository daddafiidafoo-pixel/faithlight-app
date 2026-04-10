import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Radio } from 'lucide-react';

const LANG_NAMES = {
  en: 'English', om: 'Afaan Oromoo', am: 'Amharic', fr: 'French',
  ar: 'Arabic', fa: 'Persian', ur: 'Urdu', es: 'Spanish', pt: 'Portuguese',
  de: 'German', it: 'Italian', ru: 'Russian', hi: 'Hindi', sw: 'Kiswahili',
  tir: 'Tigrinya', tig: 'Tigrayit',
};

export default function FilesetSelector({ lang, onSelect, selectedFileset }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lang) return;
    setLoading(true);
    setError(null);
    setVersions([]);

    base44.functions.invoke('bibleBrainCatalog', { action: 'catalog', lang })
      .then(res => {
        const vs = res.data?.data?.versions || [];
        setVersions(vs);
        if (vs.length > 0 && !selectedFileset) {
          // Auto-select first version — prefer drama if available
          const drama = vs.find(v => v.type === 'audio_drama') || vs[0];
          // Pass entire object with filesetId, not just the string
          onSelect(drama);
        }
      })
      .catch(e => {
        setError(e?.response?.data?.error || e.message || 'Failed to load catalog');
      })
      .finally(() => setLoading(false));
  }, [lang]);

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Loading audio versions for {LANG_NAMES[lang] || lang}…</span>
    </div>
  );

  if (error) return (
    <div className="rounded-xl p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
      <p className="font-medium">Could not load audio versions</p>
      <p className="text-xs mt-1">{error}</p>
    </div>
  );

  if (versions.length === 0) return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <p className="font-medium text-amber-800 text-sm">No audio versions available for {LANG_NAMES[lang] || lang}</p>
      <p className="text-xs text-amber-600 mt-1">Try English or another supported language.</p>
    </div>
  );

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Audio Version</p>
      <div className="flex flex-wrap gap-2">
        {versions.map(v => {
          const isSelected = selectedFileset?.filesetId === v.filesetId;
          return (
            <button
              key={v.filesetId}
              onClick={() => onSelect(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'border-gray-200 text-gray-700 hover:border-indigo-300 bg-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="font-medium">{v.name}</span>
              <span className={`text-xs ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                {v.type === 'audio_drama' ? '🎭' : '🔊'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}