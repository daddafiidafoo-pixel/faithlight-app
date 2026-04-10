import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerseAudioPlayer from '@/components/verse/VerseAudioPlayer';

const UI = {
  en: {
    label: 'Attached Verse',
    audioUnavailable: 'Audio not available for this verse',
    open: 'Open',
  },
  om: {
    label: 'Aayata Maxxanfame',
    audioUnavailable: 'Sagaleen aayata kanaaf hin jiru',
    open: 'Bani',
  },
};

/**
 * AttachedVerseCard
 *
 * Renders a compact card for a verse attached to a prayer request / comment / reply.
 *
 * Props:
 *   verse   – AttachedVerse record from DB
 *   uiLang  – 'en' | 'om'
 */
export default function AttachedVerseCard({ verse, uiLang = 'en' }) {
  const navigate = useNavigate();
  const L = UI[uiLang] || UI.en;

  if (!verse) return null;

  const handleOpen = () => {
    navigate(
      `/BibleReaderPage?book=${verse.book_id}&chapter=${verse.chapter}&verse=${verse.verse_start}&lang=${verse.language_code}&bibleId=${verse.bible_id}`
    );
  };

  const langBadge = verse.language_code === 'om' ? 'Afaan Oromoo' : 'English';

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-indigo-500" />
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">{L.label}</span>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            {langBadge}
          </span>
        </div>

        {/* Reference */}
        <p className="text-sm font-bold text-gray-900 mb-1">{verse.reference_text}</p>

        {/* Verse text */}
        <p className="text-sm text-gray-600 italic leading-relaxed mb-2">
          "{verse.verse_text}"
        </p>

        {/* Audio Player */}
        {verse.audio_fileset_id && (
          <div className="mb-2 -mx-3 -mb-3 px-3 py-3 border-t border-indigo-100 bg-indigo-100">
            <VerseAudioPlayer
              bookId={verse.book_id}
              chapter={verse.chapter}
              verseStart={verse.verse_start}
              verseEnd={verse.verse_end}
              referenceText={verse.reference_text}
              audioFilesetId={verse.audio_fileset_id}
              language={verse.language_code}
              compact={true}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpen}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 min-h-[36px] px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
          >
            <ExternalLink size={12} /> {L.open}
          </button>
        </div>
      </div>
    </div>
  );
}