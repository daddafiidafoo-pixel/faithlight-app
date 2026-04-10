import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { getChapterAudio, ensureTranslationForLanguage, getSafeVerse } from '../components/audio/audioGuards';
import OfflineBibleStatus from '../components/bible/OfflineBibleStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, Pause, SkipBack, SkipForward, Loader2, Car, List, Settings, Sparkles, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TranslationSelectorHeader from '../components/TranslationSelectorHeader';
import DailyVerseMini from '../components/DailyVerseMini';
import AIVoiceSelector from '../components/audio/AIVoiceSelector';
import PlaylistManager from '../components/audio/PlaylistManager';
import PlaylistBuilder from '../components/audio/PlaylistBuilder';
import VoiceTranslateModal from '../components/translation/VoiceTranslateModal';
import TranslationHistory from '../components/translation/TranslationHistory';
import OfflineAudioDownloader from '../components/audio/OfflineAudioDownloader';
import OfflineStorageManager from '../components/audio/OfflineStorageManager';
import BookmarkManager from '../components/audio/BookmarkManager.jsx';
import { MyBookmarksTab, BookmarkButton, useAudioBookmarks } from '../components/audio/AudioTimestampBookmarks.jsx';
import VerseHighlighter from '../components/audio/VerseHighlighter.jsx';
import NowPlayingVerse from '../components/audio/NowPlayingVerse.jsx';
import BookOfflineDownloader from '../components/audio/BookOfflineDownloader.jsx';
import OfflineLibraryManager from '../components/audio/OfflineLibraryManager.jsx';
import { useAudioPlayerSync } from '../components/audio/AudioPlayerSync';
import PlaybackSpeedControl from '../components/audio/PlaybackSpeedControl';
import AdvancedBibleSearch from '../components/audio/AdvancedBibleSearch';
import VerseSharer from '../components/audio/VerseSharer';
import CommunityVerseDiscussion from '../components/community/CommunityVerseDiscussion';
import OfflineChapterDownloader from '../components/audio/OfflineChapterDownloader';
import OfflineStorageIndicator from '../components/audio/OfflineStorageIndicator';
import SmartAudioPlayer from '../components/audio/SmartAudioPlayer';
import PlaylistLibrary from '../components/audio/PlaylistLibrary';
import PlaylistQueueViewer from '../components/audio/PlaylistQueueViewer';
import FeaturedPlaylists from '../components/audio/FeaturedPlaylists';
import AudioQueue from '../components/audio/AudioQueue';
import PublicPlaylistsDiscovery from '../components/audio/PublicPlaylistsDiscovery';
import HighlightCollection from '../components/audio/HighlightCollection';
import VerseNotePanel from '../components/audio/VerseNotePanel';
import ChapterSummaryGenerator from '../components/bible/ChapterSummaryGenerator';
import MemoryModePanel from '../components/memory/MemoryModePanel';
import OfflineAudioPackDownloader from '../components/offline/OfflineAudioPackDownloader';
import OfflineAudioPlayback from '../components/audio/OfflineAudioPlayback';
import InlineSpeedSleepControls from '../components/audio/InlineSpeedSleepControls';
import BackgroundDownloadManager from '../components/audio/BackgroundDownloadManager';
import PlaylistCommunityHub from '../components/audio/PlaylistCommunityHub';
import BookmarksCommunityHub from '../components/audio/BookmarksCommunityHub';
import BibleTranslationDownloadManager from '../components/audio/BibleTranslationDownloadManager';
import ChapterAISummaryPanel from '../components/audio/ChapterAISummaryPanel';
import { toast } from 'sonner';
import { logEvent, Events } from '@/components/services/analytics/eventLogger';
import { useI18n } from '../components/I18nProvider';
import { resolveAudioMode, getAudioConfig } from '../components/audio/audioBibleConfig';
import { useAppStore } from '../components/store/appStore';
import { getFallbackNotice } from '../lib/bibleConfig';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalm': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Songs': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3,
  'Haggai': 2, 'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1,
  'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

