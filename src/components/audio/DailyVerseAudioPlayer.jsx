import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import { useLanguageStore } from '@/components/languageStore';

export default function DailyVerseAudioPlayer({ verse }) {
  const audioLanguage = useLanguageStore((s) => s.audioLanguage);
  const [showPlayer, setShowPlayer] = useState(false);

  if (!verse) return null;

  const fullText = `${verse.reference}. ${verse.text}. ${verse.explanation || ''}`;

  return (
    <>
      {showPlayer && (
        <AudioPlayer
          text={fullText}
          title={`${verse.reference} - Daily Verse`}
          audioLanguage={audioLanguage}
        />
      )}

      <button
        onClick={() => setShowPlayer(!showPlayer)}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
      >
        {showPlayer ? '🔊 Hide Audio Player' : '🔊 Listen to Verse'}
      </button>
    </>
  );
}