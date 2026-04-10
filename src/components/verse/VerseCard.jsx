import React from 'react';
import { Play, ExternalLink, X } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function VerseCard({ verse, uiLang, onRemove, onPlay }) {
  const langLabel = verse.language_code === 'om' ? 'Afaan Oromoo' : 'English';
  const playLabel = verse.language_code === 'om' ? 'Dhaggeeffadhu' : 'Play Audio';
  const openLabel = verse.language_code === 'om' ? 'Bani' : 'Open';

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">📖 {verse.reference_text}</p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{verse.verse_text}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{langLabel}</span>
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            aria-label={t(uiLang, 'common.remove')}
            className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        {verse.audio_fileset_id && onPlay && (
          <button
            onClick={() => onPlay(verse)}
            className="flex items-center gap-1 text-xs px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
          >
            <Play size={12} /> {playLabel}
          </button>
        )}
        <button className="flex items-center gap-1 text-xs px-3 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 min-h-[44px]">
          <ExternalLink size={12} /> {openLabel}
        </button>
      </div>
    </div>
  );
}