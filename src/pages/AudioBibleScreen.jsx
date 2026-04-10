/**
 * AudioBibleScreen — production-ready audio Bible page
 * Auto-discovers versions from Bible Brain, streams audio, sync text when timing available
 */
import React, { useState } from 'react';
import { Volume2, Globe, ChevronDown, BookOpen, Car, AlignLeft, X } from 'lucide-react';
import { useAudioBible } from '../components/audiobible/useAudioBible';
import AudioVersionPicker from '../components/audiobible/AudioVersionPicker';
import AudioBookChapterPicker from '../components/audiobible/AudioBookChapterPicker';
import AudioPlayer from '../components/audiobible/AudioPlayer';
import SyncTextReader from '../components/audiobible/SyncTextReader';

const LANGUAGES = [
  { code: 'en',  name: 'English',       flag: '🇺🇸' },
  { code: 'om',  name: 'Afaan Oromoo',  flag: '🇪🇹' },
  { code: 'am',  name: 'Amharic',       flag: '🇪🇹' },
  { code: 'ar',  name: 'العربية',       flag: '🇸🇦', rtl: true },
  { code: 'fr',  name: 'Français',      flag: '🇫🇷' },
  { code: 'sw',  name: 'Kiswahili',     flag: '🇰🇪' },
  { code: 'tir', name: 'Tigrinya',      flag: '🇪🇷' },
  { code: 'tig', name: 'Tigrayit',      flag: '🇪🇷' },
  { code: 'pt',  name: 'Português',     flag: '🇧🇷' },
  { code: 'es',  name: 'Español',       flag: '🇪🇸' },
  { code: 'hi',  name: 'हिन्दी',         flag: '🇮🇳' },
  { code: 'de',  name: 'Deutsch',       flag: '🇩🇪' },
];

export default function AudioBibleScreen() {
  const a = useAudioBible();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showText, setShowText] = useState(false);
  const [drivingMode, setDrivingMode] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === a.lang) || LANGUAGES[0];
  const currentBook = a.books.find(b => b.bookId === a.bookId);
  const isRTL = currentLang.rtl;

  // ── Driving Mode ─────────────────────────────────────────────────────────────
  if (drivingMode) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <Car className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-widest">Driving Mode</span>
          </div>
          <button onClick={() => setDrivingMode(false)} className="text-gray-400 hover:text-white text-sm px-3 py-1">
            Exit
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <AudioPlayer
              bookName={currentBook?.bookName}
              chapter={a.chapter}
              isPlaying={a.isPlaying}
              loading={a.audioLoading}
              error={a.audioError}
              currentTime={a.currentTime}
              duration={a.duration}
              speed={a.speed}
              setSpeed={a.setSpeed}
              sleepMinutes={a.sleepMinutes}
              sleepRemaining={a.sleepRemaining}
              togglePlay={a.togglePlay}
              seekBy={a.seekBy}
              seekTo={a.seekTo}
              nextChapter={a.nextChapter}
              prevChapter={a.prevChapter}
              startSleepTimer={a.startSleepTimer}
              cancelSleepTimer={a.cancelSleepTimer}
              audioUrl={a.audioUrl}
              drivingMode
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Normal Mode ───────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gradient-to-b from-indigo-50 to-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Audio Bible</h1>
              <p className="text-xs text-gray-400">Powered by Bible Brain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {a.hasVerseTiming && (
              <button
                onClick={() => setShowText(v => !v)}
                className={`p-2 rounded-xl border transition-all ${showText ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:border-indigo-300'}`}
                title="Toggle text"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setDrivingMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Drive</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── Top Card: Language + Version ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">

          {/* Language row */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1.5">Language</p>
            <button
              onClick={() => setShowLangPicker(v => !v)}
              className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-indigo-700 transition-colors"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>{currentLang.flag} {currentLang.name}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLangPicker ? 'rotate-180' : ''}`} />
            </button>

            {showLangPicker && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-50">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { a.setLang(l.code); setShowLangPicker(false); }}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                      a.lang === l.code
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="text-lg leading-tight">{l.flag}</span>
                    <span className="mt-0.5 text-center leading-tight">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Version picker */}
          <div className="border-t border-gray-50 pt-4">
            <AudioVersionPicker
              lang={a.lang}
              versions={a.versions}
              selectedVersion={a.selectedVersion}
              onSelect={a.setSelectedVersion}
              loading={a.catalogLoading}
              error={a.catalogError}
            />
          </div>
        </div>

        {/* ── Book & Chapter ── */}
        {a.selectedVersion && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-700">Book & Chapter</span>
            </div>
            <AudioBookChapterPicker
              books={a.books}
              booksLoading={a.booksLoading}
              bookId={a.bookId}
              chapter={a.chapter}
              onBookChange={a.setBookId}
              onChapterChange={a.setChapter}
            />
          </div>
        )}

        {/* ── Player ── */}
        {a.selectedVersion && (
          <AudioPlayer
            bookName={currentBook?.bookName || a.bookId}
            chapter={a.chapter}
            isPlaying={a.isPlaying}
            loading={a.audioLoading}
            error={a.audioError}
            currentTime={a.currentTime}
            duration={a.duration}
            speed={a.speed}
            setSpeed={a.setSpeed}
            sleepMinutes={a.sleepMinutes}
            sleepRemaining={a.sleepRemaining}
            togglePlay={a.togglePlay}
            seekBy={a.seekBy}
            seekTo={a.seekTo}
            nextChapter={a.nextChapter}
            prevChapter={a.prevChapter}
            startSleepTimer={a.startSleepTimer}
            cancelSleepTimer={a.cancelSleepTimer}
            audioUrl={a.audioUrl}
          />
        )}

        {/* ── Auto-play toggle ── */}
        {a.selectedVersion && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Auto-play next chapter</p>
              <p className="text-xs text-gray-400 mt-0.5">Continue listening automatically</p>
            </div>
            <button
              onClick={() => a.setAutoPlayNext(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${a.autoPlayNext ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${a.autoPlayNext ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        )}

        {/* ── Sync Text ── */}
        {a.selectedVersion && showText && a.hasVerseTiming && (
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-700">Chapter Text</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Synced</span>
              </div>
              <button onClick={() => setShowText(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SyncTextReader
              bibleId={a.selectedVersion?.bibleId}
              bookId={a.bookId}
              chapter={a.chapter}
              verseItems={a.verseItems}
              activeVerseIdx={a.activeVerseIdx}
              onSeekToVerse={a.seekTo}
              hasVerseTiming={a.hasVerseTiming}
            />
          </div>
        )}

        {/* ── Empty state ── */}
        {!a.selectedVersion && !a.catalogLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Volume2 className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">Ready to listen?</p>
            <p className="text-sm text-gray-400 mt-1">Select a language above to discover available audio Bible versions.</p>
          </div>
        )}

      </div>
    </div>
  );
}