import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Car, BookOpen, Volume2, ChevronRight, AlertCircle, Download, CheckCircle, WifiOff, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBibleIsPlayer } from '../components/audiobible/useBibleIsPlayer';
import AudioBiblePlayer from '../components/audiobible/AudioBiblePlayer';
import FilesetSelector from '../components/audiobible/FilesetSelector';
import BookChapterNav, { BOOK_NAMES } from '../components/audiobible/BookChapterNav';
import SyncTextReader from '../components/audiobible/SyncTextReader';
import { useOfflineDownloads } from '@/hooks/useOfflineDownloads';
import { useVerseSync } from '@/hooks/useVerseSync';
import { useReadingStreak } from '@/hooks/useReadingStreak';
import { useDailyVerseNotification } from '@/components/notifications/DailyVerseNotificationService';
import StreakCounter from '@/components/gamification/StreakCounter';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
];

export default function AudioBibleV2() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('audio_bible_lang') || 'en');
  const [drivingMode, setDrivingMode] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const player = useBibleIsPlayer();
  const { downloads, saveOffline, deleteOffline } = useOfflineDownloads();
  const [downloadingChapter, setDownloadingChapter] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const { streak, recordRead } = useReadingStreak();
  const { scheduleNotification } = useDailyVerseNotification();

  // Verse sync from timing data + current playback time
  const activeVerse = useVerseSync(player.timing || [], player.currentTime || 0);

  const downloadId = player.fileset ? `${player.fileset.filesetId}-${player.bookId}-${player.chapter}` : null;
  const isDownloaded = downloads.some(d => d.id === downloadId);

  const handleDownload = async () => {
    if (!player.audioUrl || !player.fileset || !downloadId) return;
    setDownloadingChapter(true);
    setDownloadError('');
    try {
      await saveOffline({
        id: downloadId,
        url: player.audioUrl,
        meta: {
          filesetId: player.fileset.filesetId,
          versionName: player.fileset.name || '',
          bookId: player.bookId,
          chapter: player.chapter,
          language: lang,
        },
      });
    } catch (err) {
      setDownloadError(err.message || 'Download failed');
    } finally {
      setDownloadingChapter(false);
    }
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Record read when a verse plays
  useEffect(() => {
    if (player.isPlaying && player.fileset) {
      recordRead();
    }
  }, [player.isPlaying, player.fileset, recordRead]);

  // Persist language choice
  useEffect(() => {
    localStorage.setItem('audio_bible_lang', lang);
  }, [lang]);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  // ── Driving Mode ─────────────────────────────────────────────────────────────
  if (drivingMode) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <Car className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-widest">Driving Mode</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => setDrivingMode(false)}
            className="text-gray-400 hover:text-white"
          >
            Exit
          </Button>
        </div>

        {/* Book / Chapter selector (simplified) */}
        <div className="px-6 py-4">
          <div className="bg-gray-800 rounded-2xl p-4">
            <BookChapterNav
              bookId={player.bookId}
              chapter={player.chapter}
              onBookChange={player.setBookId}
              onChapterChange={player.setChapter}
              availableBooks={player.booksList}
            />
          </div>
        </div>

        {/* Player — big controls */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-lg">
            <AudioBiblePlayer
              bookId={player.bookId}
              chapter={player.chapter}
              bookLabel={BOOK_NAMES[player.bookId]}
              isPlaying={player.isPlaying}
              loading={player.loading}
              error={player.error}
              speed={player.speed}
              setSpeed={player.setSpeed}
              duration={player.duration}
              currentTime={player.currentTime}
              sleepMinutes={player.sleepMinutes}
              sleepRemaining={player.sleepRemaining}
              togglePlay={player.togglePlay}
              seekBy={player.seekBy}
              seekTo={player.seekTo}
              nextChapter={player.nextChapter}
              prevChapter={player.prevChapter}
              startSleepTimer={player.startSleepTimer}
              cancelSleepTimer={player.cancelSleepTimer}
              drivingMode
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Normal Mode ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Audio Bible</h1>
              <p className="text-xs text-gray-500">Powered by Bible Brain · 1,400+ languages</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StreakCounter count={streak} />
            {/* Driving mode */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrivingMode(true)}
              className="gap-1.5 text-gray-600 border-gray-200"
            >
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Driving</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Language picker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">Language</span>
            </div>
            <button
              onClick={() => setShowLangPicker(v => !v)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <span>{currentLang.flag} {currentLang.name}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showLangPicker ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showLangPicker && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-50">
              {SUPPORTED_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); player.setFileset(null); setShowLangPicker(false); }}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                    lang === l.code
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="mt-0.5 text-center leading-tight">{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio version selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <FilesetSelector
            lang={lang}
            selectedFileset={player.fileset}
            onSelect={player.setFileset}
          />
        </div>

        {/* Error notice */}
        {player.error && !player.loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{player.error}</p>
          </div>
        )}

        {/* Friendly empty state when no version selected */}
        {!player.fileset && !player.loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <Volume2 className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Ready to listen?</p>
            <p className="text-sm text-gray-400 mt-1">Select a language above, then choose an audio version to begin.</p>
          </div>
        )}

        {/* Book + Chapter navigation */}
        {player.fileset && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">Book & Chapter</span>
            </div>
            <BookChapterNav
              bookId={player.bookId}
              chapter={player.chapter}
              onBookChange={player.setBookId}
              onChapterChange={player.setChapter}
              availableBooks={player.booksList}
            />
          </div>
        )}

        {/* Player */}
        {player.fileset && (
          <AudioBiblePlayer
            bookId={player.bookId}
            chapter={player.chapter}
            bookLabel={BOOK_NAMES[player.bookId]}
            isPlaying={player.isPlaying}
            loading={player.loading}
            error={player.error}
            speed={player.speed}
            setSpeed={player.setSpeed}
            duration={player.duration}
            currentTime={player.currentTime}
            sleepMinutes={player.sleepMinutes}
            sleepRemaining={player.sleepRemaining}
            togglePlay={player.togglePlay}
            seekBy={player.seekBy}
            seekTo={player.seekTo}
            nextChapter={player.nextChapter}
            prevChapter={player.prevChapter}
            startSleepTimer={player.startSleepTimer}
            cancelSleepTimer={player.cancelSleepTimer}
            audioUrl={player.audioUrl}
            filesetId={player.fileset?.filesetId}
          />
        )}

        {/* Offline download button */}
        {player.fileset && player.audioUrl && (
          <div className="flex items-center gap-3">
            {isDownloaded ? (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Saved offline
                <button
                  onClick={() => deleteOffline(downloadId)}
                  className="ml-2 text-xs text-gray-400 hover:text-red-500 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloadingChapter}
                className="gap-1.5 text-indigo-600 border-indigo-200"
              >
                <Download className="w-4 h-4" />
                {downloadingChapter ? 'Downloading…' : 'Save Offline'}
              </Button>
            )}
            {downloadError && <p className="text-xs text-red-500">{downloadError}</p>}
          </div>
        )}

        {/* Sync text reader */}
        {player.fileset && player.textVerses?.length > 0 && (
          <SyncTextReader
            verses={player.textVerses}
            activeVerse={activeVerse}
            bookId={player.bookId}
            chapter={player.chapter}
            currentTime={player.currentTime || 0}
            onSeekToVerse={(verse) => {
              const point = (player.timing || []).find(t => t.verse === verse);
              if (point && player.seekTo) player.seekTo(point.start);
            }}
          />
        )}

        {/* Auto-play next toggle */}
        {player.fileset && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Auto-play next chapter</p>
              <p className="text-xs text-gray-500">Continue listening automatically</p>
            </div>
            <button
              onClick={() => player.setAutoPlayNext(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                player.autoPlayNext ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  player.autoPlayNext ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/offline-library" className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:border-indigo-200 transition-all">
            <WifiOff className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Offline Library</p>
              <p className="text-xs text-slate-400">Downloaded chapters</p>
            </div>
          </Link>
          <Link to="/my-annotations" className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:border-indigo-200 transition-all">
            <Bookmark className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">My Journal</p>
              <p className="text-xs text-slate-400">Saved verses & notes</p>
            </div>
          </Link>
        </div>

        {/* Info box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs text-indigo-700">
            <strong>Bible Brain</strong> provides licensed audio Bibles in 1,400+ languages from Faith Comes By Hearing.
            Audio streams directly — no large downloads required.
          </p>
        </div>

      </div>
    </div>
  );
}