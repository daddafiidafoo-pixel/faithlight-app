import React, { useState, useEffect, useRef } from 'react';
import { X, Search, BookOpen, Volume2, ExternalLink, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// ─── Localization ────────────────────────────────────────────
const UI = {
  en: {
    title: 'Add Bible Verse',
    placeholder: 'Search verse, keyword, or reference',
    tabs: { en: 'English', om: 'Afaan Oromoo' },
    select: 'Select',
    selected: 'Selected verse',
    attach: 'Attach Verse',
    cancel: 'Cancel',
    noResults: 'No results found',
    apiError: 'Verse search is unavailable right now',
    emptyQuery: 'Enter a verse reference or keyword',
    attachError: 'Could not attach verse',
    playAudio: 'Play Audio',
    audioUnavailable: 'Audio not available for this verse',
    open: 'Open',
    attached: 'Attached Verse',
    searching: 'Searching…',
    suggestions: ['Psalm 23:1', 'John 3:16', 'Romans 8:28'],
  },
  om: {
    title: 'Aayata Macaafa Qulqulluu Dabaluu',
    placeholder: 'Aayata, jecha, yookaan keessaa barbaadi',
    tabs: { en: 'Ingliffaa', om: 'Afaan Oromoo' },
    select: 'Filadhu',
    selected: 'Aayata filatame',
    attach: 'Aayata Maxxansi',
    cancel: 'Haqi',
    noResults: "Bu'aan hin argamne",
    apiError: 'Barbaadni aayataa yeroo ammaa hin hojjetu',
    emptyQuery: 'Aayata yookaan jecha tokko galchi',
    attachError: "Aayaticha maxxansuun hin danda'amne",
    playAudio: 'Dhaggeeffadhu',
    audioUnavailable: 'Sagaleen aayata kanaaf hin jiru',
    open: 'Bani',
    attached: 'Aayata Maxxanfame',
    searching: 'Barbaadaa jira…',
    suggestions: ['Faarfannaa 23:1', 'Yohaannis 3:16', 'Roomaa 8:28'],
  },
};

// Bible config per language
const BIBLE_CONFIG = {
  en: { bible_id: 'ENGESV', audio_fileset_id: 'ENGESVN2DA', language_code: 'en' },
  om: { bible_id: 'GAZGAZ', audio_fileset_id: 'OROWBTN2DA', language_code: 'om' },
};

/**
 * BibleVerseSearchModal
 *
 * Props:
 *   uiLang        – 'en' | 'om'  (controls UI language)
 *   parentType    – 'prayer_request' | 'comment' | 'reply'
 *   parentId      – string ID of the parent record
 *   currentEmail  – current user email (for created_by)
 *   onAttached    – callback(attachedVerseRecord) called after successful save
 *   onClose       – callback to close the modal
 */
export default function BibleVerseSearchModal({
  uiLang = 'en',
  parentType,
  parentId,
  currentEmail,
  onAttached,
  onClose,
}) {
  const lang = UI[uiLang] ? uiLang : 'en';
  const L = UI[lang];

  const [searchLang, setSearchLang] = useState(lang); // which Bible to search
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-focus search input on open
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const config = BIBLE_CONFIG[searchLang] || BIBLE_CONFIG.en;

  const doSearch = async (q) => {
    const trimmed = (q || query).trim();
    if (!trimmed) { setError(L.emptyQuery); return; }
    setLoading(true);
    setError('');
    setResults([]);
    setSelectedVerse(null);
    try {
      const res = await base44.functions.invoke('bibleBrainVerseSearch', {
        query: trimmed,
        bible_id: config.bible_id,
      });
      const list = res?.data?.results || [];
      if (list.length === 0) setError(L.noResults);
      else setResults(list);
    } catch {
      setError(L.apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') doSearch();
  };

  const handleSelect = (verse) => {
    setSelectedVerse(v => v?.result_id === verse.result_id ? null : verse);
  };

  const handleAttach = async () => {
    if (!selectedVerse) return;
    if (!parentType || !parentId) {
      toast.error(L.attachError);
      return;
    }
    setSaving(true);
    try {
      const record = await base44.entities.AttachedVerse.create({
        parent_type: parentType,
        parent_id: parentId,
        language_code: config.language_code,
        bible_id: config.bible_id,
        audio_fileset_id: config.audio_fileset_id,
        book_id: selectedVerse.book_id,
        book_name: selectedVerse.book_name,
        chapter: selectedVerse.chapter,
        verse_start: selectedVerse.verse_start,
        verse_end: selectedVerse.verse_end,
        reference_text: selectedVerse.reference_text,
        verse_text: selectedVerse.verse_text,
        created_by: currentEmail || '',
      });
      onAttached?.(record);
      onClose?.();
    } catch {
      toast.error(L.attachError);
    } finally {
      setSaving(false);
    }
  };

  const handleOpen = (verse) => {
    navigate(`/BibleReaderPage?book=${verse.book_id}&chapter=${verse.chapter}&verse=${verse.verse_start}&lang=${config.language_code}&bibleId=${config.bible_id}`);
    onClose?.();
  };

  const switchLang = (code) => {
    setSearchLang(code);
    setResults([]);
    setError('');
    setSelectedVerse(null);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{ maxHeight: '92vh' }}
        role="dialog"
        aria-modal="true"
        aria-label={L.title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900 text-base">{L.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={L.cancel}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex gap-0 px-5 pt-3 flex-shrink-0">
          {Object.entries(L.tabs).map(([code, label]) => (
            <button
              key={code}
              onClick={() => switchLang(code)}
              className={`flex-1 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                searchLang === code
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="px-5 pb-3 pt-2 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder={L.placeholder}
                className="w-full min-h-[44px] pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <button
              onClick={() => doSearch()}
              disabled={loading}
              className="min-h-[44px] px-4 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
          </div>

          {/* Quick suggestions */}
          {results.length === 0 && !loading && !error && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {L.suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); doSearch(s); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors min-h-[36px]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-2 min-h-0">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">{L.searching}</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          )}

          {!loading && !error && results.map(verse => {
            const isSelected = selectedVerse?.result_id === verse.result_id;
            return (
              <div
                key={verse.result_id}
                className={`rounded-xl border-2 p-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/30'
                }`}
                onClick={() => handleSelect(verse)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-1">{verse.reference_text}</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">
                      "{verse.verse_text}"
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelect(verse); }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg min-h-[36px] transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {isSelected ? <span className="flex items-center gap-1"><Check size={11} /> {L.select}</span> : L.select}
                  </button>

                  {config.audio_fileset_id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); /* audio handled via BibleVerseAudioPlayer */ }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg min-h-[36px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <Volume2 size={11} /> {L.playAudio}
                    </button>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpen(verse); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg min-h-[36px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1 ml-auto"
                  >
                    <ExternalLink size={11} /> {L.open}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected verse preview */}
        {selectedVerse && (
          <div className="mx-5 mb-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex-shrink-0">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">{L.selected}</p>
            <p className="text-sm font-semibold text-gray-800">{selectedVerse.reference_text}</p>
            <p className="text-xs text-gray-500 italic line-clamp-2 mt-0.5">"{selectedVerse.verse_text}"</p>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            {L.cancel}
          </button>
          <button
            onClick={handleAttach}
            disabled={!selectedVerse || saving}
            className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
            {L.attach}
          </button>
        </div>
      </div>
    </div>
  );
}