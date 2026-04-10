import React, { useState, useCallback, useEffect } from 'react';
import { X, Search, Play, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';

export default function VerseSelectModal({ uiLang, onSelect, onClose }) {
  const [language, setLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bibleConfig, setBibleConfig] = useState(null);

  // Load Bible config for selected language
  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const langCode = language === 'Afaan Oromoo' ? 'om' : 'en';
        const configs = await base44.entities.BibleLanguage.filter({ language_code: langCode });
        if (configs && configs.length > 0) {
          setBibleConfig(configs[0]);
        }
      } catch (err) {
        console.error('Failed to load Bible config:', err);
      }
    };
    loadConfig();
  }, [language]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || !bibleConfig) return;
    setLoading(true);
    try {
      const response = await fetch('/api/search-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchTerm.trim(),
          bible_id: bibleConfig.bible_id,
          language_code: language === 'Afaan Oromoo' ? 'om' : 'en',
        }),
      });
      const data = await response.json();
      setResults(data.verses || []);
      if (!data.verses || data.verses.length === 0) {
        toast.error(t(uiLang, 'common.noResults'));
      }
    } catch (err) {
      console.error('Search failed:', err);
      toast.error(t(uiLang, 'common.error'));
    }
    setLoading(false);
  }, [searchTerm, bibleConfig, language, uiLang]);

  const handleSelectVerse = (verse) => {
    if (onSelect) {
      onSelect({
        language_code: language === 'Afaan Oromoo' ? 'om' : 'en',
        bible_id: bibleConfig.bible_id,
        book_id: verse.book_id,
        chapter: verse.chapter,
        verse_start: verse.verse_start,
        verse_end: verse.verse_end || verse.verse_start,
        reference_text: verse.reference,
        verse_text: verse.text,
        audio_fileset_id: bibleConfig.audio_fileset_id,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">{t(uiLang, 'verse.addBibleVerse')}</h2>
          <button onClick={onClose} aria-label={t(uiLang, 'common.close')} className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-100 flex-shrink-0">
          {['English', 'Afaan Oromoo'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 min-h-[44px] rounded-xl font-semibold text-sm transition-all ${
                language === lang ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex gap-2 p-4 border-b border-gray-100 flex-shrink-0">
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={language === 'Afaan Oromoo' ? 'Ayaa barbaadi' : 'Search verse, keyword, or reference'}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm min-h-[44px]"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="min-h-[44px] min-w-[44px] px-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <Search size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-400">{t(uiLang, 'common.loading')}</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? t(uiLang, 'common.noResults') : 'Search to find verses'}
            </div>
          ) : (
            results.map((verse, i) => (
              <button
                key={i}
                onClick={() => handleSelectVerse(verse)}
                className="w-full text-left p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all"
              >
                <p className="font-semibold text-sm text-gray-900">{verse.reference}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{verse.text}</p>
              </button>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 min-h-[44px] py-2 rounded-xl bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            {t(uiLang, 'common.cancel')}
          </button>
          <button
            disabled={results.length === 0}
            className="flex-1 min-h-[44px] py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {t(uiLang, 'verse.attachVerse')}
          </button>
        </div>
      </div>
    </div>
  );
}