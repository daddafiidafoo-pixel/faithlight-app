import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bibleService } from '@/services/bibleService';
import ImmersiveAudioBiblePlayer from '@/components/audio/ImmersiveAudioBiblePlayer';
import { useLanguageStore } from '@/components/languageStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AudioBiblePlayer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bibleLanguage = useLanguageStore(s => s.bibleLanguage);
  
  const [bookCode, setBookCode] = useState(searchParams.get('book') || 'JHN');
  const [chapter, setChapter] = useState(parseInt(searchParams.get('chapter') || 3));
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState('');

  // Load chapter verses and audio
  useEffect(() => {
    const loadChapter = async () => {
      try {
        setLoading(true);
        const chapterData = await bibleService.getChapter(bookCode, chapter, bibleLanguage);
        if (chapterData && chapterData.verses) {
          setVerses(chapterData.verses.map(v => v.text));
          
          // Fetch real audio URL from Bible Brain
          try {
            const audioData = await fetch(
              `https://api.scripture.api.bible/v1/bibles/ENGESV/chapters/${bookCode}${chapter}/audio?include=content&key=${import.meta.env.VITE_BIBLE_BRAIN_API_KEY}`
            ).then(r => r.json());
            
            if (audioData?.data?.content?.url) {
              setAudioUrl(audioData.data.content.url);
            } else {
              console.warn('No audio URL found for this chapter');
              setAudioUrl('');
            }
          } catch (audioErr) {
            console.error('Error fetching audio:', audioErr);
            setAudioUrl('');
          }
        }
      } catch (err) {
        console.error('Error loading chapter:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [bookCode, chapter, bibleLanguage]);

  const handlePreviousChapter = () => {
    if (chapter > 1) {
      const newChapter = chapter - 1;
      setChapter(newChapter);
      setSearchParams({ book: bookCode, chapter: newChapter });
    }
  };

  const handleNextChapter = () => {
    const newChapter = chapter + 1;
    setChapter(newChapter);
    setSearchParams({ book: bookCode, chapter: newChapter });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-slate-600">Loading audio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-20 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Audio Bible</h1>
        <p className="text-sm text-slate-600 mt-1">Listen while reading • Follow-along highlighting</p>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ImmersiveAudioBiblePlayer
          bookCode={bookCode}
          chapter={chapter}
          verses={verses}
          audioUrl={audioUrl}
        />

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePreviousChapter}
            disabled={chapter === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide">
              {bookCode} - Chapter {chapter}
            </p>
          </div>

          <button
            onClick={handleNextChapter}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="font-bold text-slate-900 mb-3">How to use the Audio Bible Player</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ Press play to listen to the scripture</li>
            <li>✓ Follow-along highlighting shows the current verse being spoken</li>
            <li>✓ Adjust playback speed (0.75x - 1.5x) to match your preference</li>
            <li>✓ Control volume and navigate chapters at your own pace</li>
            <li>✓ Use fullscreen mode for an immersive experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}