export default function AudioBible() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { audioLanguage } = useAppStore();
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState('3');
  const [translation, setTranslation] = useState(() => {
    const stored = localStorage.getItem('preferred_translation');
    const valid = (stored && stored !== 'undefined' && stored !== 'null') ? stored : 'WEB';
    // Auto-heal corrupted localStorage
    if (stored !== valid) localStorage.setItem('preferred_translation', valid);
    return valid;
  });
  // Ensure translation is never undefined/null/string-"undefined" (guard against bad localStorage state)
  const safeTranslation = (translation && translation !== 'undefined' && translation !== 'null') ? translation : 'WEB';
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(null);
  const [fullChapter, setFullChapter] = useState(true);
  const [repeatMode, setRepeatMode] = useState(false);
  const [autoPlayNextVerse, setAutoPlayNextVerse] = useState(true);
  const [resumeLastSession, setResumeLastSession] = useState(true);
  const [autoPlayNextChapter, setAutoPlayNextChapter] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylistBuilder, setShowPlaylistBuilder] = useState(null);
  const [playlistQueue, setPlaylistQueue] = useState(null);
  const [currentPlaylistItem, setCurrentPlaylistItem] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const saved = localStorage.getItem('ai_voice_settings');
    return saved ? JSON.parse(saved) : {
      voice: { id: 'nova', name: 'Nova', gender: 'female' },
      speed: 1,
      pitch: 1,
      volume: 1,
      backgroundPlayback: true,
      accent: 'american',
      style: 'natural'
    };
  });
  const bookmarkHook = useAudioBookmarks();
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showVoiceTranslate, setShowVoiceTranslate] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const synth = useRef(window.speechSynthesis);
  const sleepTimerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Fetch user & preload starter pack
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }

      // Skip starter pack preload for now (non-critical feature)
      // Preload would go here once backend is stable
    };
    fetchUser();
  }, []);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('audio_bible_prefs');
    if (saved) {
      const prefs = JSON.parse(saved);
      setResumeLastSession(prefs.resumeLastSession ?? true);
      setAutoPlayNextChapter(prefs.autoPlayNextChapter ?? false);
      
      if (prefs.resumeLastSession && prefs.lastBook && prefs.lastChapter && prefs.lastVerseIndex !== undefined) {
        setBook(prefs.lastBook);
        setChapter(prefs.lastChapter);
        setCurrentVerseIndex(prefs.lastVerseIndex);
      }
    }
  }, []);

  // Save voice settings
  useEffect(() => {
    localStorage.setItem('ai_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  // Fetch verses with guards
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const { data: verses = [], isLoading, isError } = useQuery({
    queryKey: ['bibleVerses', book, chapter, safeTranslation],
    queryFn: async () => {
      if (!book || !chapter) return [];
      setAudioUnavailable(false);
      try {
        const result = await getChapterAudio({
          languageCode: 'en',
          translationId: safeTranslation,
          bookKey: book,
          chapterNumber: parseInt(chapter)
        });
        if (!result.ok || !result.data?.length) {
          console.warn(`[AudioBible] Chapter load failed: ${result.error}`);
          setAudioUnavailable(true);
          return [];
        }
        return result.data || [];
      } catch (err) {
        console.warn('[AudioBible] getChapterAudio threw:', err?.message);
        setAudioUnavailable(true);
        return [];
      }
    },
    enabled: !!book && !!chapter,
    throwOnError: false,
    retry: 1
  });

  // Setup background playback with Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const totalChapters = CHAPTER_COUNTS[book] || 1;
    const goNextChapter = () => {
      if (parseInt(chapter) < totalChapters) {
        setChapter(c => (parseInt(c) + 1).toString());
        setCurrentVerseIndex(0);
        setIsPlaying(true);
      }
    };
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${book} ${chapter} — ${safeTranslation}`,
      artist: 'FaithLight Audio Bible',
      album: book,
      artwork: [
        { src: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=96&h=96&fit=crop', sizes: '96x96', type: 'image/jpeg' },
        { src: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=256&h=256&fit=crop', sizes: '256x256', type: 'image/jpeg' },
        { src: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=512&h=512&fit=crop', sizes: '512x512', type: 'image/jpeg' },
      ]
    });
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => { synth.current.cancel(); setIsPlaying(false); });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      synth.current.cancel();
      setCurrentVerseIndex(i => Math.max(0, i - 1));
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      synth.current.cancel();
      setCurrentVerseIndex(i => {
        const next = i + 1;
        if (next >= (verses?.length || 0)) { goNextChapter(); return 0; }
        return next;
      });
      setIsPlaying(true);
    });
    try {
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        synth.current.cancel(); setCurrentVerseIndex(i => Math.max(0, i - 1)); setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        synth.current.cancel(); setCurrentVerseIndex(i => Math.min((verses?.length || 1) - 1, i + 1)); setIsPlaying(true);
      });
    } catch (_) { /* not supported by all browsers */ }
  }, [book, chapter, translation, isPlaying, verses.length]);

  // Save preferences whenever they change
  useEffect(() => {
    const prefs = {
      resumeLastSession,
      autoPlayNextChapter,
      lastBook: book,
      lastChapter: chapter,
      lastVerseIndex: currentVerseIndex
    };
    localStorage.setItem('audio_bible_prefs', JSON.stringify(prefs));
  }, [resumeLastSession, autoPlayNextChapter, book, chapter, currentVerseIndex]);

  const chapters = chapter ? Array.from({ length: CHAPTER_COUNTS[book] || 1 }, (_, i) => i + 1) : [];

  // Save translation preference when it changes (only save valid values)
  useEffect(() => {
    if (safeTranslation) {
      localStorage.setItem('preferred_translation', safeTranslation);
    }
  }, [safeTranslation]);

  // Sync state with global audio player (for mini-player)
  useAudioPlayerSync({
    isPlaying,
    currentBook: book,
    currentChapter: chapter,
    currentVerseIndex,
    verses,
    speed,
    translation
  });

  // Sleep timer effect
  useEffect(() => {
    if (sleepTimer && isPlaying) {
      sleepTimerRef.current = setInterval(() => {
        setSleepTimeRemaining(prev => {
          if (prev <= 1) {
            synth.current.cancel();
            setIsPlaying(false);
            setSleepTimer(null);
            setSleepTimeRemaining(0);
            clearInterval(sleepTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [sleepTimer, isPlaying]);

  // Playback effect
  useEffect(() => {
    if (isPlaying && verses.length > 0) {
      playVerse();
    } else {
      synth.current.cancel();
    }
    return () => {
      synth.current.cancel();
    };
  }, [isPlaying, currentVerseIndex, speed, verses]);

  const playVerse = () => {
    if (!verses || verses.length === 0) return;

    // Recorded audio path (Bible Brain) — placeholder for when audioId is set
    if (audioMode.mode === 'recorded') {
      // TODO: fetch and play Bible Brain audio URL for this verse
      // For now fall through to TTS as a temporary bridge
      console.info('[AudioBible] Recorded audio mode — Bible Brain integration pending');
    }

    // TTS read-aloud path
    if (audioMode.mode === 'unavailable') {
      setIsPlaying(false);
      return;
    }

    synth.current.cancel();
    const verse = getSafeVerse(verses, currentVerseIndex);
    if (!verse) {
      console.error('[AudioBible] Verse not found at index:', currentVerseIndex);
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(verse.text);
    utterance.rate = speed * voiceSettings.speed;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Use the correct language voice for TTS
    const voices = synth.current.getVoices();
    const ttsLang = audioMode.ttsLang || 'en-US';
    const langVoice = voices.find(v => v.lang.toLowerCase().startsWith(ttsLang.split('-')[0]));
    const selectedVoice = voices.find(v => v.name.toLowerCase().includes(voiceSettings.voice.id));
    utterance.voice = selectedVoice || langVoice || null;
    if (ttsLang) utterance.lang = ttsLang;

    utterance.onend = () => {
      const maxVerse = fullChapter ? ((verses?.length) || 0) - 1 : (endVerse ? endVerse - 1 : ((verses?.length) || 0) - 1);
      if (repeatMode) {
        setIsPlaying(true);
      } else if (autoPlayNextVerse && currentVerseIndex < maxVerse) {
        setCurrentVerseIndex(currentVerseIndex + 1);
        setIsPlaying(true);
      } else if (autoPlayNextChapter) {
        handleAutoPlayNextChapter();
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[AudioBible] TTS error:', e.error);
      setIsPlaying(false);
      if (e.error !== 'interrupted') {
        toast.error('Read Aloud failed. This language may not be supported on your device.');
      }
    };

    synth.current.speak(utterance);
  };

  const handlePreviewVoice = async (voice, sampleText) => {
    synth.current.cancel();
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = voiceSettings.speed;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    const voices = synth.current.getVoices();
    const selectedVoice = voices.find(v => v.name.toLowerCase().includes(voice.id));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    synth.current.speak(utterance);
  };

  const handlePlaylistSelect = (playlist) => {
    setSelectedPlaylist(playlist);
    toast.success(`Playing playlist: ${playlist.title}`);
    // TODO: Implement playlist playback logic
  };

  const handleAutoPlayNextChapter = () => {
    const totalChapters = CHAPTER_COUNTS[book] || 1;
    if (parseInt(chapter) < totalChapters) {
      setChapter((parseInt(chapter) + 1).toString());
      setCurrentVerseIndex(0);
    } else {
      setIsPlaying(false);
    }
  };

  // Resolve audio mode based on app language (not user profile — that may be stale)
  const currentLang = audioLanguage || 'en';
  const audioMode = resolveAudioMode(currentLang);
  const audioConfig = getAudioConfig(currentLang);
  const bibleFallbackNotice = getFallbackNotice(currentLang);

  const handlePlayPause = () => {
    if (audioMode.mode === 'unavailable') {
      toast.error(`Audio is not available for ${audioConfig.label} yet. Switch to English to use Read Aloud.`);
      return;
    }
    if (!('speechSynthesis' in window) && audioMode.mode === 'tts') {
      toast.error('Your device does not support text-to-speech.');
      return;
    }
    if (!verses || verses.length === 0) {
      toast.error('No verses loaded. Please select a book and chapter first.');
      return;
    }
    if (isPlaying) {
      synth.current.pause();
      setIsPlaying(false);
      logEvent(Events.AUDIO_PAUSED, { book, chapter, verseIndex: currentVerseIndex, translation });
    } else {
      if (synth.current.paused) {
        synth.current.resume();
      }
      setIsPlaying(true);
      logEvent(Events.AUDIO_PLAYED, { book, chapter, translation });
    }
  };

  const handlePrevious = () => {
    synth.current.cancel();
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
     synth.current.cancel();
     if (verses?.length && currentVerseIndex < (verses.length || 0) - 1) {
       setCurrentVerseIndex(currentVerseIndex + 1);
       setIsPlaying(true);
     }
   };

  const setSleepTimerDuration = (minutes) => {
    if (!minutes || sleepTimer === minutes) {
      // toggle off
      clearInterval(sleepTimerRef.current);
      setSleepTimer(null);
      setSleepTimeRemaining(0);
    } else {
      clearInterval(sleepTimerRef.current);
      setSleepTimer(minutes);
      setSleepTimeRemaining(minutes * 60);
    }
  };

  const formatTimeRemaining = () => {
    const minutes = Math.floor(sleepTimeRemaining / 60);
    const seconds = sleepTimeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSearchSelectVerse = (verseData) => {
    setBook(verseData.book);
    setChapter(verseData.chapter.toString());
    setCurrentVerseIndex((verseData.verse || 1) - 1);
    setShowAdvancedSearch(false);
  };

  const generateAISummary = async (type = 'chapter') => {
    if (!verses?.length) return;
    
    setLoadingSummary(true);
    setShowSummary(true);
    
    try {
      const verseText = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
      const prompt = type === 'chapter' 
        ? `Provide a clear, concise summary of ${book} chapter ${chapter} based on the following verses. Focus on the main themes, key events, and spiritual lessons. Keep it under 150 words.\n\nVerses:\n${verseText}`
        : `Provide a brief verse-by-verse breakdown of ${book} chapter ${chapter}, highlighting the key point of each verse or verse group. Be concise.\n\nVerses:\n${verseText}`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });
      
      setAiSummary(response);
    } catch (error) {
      setAiSummary('Failed to generate summary. Please try again.');
      toast.error('Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: bgColor }}>
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="mb-8 sticky top-0 z-40 bg-opacity-95" style={{ backgroundColor: cardColor, paddingTop: '16px', paddingBottom: '16px', borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: textColor }}>Audio Bible 🎧</h1>
              <p className="text-base" style={{ color: mutedColor }}>Choose a book, chapter, and verses to listen hands-free.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                title="Voice settings"
                className="h-10 w-10"
                style={{ color: primaryColor }}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <TranslationSelectorHeader
                currentTranslation={safeTranslation}
                onTranslationChange={setTranslation}
                isDarkMode={isDarkMode}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle dark mode"
                className="h-10 w-10"
                style={{ color: primaryColor }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  {isDarkMode ? (
                    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
                  ) : (
                    <path d="M10 7C7.73528 7 6 8.73528 6 11C6 13.2647 7.73528 15 10 15C12.2647 15 14 13.2647 14 11C14 8.73528 12.2647 7 10 7ZM2 11C2 6.58172 5.58172 3 11 3C15.3333 3 19 6 20.35 10.3C21.9324 11.7296 21.9996 14.1116 20.5291 15.5821C19.0585 17.0527 16.6766 16.9855 15.2471 15.4031C15.2087 15.3605 15.1707 15.3174 15.133 15.2737C14.463 15.7397 13.5294 16.1 12.5 16.1C11.0294 16.1 9.87936 15.2699 9.38066 14.0788C8.42174 14.1904 7.56973 14.36 6.8 14.5721C5.04 15.0693 3.36 15.2 2.5 14C1 12 1 10 2 9C3.36 7.8 5.04 7.9307 6.8 8.4279C7.56973 8.64 8.42174 8.8096 9.38066 8.9212C9.87936 7.7301 11.0294 6.9 12.5 6.9C13.5294 6.9 14.463 7.2603 15.133 7.72633C15.1707 7.6826 15.2087 7.63952 15.2471 7.59694C16.6766 6.01451 19.0585 5.94727 20.5291 7.41787C21.9996 8.88847 21.9324 11.2704 20.35 12.7C19 16 15.3333 19 11 19C5.58172 19 2 15.4183 2 11Z"/>
                  )}
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Voice Settings Dialog */}
        <Dialog open={showVoiceSettings} onOpenChange={setShowVoiceSettings}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Voice Settings</DialogTitle>
            </DialogHeader>
            <AIVoiceSelector
              currentSettings={voiceSettings}
              onSettingsChange={setVoiceSettings}
              onPreview={handlePreviewVoice}
            />
          </DialogContent>
        </Dialog>

        {/* Advanced Bible Search Dialog */}
        {showAdvancedSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              style={{ backgroundColor: cardColor }}
            >
              <div className="p-6 sticky top-0 flex justify-between items-center" style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: cardColor }}>
                <h3 className="text-xl font-bold" style={{ color: textColor }}>Advanced Bible Search</h3>
                <button
                  onClick={() => setShowAdvancedSearch(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <AdvancedBibleSearch
                  onSelectVerse={handleSearchSelectVerse}
                  isDarkMode={isDarkMode}
                  selectedTranslation={translation}
                />
              </div>
            </div>
          </div>
        )}

        {/* Playlist Builder Dialog */}
        {showPlaylistBuilder && (
          <Dialog open={!!showPlaylistBuilder} onOpenChange={() => setShowPlaylistBuilder(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Build Playlist</DialogTitle>
              </DialogHeader>
              <PlaylistBuilder
                playlist={showPlaylistBuilder}
                onClose={() => setShowPlaylistBuilder(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Voice Translate Modal */}
        <VoiceTranslateModal
          isOpen={showVoiceTranslate}
          onClose={() => setShowVoiceTranslate(false)}
          selectedText={verses[currentVerseIndex] ? `${book} ${chapter}:${verses[currentVerseIndex].verse} - ${verses[currentVerseIndex].text}` : ''}
          userLanguage={user?.preferred_language_code || 'en'}
        />

        {/* Today's Verse */}
         <div className="mb-6">
           <DailyVerseMini isDarkMode={isDarkMode} />
         </div>

         {/* Offline Status */}
          <div className="mb-6">
            <OfflineBibleStatus languageCode={currentLang} translationId={safeTranslation} />
          </div>

         {/* Info Banner */}
          <Card className="mb-6" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2" style={{ color: textColor }}>
                   🚗🍳 {t('audio.listenAnywhere', 'Listen anywhere')}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>
                   {t('audio.selectVerseRange', 'Select a Book, Chapter, and Verse range, then tap Play.')}
                   <br />
                   {t('audio.perfectFor', 'Perfect for listening while driving, cooking, working, or walking.')}
                   <br />
                   {t('audio.continuousListening', 'Want continuous listening? Turn on Full Chapter or Auto-Continue.')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audio mode banner — shows what's actually available for this language */}
          {audioMode.mode === 'recorded' && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: isDarkMode ? '#1e2a1e' : '#F0FDF4', border: `1px solid ${isDarkMode ? '#2d4a2d' : '#BBF7D0'}` }}>
              <span className="text-xl mt-0.5">🎵</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#86efac' : '#15803D' }}>Recorded Audio Bible available</p>
                <p className="text-xs mt-1" style={{ color: isDarkMode ? '#6ee7b7' : '#166534' }}>
                  High-quality recorded audio for {audioConfig.label} is available for playback.
                </p>
              </div>
            </div>
          )}
          {audioMode.mode === 'tts' && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: isDarkMode ? '#1e2a1e' : '#F0FDF4', border: `1px solid ${isDarkMode ? '#2d4a2d' : '#BBF7D0'}` }}>
              <span className="text-xl mt-0.5">🔊</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#86efac' : '#15803D' }}>Read Aloud (device voice)</p>
                <p className="text-xs mt-1" style={{ color: isDarkMode ? '#6ee7b7' : '#166534' }}>
                  Your device will read the Bible text aloud. This is not recorded audio — it uses your device's built-in voice.
                </p>
              </div>
            </div>
          )}
          {audioMode.mode === 'unavailable' && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: isDarkMode ? '#2a1e1e' : '#FEF2F2', border: `1px solid ${isDarkMode ? '#4a2d2d' : '#FECACA'}` }}>
              <span className="text-xl mt-0.5">🔇</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#f87171' : '#DC2626' }}>
                  Audio not available for {audioConfig.label} yet
                </p>
                <p className="text-xs mt-1" style={{ color: isDarkMode ? '#fca5a5' : '#991B1B' }}>
                  Recorded audio for this language has not been verified yet, and your device has no voice for it either.
                  Switch to English to use Read Aloud.
                </p>
              </div>
            </div>
          )}

          {/* Bible text language fallback notice */}
          {bibleFallbackNotice && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: isDarkMode ? '#1e1e2a' : '#EEF2FF', border: `1px solid ${isDarkMode ? '#3a3a6a' : '#C7D2FE'}` }}>
              <span className="text-xl mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-medium" style={{ color: isDarkMode ? '#a5b4fc' : '#4338CA' }}>
                  {bibleFallbackNotice}
                </p>
              </div>
            </div>
          )}

         {/* Offline Audio Packs */}
           <div className="mb-8">
             <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
               <CardHeader>
                 <CardTitle style={{ color: textColor }}>📥 Download Audio for Offline</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-gray-600 mb-4">
                   Download Bible audio books or entire testaments for listening offline without internet.
                 </p>
                 <OfflineAudioPackDownloader language={currentLang} />
               </CardContent>
             </Card>
           </div>

         {/* Featured Playlists */}
           <div className="mb-8">
             <FeaturedPlaylists
              isDarkMode={isDarkMode}
              onPlaylistSelect={(playlist) => {
                setPlaylistQueue(playlist);
                setCurrentPlaylistItem(playlist.items?.[0]);
                if (playlist.items?.[0]) {
                  setBook(playlist.items[0].book);
                  setChapter(playlist.items[0].chapter.toString());
                  setCurrentVerseIndex(0);
                }
              }}
            />
          </div>

         {/* Tabs for Audio Player and Playlists */}
          <Tabs defaultValue="player" className="mb-6">
            <TabsList className="flex flex-wrap gap-1 h-auto mb-6 w-full">
              <TabsTrigger value="player" className="flex-1 text-xs">Player</TabsTrigger>
              <TabsTrigger value="myspots" className="flex-1 text-xs">
                My Spots {bookmarkHook.bookmarks.length > 0 && `(${bookmarkHook.bookmarks.length})`}
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex-1 text-xs">Queue</TabsTrigger>
              <TabsTrigger value="community" className="flex-1 text-xs">Community</TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex-1 text-xs">Bookmarks</TabsTrigger>
              <TabsTrigger value="downloads" className="flex-1 text-xs">Downloads</TabsTrigger>
              <TabsTrigger value="highlights" className="flex-1 text-xs">Highlights</TabsTrigger>
            </TabsList>

            <TabsContent value="player" className="space-y-6">

         {/* Advanced Search Button */}
         <div className="mb-6 text-center">
           <Button
             onClick={() => setShowAdvancedSearch(true)}
             className="gap-2"
             style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
             >
             🔍 {t('audio.advancedSearch', 'Advanced Search')}
             </Button>
         </div>

         {/* Book & Chapter Selection Card */}
         <Card className="mb-6" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
           <CardHeader>
             <CardTitle style={{ color: textColor }}>{t('audio.chooseReading', 'Choose Reading')}</CardTitle>
           </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{t('audio.book', 'Book')}</label>
                <Select value={book} onValueChange={(value) => { setBook(value); setCurrentVerseIndex(0); }}>
                  <SelectTrigger className="rounded-lg border" style={{ backgroundColor: cardColor, borderColor: borderColor, color: textColor }}>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {BIBLE_BOOKS.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                 <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{t('audio.chapter', 'Chapter')}</label>
                 <Select value={chapter} onValueChange={(value) => { setChapter(value); setCurrentVerseIndex(0); setStartVerse(1); setEndVerse(null); }} disabled={!book}>
                   <SelectTrigger className="rounded-lg border" style={{ backgroundColor: cardColor, borderColor: borderColor, color: textColor }}>
                     <SelectValue placeholder="Select chapter" />
                   </SelectTrigger>
                   <SelectContent className="max-h-60">
                     {chapters.map(c => (
                       <SelectItem key={c} value={c.toString()}>{c}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* Full Chapter Toggle */}
               <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
                 <label className="text-sm font-medium" style={{ color: textColor }}>✅ {t('audio.fullChapter', 'Listen to full chapter')}</label>
                 <input
                   type="checkbox"
                   checked={fullChapter}
                   onChange={(e) => { setFullChapter(e.target.checked); if (e.target.checked) { setStartVerse(1); setEndVerse(verses?.length || 0); } }}
                   className="w-5 h-5"
                   style={{ accentColor: primaryColor }}
                 />
               </div>

               {/* Verse Range - Only show when Full Chapter is OFF */}
               {!fullChapter && verses?.length > 0 && (
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{t('audio.startVerse', 'Start Verse')}</label>
                     <Select value={startVerse.toString()} onValueChange={(value) => { const v = parseInt(value); setStartVerse(v); if (endVerse && v > endVerse) setEndVerse(v); }}>
                       <SelectTrigger className="rounded-lg border" style={{ backgroundColor: cardColor, borderColor: borderColor, color: textColor }}>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="max-h-60">
                         {verses.map((v, idx) => (
                           <SelectItem key={idx} value={(idx + 1).toString()}>Verse {idx + 1}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{t('audio.endVerse', 'End Verse')}</label>
                     <Select value={endVerse ? endVerse.toString() : (verses?.length || 0).toString()} onValueChange={(value) => setEndVerse(parseInt(value))}>
                       <SelectTrigger className="rounded-lg border" style={{ backgroundColor: cardColor, borderColor: borderColor, color: textColor }}>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="max-h-60">
                         {verses.filter((v, idx) => idx + 1 >= startVerse).map((v, idx) => {
                           const verseNum = verses.indexOf(v) + 1;
                           return <SelectItem key={verseNum} value={verseNum.toString()}>Verse {verseNum}</SelectItem>
                         })}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Audio unavailable message */}
        {audioUnavailable && !isLoading && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-2xl">🔇</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">{t('audio.unavailable', 'Audio unavailable for this chapter.')}</p>
              <p className="text-xs text-amber-700 mt-0.5">{t('audio.tryAnother', 'Try a different translation or chapter.')}</p>
            </div>
          </div>
        )}

        {/* Chapter Summary Generator Button */}
         {verses?.length > 0 && (
          <div className="mb-6">
            <ChapterSummaryGenerator
              book={book}
              chapter={chapter}
              verses={verses}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* AI Summary Card */}
        {showSummary && verses?.length > 0 && (
          <Card className="mb-6" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Chapter Analysis
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSummary(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                  <span className="ml-3" style={{ color: mutedColor }}>{t('audio.generatingAnalysis', 'Generating analysis...')}</span>
                </div>
              ) : (
                <div>
                  <p className="text-base leading-relaxed mb-4" style={{ color: textColor }}>
                    {aiSummary}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAISummary('chapter')}
                      className="gap-2"
                      >
                      <FileText className="w-4 h-4" />
                      {t('audio.chapterAnalysis', 'Chapter Analysis')}
                      </Button>
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAISummary('verse')}
                      className="gap-2"
                      >
                      <FileText className="w-4 h-4" />
                      {t('audio.verseBreakdown', 'Verse Breakdown')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Now Playing Verse Display */}
        {verses?.length > 0 && isPlaying && (
          <div className="mb-6 sticky top-20 z-30">
            <NowPlayingVerse
              verses={verses}
              currentVerseIndex={currentVerseIndex}
              book={book}
              chapter={chapter}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {/* Verse Synchronization Display */}
        {verses?.length > 0 && (
          <div className="mb-6">
            <VerseHighlighter
              verses={verses}
              currentVerseIndex={currentVerseIndex}
              startVerse={startVerse}
              endVerse={endVerse}
              fullChapter={fullChapter}
            />
          </div>
        )}

        {/* Memory Mode Panel */}
        {verses?.length > 0 && (
          <div className="mb-6">
            <MemoryModePanel verses={verses} book={book} chapter={chapter} />
          </div>
        )}

        {/* Book Offline Downloader & Connection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Download Entire Books</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Download complete books for offline listening without internet connection.
                </p>
                <BookOfflineDownloader user={user} />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connection:</span>
                    <span className={isOnline ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                      {isOnline ? '🟢 Online' : '🟠 Offline'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {isOnline ? 'Downloads will auto-sync to your account' : 'Offline mode active'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Offline Library Manager */}
        <div className="mb-6">
          <OfflineLibraryManager user={user} isOnline={isOnline} />
        </div>

        {/* Chapter Offline Downloader & Storage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
              <CardHeader>
                <CardTitle style={{ color: textColor }}>Download This Chapter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: bgColor }}>
                  <div>
                    <p className="font-semibold" style={{ color: textColor }}>
                      {book} {chapter} ({safeTranslation})
                    </p>
                    <p className="text-sm" style={{ color: mutedColor }}>
                      Save for offline listening
                    </p>
                  </div>
                  <OfflineChapterDownloader
                    book={book}
                    chapter={parseInt(chapter)}
                    language={user?.preferred_language_code || 'en'}
                    translation={safeTranslation}
                      isDarkMode={isDarkMode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <OfflineStorageIndicator isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* Main Audio Controls Card */}
        {verses?.length > 0 && (
          <Card className="mb-6" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
            <CardContent className="pt-8 pb-8">
              {/* Current Reading Info */}
              <div className="text-center mb-8">
                <p className="text-2xl font-semibold mb-2" style={{ color: textColor }}>
                  {book} {chapter}:{fullChapter ? 'Full Chapter' : `${startVerse}${endVerse && endVerse !== verses.length ? `-${endVerse}` : '+'}`}
                  </p>
                 <p className="text-sm" style={{ color: mutedColor }}>
                   Verse {verses[currentVerseIndex]?.verse} of {fullChapter ? verses.length : (endVerse || verses.length)}
                 </p>
                 <p className="text-xs mt-1 font-medium" style={{ color: audioMode.mode === 'recorded' ? '#15803D' : audioMode.mode === 'tts' ? '#6B7280' : '#DC2626' }}>
                   {audioMode.mode === 'recorded' ? '🎵 Recorded Audio Bible' : audioMode.mode === 'tts' ? '🔊 Read Aloud (device voice)' : '🔇 Audio unavailable for this language'}
                 </p>
              </div>

              {/* Audio Control Buttons */}
              <div className="flex flex-col items-center gap-4 mb-8">
                {/* Main Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentVerseIndex === 0 || isLoading}
                    className="h-12 w-12"
                    title="Previous Verse"
                  >
                    <SkipBack className="w-6 h-6" style={{ color: primaryColor }} />
                  </Button>

                  <Button
                    size="icon"
                    onClick={handlePlayPause}
                    disabled={isLoading}
                    className={handsFreeMode ? "h-24 w-24" : "h-16 w-16"}
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    {isLoading ? (
                       <Loader2 className={`${handsFreeMode ? "w-12 h-12" : "w-8 h-8"} animate-spin`} />
                    ) : isPlaying ? (
                      <Pause className={handsFreeMode ? "w-12 h-12" : "w-8 h-8"} />
                    ) : (
                      <Play className={handsFreeMode ? "w-12 h-12 ml-2" : "w-8 h-8 ml-1"} />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentVerseIndex === verses.length - 1 || isLoading}
                    className="h-12 w-12"
                    title="Next Verse"
                  >
                    <SkipForward className="w-6 h-6" style={{ color: primaryColor }} />
                  </Button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentVerseIndex > 0) {
                        const newIndex = Math.max(0, currentVerseIndex - 3);
                        setCurrentVerseIndex(newIndex);
                        synth.current.cancel();
                        if (isPlaying) setIsPlaying(true);
                      }
                    }}
                    className="gap-1"
                    style={{ borderColor: borderColor }}
                  >
                    <span style={{ color: textColor }}>⏪ 15s</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRepeatMode(!repeatMode)}
                    className="gap-1"
                    style={{ 
                      borderColor: borderColor,
                      backgroundColor: repeatMode ? primaryColor : 'transparent',
                      color: repeatMode ? '#FFFFFF' : textColor
                    }}
                    title="Repeat current section"
                  >
                    🔁 Repeat
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentVerseIndex < (verses?.length || 0) - 1) {
                        const newIndex = Math.min((verses?.length || 0) - 1, currentVerseIndex + 3);
                        setCurrentVerseIndex(newIndex);
                        synth.current.cancel();
                        if (isPlaying) setIsPlaying(true);
                      }
                    }}
                    className="gap-1"
                    style={{ borderColor: borderColor }}
                  >
                    <span style={{ color: textColor }}>⏩ 30s</span>
                  </Button>
                </div>
              </div>

              {/* Inline Speed + Sleep Timer Controls */}
              <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                <InlineSpeedSleepControls
                  speed={speed}
                  onSpeedChange={setSpeed}
                  sleepTimer={sleepTimer}
                  sleepTimeRemaining={sleepTimeRemaining}
                  onSleepTimerChange={setSleepTimerDuration}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Offline Status Badge */}
              <div className="text-center mb-4 flex justify-center gap-2 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: isOnline ? '#10b981' : '#ef4444', color: '#FFFFFF' }}>
                  {isOnline ? '📡 Online' : '📴 Offline Mode'}
                </span>
              </div>

              {/* Bookmark Manager, Verse Sharer & Note */}
              <div className="flex justify-center gap-4 mb-4 flex-wrap">
                <BookmarkManager
                  book={book}
                  chapter={parseInt(chapter)}
                  verse={verses[currentVerseIndex]?.verse || 1}
                  endVerse={endVerse}
                  translation={safeTranslation}
                  user={user}
                />
                <BookmarkButton
                  book={book}
                  chapter={chapter}
                  verseIndex={currentVerseIndex}
                  verse={verses[currentVerseIndex]?.verse}
                  text={verses[currentVerseIndex]?.text}
                  translation={safeTranslation}
                  bookmarkHook={bookmarkHook}
                />
                <VerseSharer
                  verseText={verses[currentVerseIndex]?.text || ''}
                  verseRef={`${book} ${chapter}:${verses[currentVerseIndex]?.verse || 1}`}
                  isDarkMode={isDarkMode}
                  book={book}
                  chapter={chapter}
                />
              </div>
              {user && verses[currentVerseIndex] && (
                <div className="mb-4 px-2">
                  <VerseNotePanel
                    user={user}
                    book={book}
                    chapter={chapter}
                    verse={verses[currentVerseIndex]?.verse}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* AI Tools */}
              <div className="flex flex-col gap-3 px-1">
                <ChapterAISummaryPanel
                  book={book}
                  chapter={chapter}
                  verses={verses}
                  isDarkMode={isDarkMode}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowVoiceTranslate(true)}
                  className="gap-2 w-full sm:w-auto"
                  style={{ borderColor: borderColor, color: primaryColor }}
                >
                  🎙️ Voice Translate
                </Button>
              </div>
              </CardContent>
              </Card>
              )}

              {/* Community Discussion */}
              {verses?.length > 0 && (
                <div className="mb-6">
                  <CommunityVerseDiscussion
                    verseRef={`${book} ${chapter}:${verses[currentVerseIndex]?.verse || 1}`}
                    verseText={verses[currentVerseIndex]?.text || ''}
                    isDarkMode={isDarkMode}
                    user={user}
                  />
                </div>
              )}

        {/* Hands-Free Mode Card */}
        <Card className="mb-6" style={{ backgroundColor: handsFreeMode ? primaryColor : cardColor, border: `2px solid ${handsFreeMode ? primaryColor : borderColor}` }}>
          <CardHeader>
            <CardTitle style={{ color: handsFreeMode ? '#FFFFFF' : textColor }} className="flex items-center gap-2">
              🚗🍳 Hands-Free Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: handsFreeMode ? 'rgba(255,255,255,0.2)' : bgColor }}>
                <div>
                  <label className="text-sm font-medium block" style={{ color: handsFreeMode ? '#FFFFFF' : textColor }}>
                    Enable Hands-Free Mode
                  </label>
                  <p className="text-xs mt-1" style={{ color: handsFreeMode ? 'rgba(255,255,255,0.8)' : mutedColor }}>
                    Bigger buttons + screen stays awake
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={handsFreeMode}
                  onChange={(e) => {
                    setHandsFreeMode(e.target.checked);
                    if (e.target.checked && 'wakeLock' in navigator) {
                      navigator.wakeLock.request('screen').catch(err => console.log('Wake lock failed:', err));
                    }
                  }}
                  className="w-6 h-6"
                  style={{ accentColor: primaryColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Features Card */}
        <Card className="mb-6" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
          <CardHeader>
           <CardTitle style={{ color: textColor }}>{t('audio.autoontinueSettings', 'Auto-Continue Settings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Auto-continue verses */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
                <div>
                  <label className="text-sm font-medium" style={{ color: textColor }}>✅ {t('audio.continueToNextVerses', 'Continue to next verses automatically')}</label>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>{t('audio.playsVerses', 'Plays verses one after another')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPlayNextVerse}
                  onChange={(e) => setAutoPlayNextVerse(e.target.checked)}
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </div>

              {/* Auto-play Next Chapter Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
                <div>
                  <label className="text-sm font-medium" style={{ color: textColor }}>✅ {t('audio.continueToNextChapter', 'Continue to next chapter automatically')}</label>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>{t('audio.movestoNextChapter', 'Moves to the next chapter when finished')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPlayNextChapter}
                  onChange={(e) => setAutoPlayNextChapter(e.target.checked)}
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </div>

              {/* Resume Last Session Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
                <label className="text-sm font-medium" style={{ color: textColor }}>{t('audio.resumeLastListening', 'Resume last listening')}</label>
                <input
                  type="checkbox"
                  checked={resumeLastSession}
                  onChange={(e) => setResumeLastSession(e.target.checked)}
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </div>

              {/* Sleep Timer */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
                <label className="text-sm font-medium mb-3 block" style={{ color: textColor }}>{t('audio.sleepTimer', 'Sleep timer')}</label>
                <div className="flex gap-2">
                  {[10, 20, 30].map(minutes => (
                    <button
                      key={minutes}
                      onClick={() => setSleepTimerDuration(minutes)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: sleepTimer === minutes ? primaryColor : cardColor,
                        color: sleepTimer === minutes ? '#FFFFFF' : textColor,
                        border: `1px solid ${sleepTimer === minutes ? primaryColor : borderColor}`
                      }}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
            </TabsContent>

            <TabsContent value="myspots" className="space-y-4">
              <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <CardHeader>
                  <CardTitle style={{ color: textColor }}>🔖 My Listening Spots</CardTitle>
                </CardHeader>
                <CardContent>
                  <MyBookmarksTab
                    bookmarkHook={bookmarkHook}
                    isDarkMode={isDarkMode}
                    onJump={(bk, ch, vi) => {
                      setBook(bk);
                      setChapter(String(ch));
                      setCurrentVerseIndex(vi);
                      setIsPlaying(false);
                      toast.success(`Jumped to ${bk} ${ch}`);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <CardHeader>
                  <CardTitle style={{ color: textColor }}>🌍 Playlist Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlaylistCommunityHub
                    user={user}
                    isDarkMode={isDarkMode}
                    onPlaylistSelect={(playlist) => {
                      setPlaylistQueue(playlist);
                      setCurrentPlaylistItem(playlist.items?.[0]);
                      if (playlist.items?.[0]) {
                        setBook(playlist.items[0].book);
                        setChapter(playlist.items[0].chapter.toString());
                        setCurrentVerseIndex(0);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queue" className="space-y-6">
              <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <CardHeader>
                  <CardTitle style={{ color: textColor }}>🎵 Playback Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <AudioQueue
                    currentBook={book}
                    currentChapter={chapter}
                    currentTranslation={safeTranslation}
                    isDarkMode={isDarkMode}
                    onPlayItem={(item) => {
                      setBook(item.book);
                      setChapter(item.chapter.toString());
                      setCurrentVerseIndex((item.verseStart || 1) - 1);
                      setStartVerse(item.verseStart || 1);
                      setEndVerse(item.verseEnd || null);
                      setFullChapter(!item.verseEnd);
                      setIsPlaying(true);
                    }}
                  />
                </CardContent>
              </Card>

              {/* Also show playlist queue if active */}
              {playlistQueue && (
                <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                  <CardHeader>
                    <CardTitle style={{ color: textColor }}>▶ Now Playing: {playlistQueue.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlaylistQueueViewer
                      playlist={playlistQueue}
                      isDarkMode={isDarkMode}
                      currentPlaying={currentPlaylistItem}
                      onPlaylistItemSelect={(item) => {
                        setCurrentPlaylistItem(item);
                        setBook(item.book);
                        setChapter(item.chapter.toString());
                        setCurrentVerseIndex((item.startVerse || 1) - 1);
                        setStartVerse(item.startVerse || 1);
                        setEndVerse(item.endVerse || null);
                        setFullChapter(!item.endVerse);
                        setIsPlaying(true);
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <CardHeader>
                  <CardTitle style={{ color: textColor }}>🔖 My Bookmarks & Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <BookmarksCommunityHub
                    user={user}
                    isDarkMode={isDarkMode}
                    onNavigate={(bm) => {
                      setBook(bm.book);
                      setChapter(String(bm.chapter));
                      setCurrentVerseIndex((bm.verse || 1) - 1);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads" className="space-y-6">
              <BibleTranslationDownloadManager user={user} isDarkMode={isDarkMode} />
              <BackgroundDownloadManager user={user} isDarkMode={isDarkMode} />
            </TabsContent>

            <TabsContent value="discover" className="space-y-6">
              <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <CardHeader>
                  <CardTitle style={{ color: textColor }}>🌍 Discover Playlists</CardTitle>
                </CardHeader>
                <CardContent>
                  <PublicPlaylistsDiscovery
                    user={user}
                    isDarkMode={isDarkMode}
                    onPlaylistSelect={(playlist) => {
                      setPlaylistQueue(playlist);
                      setCurrentPlaylistItem(playlist.items?.[0]);
                      if (playlist.items?.[0]) {
                        setBook(playlist.items[0].book);
                        setChapter(playlist.items[0].chapter.toString());
                        setCurrentVerseIndex(0);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="highlights" className="space-y-6">
              <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <CardHeader>
                  <CardTitle style={{ color: textColor }}>🖊 My Highlight Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <HighlightCollection user={user} isDarkMode={isDarkMode} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}