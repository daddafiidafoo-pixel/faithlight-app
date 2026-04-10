/**
 * CatalogVersionSelector
 * Language + Version picker driven entirely by the live catalog from getBibleCatalog.
 * Replaces all hardcoded language lists.
 */
import React, { useEffect, useState } from 'react';
import { Globe, ChevronDown, Loader2 } from 'lucide-react';
import ProviderRouter from '@/components/lib/providerRouter';

export default function CatalogVersionSelector({ versionId, onVersionChange, showAudioOnly = false }) {
  const [languages, setLanguages] = useState([]);
  const [versions, setVersions]   = useState([]);
  const [selLang, setSelLang]     = useState(null);
  const [selVersion, setSelVersion] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showLangGrid, setShowLangGrid] = useState(false);

  // Load catalog
  useEffect(() => {
    setLoading(true);
    ProviderRouter.listLanguages().then(langs => {
      const active = langs.filter(l => l.hasVersions);
      setLanguages(active);
      // Pick initial language
      const defaultLang = active[0];
      if (defaultLang) pickLanguage(defaultLang.code, active);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function pickLanguage(langCode, langList) {
    const vers = await ProviderRouter.listVersions(langCode);
    const filtered = showAudioOnly ? vers.filter(v => v.hasAudio) : vers;
    setVersions(filtered);
    setSelLang((langList ?? languages).find(l => l.code === langCode));
    const def = filtered.find(v => v.isDefault) ?? filtered[0];
    if (def) {
      setSelVersion(def);
      onVersionChange?.(def);
    }
  }

  function handleVersionSelect(vid) {
    const v = versions.find(x => x.id === vid);
    if (v) { setSelVersion(v); onVersionChange?.(v); }
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading catalog…
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Language selector */}
      <div>
        <button
          onClick={() => setShowLangGrid(v => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <Globe className="w-4 h-4 text-indigo-500" />
          <span>{selLang ? `${selLang.flag ?? ''} ${selLang.name}` : 'Select Language'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showLangGrid ? 'rotate-180' : ''}`} />
        </button>

        {showLangGrid && (
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => { pickLanguage(l.code); setShowLangGrid(false); }}
                className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                  selLang?.code === l.code
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                }`}
              >
                <span className="text-lg">{l.flag ?? '🌐'}</span>
                <span className="mt-0.5 text-center leading-tight">{l.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Version selector */}
      {versions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {versions.map(v => (
            <button
              key={v.id}
              onClick={() => handleVersionSelect(v.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                selVersion?.id === v.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {v.title ?? v.abbr ?? v.id}
              {v.hasAudio && <span className="ml-1 opacity-60">🔊</span>}
            </button>
          ))}
        </div>
      )}

      {versions.length === 0 && selLang && (
        <p className="text-xs text-gray-400">
          {showAudioOnly ? 'No audio versions available for this language yet.' : 'No versions available yet.'}
        </p>
      )}
    </div>
  );
}