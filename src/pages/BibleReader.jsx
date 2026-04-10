import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncManager } from '@/components/offline/useSyncManager';
import SyncStatusIndicator from '@/components/offline/SyncStatusIndicator';
import { base44 } from '@/api/base44Client';
import { getChapter } from '@/components/lib/BibleCatalogProvider';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Settings, Copy, Check, MessageCircle, Loader2, Download, Wifi, WifiOff, BookOpen, Navigation, HardDrive, BookMarked, GitBranch, GraduationCap, CalendarDays, Sparkles, AlertCircle, MapPin } from 'lucide-react';
import VerseBookmarkButton from '../components/bible/VerseBookmarkButton';
import ChatMessage from '../components/ChatMessage';
import VerseHighlighter from '../components/VerseHighlighter';
import VerseNotes from '../components/VerseNotes';
import TranslationComparison from '../components/TranslationComparison';
import OfflineDownloadButton from '../components/OfflineDownloadButton';
import VerseSharer from '../components/VerseSharer';
import FloatingAudioBar from '../components/FloatingAudioBar';
import TranslationSelector from '../components/bible/TranslationSelector';
import BibleOfflineDownloadButton from '../components/BibleOfflineDownloadButton';
import StructuredOfflineDownloadButton from '../components/bible/StructuredOfflineDownloadButton';
import { OfflineStorage } from '../components/OfflineStorage';
import GoToVerse from '../components/GoToVerse';
import CommunityHighlights from '../components/bible/CommunityHighlights';
import ChapterDiscussionPanel from '../components/bible/ChapterDiscussionPanel';
import AIBibleAnalyzer from '../components/bible/AIBibleAnalyzer';
import AIHelperDrawer from '../components/ai/AIHelperDrawer';
import BibleDownloadManager from '../components/bible/BibleDownloadManager';
import StorageIndicator from '../components/bible/StorageIndicator';
import VerseShareImageModal from '../components/bible/VerseShareImageModal';
import AIVerseCommentary from '../components/bible/AIVerseCommentary';
import AICommentaryPanel from '../components/ai/AICommentaryPanel';
import SpacedRepetitionManager from '../components/bible/SpacedRepetitionManager';
import PersonalizedStudyPlanGenerator from '../components/bible/PersonalizedStudyPlanGenerator';
import AIQuizGenerator from '../components/bible/AIQuizGenerator';
import AIStudyToolsPanel from '../components/bible/AIStudyToolsPanel';
import ChapterView from '../components/bible/ChapterView';
import TranslationComparePanel from '../components/bible/TranslationComparePanel';
import MultiTranslationCompare from '../components/bible/MultiTranslationCompare';
import ReadingGoalWidget from '../components/bible/ReadingGoalWidget';
import BibleBookDownloader from '../components/bible/BibleBookDownloader';
import OfflineDownloadManager from '../components/bible/OfflineDownloadManager';
import OfflineManager from '../components/bible/OfflineManager';
import AIStudyPlanBuilder from '../components/bible/AIStudyPlanBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import { trackActivity } from '../components/community/BadgeTracker';
import DigitalNotebook from '../components/bible/DigitalNotebook';
import CrossReferencePanel from '../components/bible/CrossReferencePanel';
import CrossReferenceNetwork from '../components/bible/CrossReferenceNetwork';
import ScholarCommentaries from '../components/bible/ScholarCommentaries';
import Concordancer from '../components/bible/Concordancer';
import VerseAudioPlayer from '../components/bible/VerseAudioPlayer';
import VerseActions from '../components/bible/VerseActions';
import TextSelectionHighlighter from '../components/bible/TextSelectionHighlighter';
import AITheologyHub from '../components/bible/AITheologyHub';
import CommunityBibleHub from '../components/community/CommunityBibleHub';
import BibleScriptureSearch from '../components/bible/BibleScriptureSearch';
import InlineReadingGoal from '../components/bible/InlineReadingGoal';
import ChapterDownloadPanel from '../components/bible/ChapterDownloadPanel';
import OfflineReadingIndicator from '../components/bible/OfflineReadingIndicator';
import OfflineBookDownloader from '../components/bible/OfflineBookDownloader';
import AIVerseCommentaryPanel from '../components/bible/AIVerseCommentaryPanel';
import OfflineAwareIndicator from '../components/bible/OfflineAwareIndicator';
import OfflineNotesSync, { savePendingNote, savePendingHighlight, deletePendingNote, deletePendingHighlight } from '../components/bible/OfflineNotesSync';
import { useOfflineChapter, loadOfflineVerses } from '../components/bible/useOfflineChapter';
import OfflineStatusBadge from '../components/bible/OfflineStatusBadge';
import { useReadingHistory } from '../components/bible/useReadingHistory';
import VerseShareButton from '../components/bible/VerseShareButton';
import VerseCommentPanel from '../components/bible/VerseCommentPanel';
import GroupReadingPlanManager from '../components/bible/GroupReadingPlanManager';
import AIDevotionalGenerator from '../components/bible/AIDevotionalGenerator';
import CrossReferenceSuggester from '../components/bible/CrossReferenceSuggester';
import BookSummaryPanel from '../components/bible/BookSummaryPanel';
import VerseExplanationModal from '../components/bible/VerseExplanationModal';
import ReadingModeControls from '../components/bible/ReadingModeControls';
import ChapterProgressTracker from '../components/bible/ChapterProgressTracker';
import VerseHighlightPanel from '../components/bible/VerseHighlightPanel';
import ChapterAudioPlayer from '../components/bible/ChapterAudioPlayer';
import ScriptureAudioPlayer from '../components/bible/ScriptureAudioPlayer';
import PassageAudioPlayer from '../components/audio/PassageAudioPlayer';
import TTSPlayer from '../components/bible/TTSPlayer';
import ChapterAudioStreamer from '../components/bible/ChapterAudioStreamer';
import BibleAudioPlayer from '../components/audio/BibleAudioPlayer';
import VerseReflectionAudio from '../components/audio/VerseReflectionAudio';
import ChapterAudioPlayerWithControls from '../components/bible/ChapterAudioPlayerWithControls';
import ReadingPlanTracker from '../components/bible/ReadingPlanTracker';
import ReadingMeterDisplay from '../components/premium/ReadingMeterDisplay';
import FeatureLimitModal from '../components/premium/FeatureLimitModal';
import { useI18n } from '../components/I18nProvider';
import { ProviderRouter, getAvailabilityMessage } from '../components/lib/providerRouter';
import BibleReaderErrorBoundary from '../components/bible/BibleReaderErrorBoundary';
import ReaderBottomNav from '../components/bible/ReaderBottomNav';
import ReaderSettingsPanel from '../components/bible/ReaderSettingsPanel';
import BookChapterPicker from '../components/bible/BookChapterPicker';
import { recordChapterRead } from '../components/lib/bibleEngineServices/readingStreakService';
import BookProgressBar from '../components/bible/BookProgressBar';
import BilingualToggle from '../components/bible/BilingualToggle';
import { useAudioStore } from '../components/audio/useAudioStore';
import { toast } from 'sonner';
import VerseReflectionModal from '../components/bible/VerseReflectionModal';
import ChapterGeographyMap from '../components/bible/ChapterGeographyMap';
import PrayerJournalPanel from '../components/PrayerJournalPanel';
import VerseSharePanel from '../components/VerseSharePanel';
import OfflineAudioControls from '../components/OfflineAudioControls';

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

export default function BibleReader() {
   const { t } = useI18n();
   const { isOnline, isSyncing, syncStatus, pendingCount, performSync, queueChange } = useSyncManager();
   const { saveReading, getReadingHistory } = useReadingHistory();
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState(null); // Always a Number or null
  const [translation, setTranslation] = useState(() => {
    // Load saved translation preference
    return localStorage.getItem('preferred_translation') || 'WEB';
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [notes, setNotes] = useState({});
  const [copiedVerse, setCopiedVerse] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [downloadingChapter, setDownloadingChapter] = useState(false);
  const [showAudioBar, setShowAudioBar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGoTo, setShowGoTo] = useState(false);
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [studyToolTab, setStudyToolTab] = useState('notebook');
  const [activeAudioVerseIdx, setActiveAudioVerseIdx] = useState(null);
  const [selectedVerseForStudy, setSelectedVerseForStudy] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTranslationMeta, setCurrentTranslationMeta] = useState(null);
  const [readingHistory, setReadingHistory] = useState([]);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState('text-base');
  const [readingBgColor, setReadingBgColor] = useState('bg-white');
  const [showHighlightPanel, setShowHighlightPanel] = useState(false);
  const [selectedVerseForHighlight, setSelectedVerseForHighlight] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showReadingPlan, setShowReadingPlan] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(30);
  const [chaptersReadToday, setChaptersReadToday] = useState(() => {
    try {
      const stored = localStorage.getItem('chapters_read_today');
      if (!stored) return [];
      const { date, chapters } = JSON.parse(stored);
      if (date !== new Date().toDateString()) return [];
      return chapters;
    } catch { return []; }
  });
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [bilingualMode, setBilingualMode] = useState('en'); // 'en' | 'om' | 'stacked'
  const [aiHelperOpen, setAIHelperOpen] = useState(false);
  const loadChapterAudio = useAudioStore.getState().loadChapter;
  const [aiHelperRef, setAIHelperRef] = useState('');
  const [shareImageModalOpen, setShareImageModalOpen] = useState(false);
  const [shareImageVerse, setShareImageVerse] = useState(null);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [selectedVerseForExplanation, setSelectedVerseForExplanation] = useState(null);
  const [reflectionModalOpen, setReflectionModalOpen] = useState(false);
  const [reflectionVerse, setReflectionVerse] = useState(null);
  const [selectedVerseForSharing, setSelectedVerseForSharing] = useState(null);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [showChapterAudioStreamer, setShowChapterAudioStreamer] = useState(false);
  const [chapterAudioUrl, setChapterAudioUrl] = useState(null);

  // Derived — must be declared BEFORE any useQuery that uses it
  const chapterNum = chapter ? Number(chapter) : null;

  // Offline chapter detection
  const { isOffline: chapterIsOffline, recheck: recheckOffline } = useOfflineChapter(currentUser?.id, translation, book, chapterNum);

  // Fetch current user & check reading goal reminders & load reading history
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        // Load reading history
         const history = await getReadingHistory(user.id, 50);
         setReadingHistory(history);

         // Check reading limit (only for authenticated users)
         try {
           const isAuth = await base44.auth.isAuthenticated().catch(() => false);
           if (isAuth) {
             const result = await base44.functions.invoke('checkFeatureAccess', {
               featureKey: 'bible.read_minutes',
             });
             if (result?.data) {
               const used = result.data.used || 0;
               const limit = result.data.limit || 60;
               setMinutesRemaining(Math.max(0, limit - used));
             }
           }
         } catch (err) {
           console.warn('Reading limit check:', err.message);
         }
        // Check if user has a reminder goal due
        const goals = await base44.entities.ReadingGoal.filter({ user_id: user.id, is_active: true }, '-created_date', 1).catch(() => null) || [];
        if (goals.length > 0) {
          const g = goals[0];
          const lastShown = localStorage.getItem('goal_reminder_shown');
          if (g.reminder_enabled && g.progress < g.target && lastShown !== new Date().toDateString()) {
            const { toast: sToast } = await import('sonner');
            sToast(`📖 Reading goal: ${g.progress}/${g.target} ${g.goal_type.includes('chapters') ? 'chapters' : 'verses'} — keep it up!`, { duration: 5000 });
            localStorage.setItem('goal_reminder_shown', new Date().toDateString());
          }
        }
      } catch (error) {
        console.error('Not authenticated');
      }
    };
    fetchUser();
  }, []);

  // Fetch highlights from database (filter by user_id + book only; match chapter client-side)
  const { data: dbHighlights = [] } = useQuery({
    queryKey: ['verseHighlights', currentUser?.id, book, chapterNum],
    queryFn: async () => {
      if (!currentUser || !book || !chapterNum) return [];
      const all = await base44.entities.VerseHighlight.filter({
        user_id: currentUser.id,
        book
      }, '-created_date', 500).catch(() => []);
      return all.filter(h => h.chapter === chapterNum);
    },
    enabled: !!currentUser && !!book && !!chapterNum,
    retry: false,
  });

  // Fetch saved verses (bookmarks) — filter by user_id + book; match chapter client-side
  const { data: savedVerses = [] } = useQuery({
    queryKey: ['savedVerses', currentUser?.id, book, chapterNum],
    queryFn: async () => {
      if (!currentUser || !book || !chapterNum) return [];
      const all = await base44.entities.SavedVerse.filter({
        user_id: currentUser.id,
        book
      }, '-created_date', 200).catch(() => []);
      return all.filter(s => s.chapter === chapterNum);
    },
    enabled: !!currentUser && !!book && !!chapterNum,
    retry: false,
  });

  const savedVerseIds = savedVerses.map(s => `${s.book}-${s.chapter}-${s.verse}`);

  // Fetch notes from database (filter by user_id + book only; match chapter client-side)
  const { data: dbNotes = [] } = useQuery({
    queryKey: ['verseNotes', currentUser?.id, book, chapterNum],
    queryFn: async () => {
      if (!currentUser || !book || !chapterNum) return [];
      const all = await base44.entities.VerseNote.filter({
        user_id: currentUser.id,
        book
      }, '-created_date', 500).catch(() => []);
      return all.filter(n => n.chapter === chapterNum);
    },
    enabled: !!currentUser && !!book && !!chapterNum,
    retry: false,
  });

  // Convert database results to local state format
  useEffect(() => {
    if (dbHighlights.length > 0) {
      const highlightsMap = {};
      dbHighlights.forEach(h => {
        const verseId = `${h.book}-${h.chapter}-${h.verse}`;
        highlightsMap[verseId] = h.color;
      });
      setHighlights(highlightsMap);
    } else {
      setHighlights({});
    }
  }, [dbHighlights]);

  useEffect(() => {
    if (dbNotes.length > 0) {
      const notesMap = {};
      dbNotes.forEach(n => {
        const verseId = `${n.book}-${n.chapter}-${n.verse}`;
        notesMap[verseId] = n.note_text;
      });
      setNotes(notesMap);
    } else {
      setNotes({});
    }
  }, [dbNotes]);

  // Save translation preference when it changes
  useEffect(() => {
    localStorage.setItem('preferred_translation', translation);
  }, [translation]);

  // Fetch BibleBook for dynamic chapter counts + offline checks
  const { data: bibleBooks = [] } = useQuery({
    queryKey: ['bible-books-list'],
    queryFn: () => base44.entities.BibleBook.list('order', 70).catch(() => []),
    retry: false,
  });

  // Find current book's data
  const bookData = bibleBooks.find(b => b.name === book);
  const chapters = book && bookData ? Array.from({ length: bookData.chapters_count || 1 }, (_, i) => i + 1) : [];

  // Check offline index for this chapter
  const { data: offlineIndexData = null } = useQuery({
    queryKey: ['offline-index', currentUser?.id, translation, book, chapterNum],
    queryFn: async () => {
      if (!currentUser?.id || !book || !chapterNum) return null;
      try {
        const results = await base44.entities.OfflineIndex.filter({
          user_id: currentUser.id,
          translation,
          book,
          chapter: chapterNum
        }, null, 1);
        return results[0] || null;
      } catch { return null; }
    },
    enabled: !!currentUser?.id && !!book && !!chapterNum,
    retry: false,
  });

  const isChapterOffline = offlineIndexData?.is_downloaded;

  // chapter is always a Number (or null). Coerce once here for safety.
  // NOTE: chapterNum is already declared above all queries — this comment block is kept for context only.
  const queryClient = useQueryClient();

  // Fetch verses via Bible Brain proxy (offline-first + graceful fallback)
  const { data: verses = [], isLoading, error: versesError } = useQuery({
    queryKey: ['bibleVerses', book, chapterNum, translation],
    queryFn: async () => {
      if (!book || !chapterNum) return [];

      try {
        // Route to correct provider via catalog
        const result = await getChapter(translation, book, chapterNum);
        
        if (result && result.verses && result.verses.length > 0) {
          // Auto-cache to offline storage (fire and forget)
          const { autoCacheChapter } = await import('@/components/bible/CacheAsYouReadManager');
          autoCacheChapter(translation, book, chapterNum, result.verses).catch(() => {});
          
          return result.verses;
        }

        // If API returned nothing, check offline storage as fallback
        const { getChapterOffline } = await import('@/components/lib/offlineBibleManager');
        const offlineChapter = await getChapterOffline(translation, book, chapterNum);
        if (offlineChapter?.verses && offlineChapter.verses.length > 0) {
          return offlineChapter.verses;
        }

        // Nothing found
        return [];
      } catch (error) {
        console.error('Error fetching verses:', error);
        // Return empty array, let UI show friendly message
        return [];
      }
    },
    enabled: !!book && !!chapterNum && !!translation,
    retry: false,
    staleTime: 0
  });

  // selectedPassage is truthy whenever book+chapter are chosen
  const selectedPassage = book && chapterNum ? {
    book,
    chapter: chapterNum,
    translation,
    reference: `${book} ${chapterNum}`,
    verses
  } : null;

  // Track chapter reading for goals + save reading history
  useEffect(() => {
    if (!book || !chapter || verses.length === 0) return;
    const key = `${book}-${chapter}`;
    setChaptersReadToday(prev => {
      if (prev.includes(key)) return prev;
      const updated = [...prev, key];
      localStorage.setItem('chapters_read_today', JSON.stringify({ date: new Date().toDateString(), chapters: updated }));
      return updated;
    });
    
    // Sync global audio store with current chapter
    loadChapterAudio(book, Number(chapter), verses);

    // Save reading history + update streak if user is authenticated
    if (currentUser?.id) {
      // Track chapter completion in ReadingProgress
      base44.entities.ReadingProgress.filter(
        { user_id: currentUser.id, book, chapter: Number(chapter) }, 'chapter', 1
      ).then(existing => {
        if (!existing || existing.length === 0) {
          base44.entities.ReadingProgress.create({
            user_id: currentUser.id, book, chapter: Number(chapter),
            translation, completed_date: new Date().toISOString().split('T')[0]
          }).catch(() => {});
        }
      }).catch(() => {});
    saveReading(currentUser.id, book, chapter, `${book} ${chapter}`, translation);
    recordChapterRead({
        userId: currentUser.id,
        bookId: book,
        chapterNumber: Number(chapter),
        method: 'scroll',
        language: translation === 'ORM' ? 'om' : 'en',
      }).catch(() => {});
    }
  }, [book, chapter, verses.length, currentUser?.id, translation, saveReading]);

  // Show book-level progress bar below chapter picker
  const CHAPTER_COUNTS_MAP = {
    'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,'Joshua':24,'Judges':21,'Ruth':4,
    '1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,
    'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,'Psalm':150,'Proverbs':31,'Ecclesiastes':12,
    'Song of Songs':8,'Isaiah':66,'Jeremiah':52,'Lamentations':5,'Ezekiel':48,'Daniel':12,
    'Hosea':14,'Joel':3,'Amos':9,'Obadiah':1,'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,
    'Zephaniah':3,'Haggai':2,'Zechariah':14,'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,
    'John':21,'Acts':28,'Romans':16,'1 Corinthians':16,'2 Corinthians':13,'Galatians':6,
    'Ephesians':6,'Philippians':4,'Colossians':4,'1 Thessalonians':5,'2 Thessalonians':3,
    '1 Timothy':6,'2 Timothy':4,'Titus':3,'Philemon':1,'Hebrews':13,'James':5,
    '1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,'Jude':1,'Revelation':22
  };

  const copyVerse = (verseRef, verseText) => {
    navigator.clipboard.writeText(`${verseRef}\n${verseText}`);
    setCopiedVerse(verseRef);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPassage) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const verseText = selectedPassage.verses.map(v => `${v.verse}. ${v.text}`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical teaching assistant. Use ONLY the Bible verses provided below to answer the user's question.

SCRIPTURE PASSAGE (${selectedPassage.reference}):
${verseText}

GUIDELINES:
- Explain the verses clearly with context
- Provide practical application for faith and life
- Always cite verse references when quoting
- Use simple, accessible language
- If the provided verses don't fully answer the question, acknowledge this and suggest related passages

USER QUESTION: ${userMessage}`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
         role: 'assistant', 
         content: t('errors.aiResponseFailed', 'I could not generate a response. Please try again.'),
         isError: true
       }]);
    } finally {
      setLoading(false);
    }
  };

  const handleHighlightVerse = async (verseId, color, verseData) => {
    if (!currentUser) return;

    // Update local state immediately
    setHighlights(prev => ({ ...prev, [verseId]: color }));

    // If offline, queue for later sync
    if (!isOnline) {
      savePendingHighlight({ user_id: currentUser.id, book: verseData.book, chapter: verseData.chapter, verse: verseData.verse, translation, color, verse_text: verseData.text });
      window.dispatchEvent(new Event('offline-highlight-saved'));
      return;
    }

    // Save to database
    try {
      const existing = dbHighlights.find(h => h.book === verseData.book && h.chapter === verseData.chapter && h.verse === verseData.verse);
      if (existing) {
        await base44.entities.VerseHighlight.update(existing.id, { color });
      } else {
        await base44.entities.VerseHighlight.create({ user_id: currentUser.id, book: verseData.book, chapter: verseData.chapter, verse: verseData.verse, translation, color, verse_text: verseData.text });
      }
    } catch (error) {
      // Queue for sync on failure
      savePendingHighlight({ user_id: currentUser.id, book: verseData.book, chapter: verseData.chapter, verse: verseData.verse, translation, color, verse_text: verseData.text });
      window.dispatchEvent(new Event('offline-highlight-saved'));
    }
  };

  const handleClearHighlight = async (verseId, verseData) => {
    if (!currentUser) return;

    setHighlights(prev => { const u = { ...prev }; delete u[verseId]; return u; });
    deletePendingHighlight(verseData.book, verseData.chapter, verseData.verse);

    if (!isOnline) return;
    try {
      const existing = dbHighlights.find(h => h.book === verseData.book && h.chapter === verseData.chapter && h.verse === verseData.verse);
      if (existing) await base44.entities.VerseHighlight.delete(existing.id);
    } catch {}
  };

  const handleSaveNote = async (verseId, noteText, isPublic, verseData) => {
    if (!currentUser) return;

    setNotes(prev => ({ ...prev, [verseId]: noteText }));

    const pendingItem = { user_id: currentUser.id, book: verseData.book, chapter: verseData.chapter, verse: verseData.verse, translation, note_text: noteText, is_public: isPublic, verse_text: verseData.text };

    // Offline: queue
    if (!isOnline) {
      savePendingNote(pendingItem);
      window.dispatchEvent(new Event('offline-note-saved'));
      return;
    }

    try {
      const existing = dbNotes.find(n => n.book === verseData.book && n.chapter === verseData.chapter && n.verse === verseData.verse);
      if (existing) {
        await base44.entities.VerseNote.update(existing.id, { note_text: noteText, is_public: isPublic });
      } else {
        await base44.entities.VerseNote.create(pendingItem);
      }
      if (isPublic) await trackActivity(currentUser.id, 'public_note', 3);
    } catch {
      savePendingNote(pendingItem);
      window.dispatchEvent(new Event('offline-note-saved'));
    }
  };

  const handleDeleteNote = async (verseId, verseData) => {
    if (!currentUser) return;

    setNotes(prev => { const u = { ...prev }; delete u[verseId]; return u; });
    deletePendingNote(verseData.book, verseData.chapter, verseData.verse);

    if (!isOnline) return;
    try {
      const existing = dbNotes.find(n => n.book === verseData.book && n.chapter === verseData.chapter && n.verse === verseData.verse);
      if (existing) await base44.entities.VerseNote.delete(existing.id);
    } catch {}
  };

  const handleGoToVerse = ({ book: newBook, chapter: newChapter, verse }) => {
    setBook(newBook);
    setChapter(Number(newChapter));
    
    // Scroll to verse if specified
    if (verse) {
      setTimeout(() => {
        const verseId = `${newBook}-${newChapter}-${verse}`;
        const verseElement = document.getElementById(verseId);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  };



  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const accentColor = isDarkMode ? '#E0C068' : '#C9A24D';

  return (
    <BibleReaderErrorBoundary>
      <main className="min-h-screen flex flex-col" id="main-content" style={{ backgroundColor: bgColor }}>
      <style>{`
        :root {
          --color-sage: ${primaryColor};
          --color-gold: ${accentColor};
          --color-bg: ${bgColor};
          --color-card: ${cardColor};
          --color-text: ${textColor};
          --color-muted: ${mutedColor};
          --color-border: ${borderColor};
        }
      `}</style>

      <AIHelperDrawer
        open={aiHelperOpen}
        onOpenChange={setAIHelperOpen}
        reference={aiHelperRef}
        translationId={translation}
        context="bible"
        user={currentUser}
      />

      {/* Sticky Header */}
       <header className="sticky top-0 z-40 flex items-center h-14 px-4" style={{ backgroundColor: cardColor, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex-1 flex items-center justify-between max-w-5xl mx-auto w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle dark mode"
            className="text-opacity-70"
            style={{ color: primaryColor }}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <button
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 transition-colors"
            style={{ color: textColor }}
            onClick={() => setShowBookPicker(true)}
          >
            {selectedPassage ? (
              <>
                <span className="font-bold text-lg">{selectedPassage.reference}</span>
                <OfflineStatusBadge isOffline={isChapterOffline} isDarkMode={isDarkMode} />
              </>
            ) : (
              <span className="text-sm font-medium" style={{ color: mutedColor }}>
                {t('picker.selectBook', 'Select Book & Chapter')}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGoTo(true)}
              title="Go to verse"
              className="h-10 w-10"
              style={{ color: primaryColor }}
            >
              <Navigation className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Manage offline content"
              className="h-10 w-10"
              style={{ color: showOfflineManager ? '#6366F1' : primaryColor }}
              onClick={() => setShowOfflineManager(v => !v)}
            >
              <HardDrive className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Toggle Audio Player"
              className="h-10 w-10"
              style={{ color: showAudioPlayer ? '#6366F1' : primaryColor }}
              onClick={() => setShowAudioPlayer(v => !v)}
            >
              <span className="text-xl">🎧</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Toggle Reading Plan"
              className="h-10 w-10"
              style={{ color: showReadingPlan ? '#6366F1' : primaryColor }}
              onClick={() => setShowReadingPlan(v => !v)}
            >
              <CalendarDays className="w-5 h-5" />
            </Button>
            <ReaderSettingsPanel
              isDarkMode={isDarkMode}
              onToggleDark={() => setIsDarkMode(v => !v)}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              bgColor={readingBgColor}
              onBgColorChange={setReadingBgColor}
            />
            <BibleScriptureSearch
              translation={translation}
              isDarkMode={isDarkMode}
              onNavigate={handleGoToVerse}
            />
            <TranslationSelector
              currentAbbrev={translation}
              onTranslationChange={(abbrev, meta) => {
                setTranslation(abbrev);
                setCurrentTranslationMeta(meta);
              }}
              isDarkMode={isDarkMode}
            />
            {selectedPassage && currentUser && verses.length > 0 && (
               <>
                 <AIBibleAnalyzer 
                   book={book}
                   chapter={chapter}
                   verses={verses}
                   currentUser={currentUser}
                   isDarkMode={isDarkMode}
                 />
                 <AIQuizGenerator
                   book={book}
                   chapter={chapter}
                   verses={verses}
                   isDarkMode={isDarkMode}
                 />
               </>
             )}
            {selectedPassage && (
              <StructuredOfflineDownloadButton
                book={book}
                chapter={chapter}
                translationAbbrev={translation}
                translationMeta={currentTranslationMeta}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <SyncStatusIndicator
            isOnline={isOnline}
            syncStatus={syncStatus}
            pendingCount={pendingCount}
            isDarkMode={isDarkMode}
            onSync={performSync}
            isSyncing={isSyncing}
          />
          {/* Book & Chapter Selector */}
          <div className="mb-6 space-y-3">
            <button
              onClick={() => setShowBookPicker(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
              style={{ backgroundColor: cardColor, borderColor: borderColor, color: textColor }}
            >
              <span className="font-semibold">
                {book && chapterNum ? `${book} ${chapterNum}` : t('picker.selectBook', 'Select Book & Chapter')}
              </span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: borderColor, color: mutedColor }}>
                {t('bible.change', 'Change')}
              </span>
            </button>
            <OfflineManager />
          </div>

          {/* Book & Chapter Picker */}
          <BookChapterPicker
            open={showBookPicker}
            onClose={() => setShowBookPicker(false)}
            onSelect={(newBookOrObj, newChapter) => {
              const newBook = typeof newBookOrObj === 'object' ? newBookOrObj.bookCode : newBookOrObj;
              const ch = typeof newBookOrObj === 'object' ? newBookOrObj.chapter : newChapter;
              setBook(newBook);
              setChapter(ch);
              queryClient.removeQueries({ queryKey: ['bibleVerses'] });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentBook={book}
            currentChapter={chapterNum}
            isDarkMode={isDarkMode}
          />

          {/* Book Reading Progress */}
          {currentUser && book && (
            <div className="mb-3 flex items-center gap-3">
              <BookProgressBar
                user={currentUser}
                book={book}
                totalChapters={CHAPTER_COUNTS_MAP[book] || CHAPTER_COUNTS[book] || 1}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* Bilingual Mode Toggle */}
          <div className="mb-3">
            <BilingualToggle mode={bilingualMode} onChange={setBilingualMode} isDarkMode={isDarkMode} />
          </div>

          {/* Reading Mode Controls + Meter */}
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <ReadingModeControls
              isReadingMode={isReadingMode}
              onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              bgColor={readingBgColor}
              onBgColorChange={setReadingBgColor}
            />
            {currentUser && book && chapterNum && (
              <ChapterProgressTracker user={currentUser} book={book} chapter={chapterNum} />
            )}
            {currentUser && (
              <ReadingMeterDisplay />
            )}
          </div>

          {/* Reading Limit Modal */}
          {limitModalOpen && (
            <FeatureLimitModal
              open={limitModalOpen}
              onClose={() => setLimitModalOpen(false)}
              featureName="Bible Reading"
              minutesRemaining={minutesRemaining}
              onUpgrade={() => window.location.href = createPageUrl('UpgradePremium')}
            />
          )}

          {/* Reading Goal tracker */}
          <InlineReadingGoal
            user={currentUser}
            bookChapterJustRead={book && chapterNum && verses.length > 0 ? `${book}-${chapterNum}` : null}
            isDarkMode={isDarkMode}
          />

          {/* Audio Player — BibleBrain streaming + TTS read-aloud + Full Chapter Audio */}
          {showAudioPlayer && book && chapterNum && (
            <div className="mb-4 space-y-3">
              {/* Quick Chapter Audio Player with controls & offline download */}
              <ChapterAudioPlayerWithControls
                book={book}
                chapter={chapterNum}
                audioUrl={chapterAudioUrl || `https://audio.biblebrain.com/${book.toLowerCase().replace(/\s+/g, '_')}_${chapterNum}_en_niv.m4a`}
                isDarkMode={isDarkMode}
                onClose={() => setShowAudioPlayer(false)}
              />

              {/* Full chapter streaming audio with speed control & sleep timer */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: textColor }}>📻 Full Chapter Audio</h4>
                <ChapterAudioStreamer
                  book={book}
                  chapter={chapterNum}
                  audioUrl={chapterAudioUrl || `https://audio.biblebrain.com/${book.toLowerCase().replace(/\s+/g, '_')}_${chapterNum}_en_niv.m4a`}
                  onClose={() => setShowChapterAudioStreamer(false)}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Verse-by-verse TTS */}
              <TTSPlayer
                verses={verses}
                book={book}
                chapter={chapterNum}
                isDarkMode={isDarkMode}
                onVerseChange={setActiveAudioVerseIdx}
                onClose={() => setShowAudioPlayer(false)}
              />

              {/* Passage audio player */}
              <PassageAudioPlayer
                book={book}
                chapter={chapterNum}
                onVerseChange={setActiveAudioVerseIdx}
                onClose={() => setShowAudioPlayer(false)}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* Chapter Geography Map */}
          {book && chapterNum && verses.length > 0 && (
            <ChapterGeographyMap
              book={book}
              chapter={chapterNum}
              verses={verses}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Reading Plan Tracker */}
          {showReadingPlan && (
            <div className="mb-4">
              <ReadingPlanTracker
                user={currentUser}
                currentBook={book}
                currentChapter={chapterNum}
              />
            </div>
          )}

          {/* Offline / Online Indicator + Sync Status */}
          {book && chapterNum && (
            <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
              <OfflineAwareIndicator
                book={book}
                chapter={chapterNum}
                translation={translation}
                isOnline={isOnline}
                isOffline={chapterIsOffline}
                userId={currentUser?.id}
                onDownloaded={() => { recheckOffline(); queryClient.invalidateQueries({ queryKey: ['bibleVerses', book, chapterNum, translation] }); }}
              />
              {currentUser && (
                <OfflineNotesSync userId={currentUser.id} />
              )}
            </div>
          )}

          {/* Chapter Download Panel */}
          <ChapterDownloadPanel
            currentBook={book}
            currentChapter={chapterNum}
            translation={translation}
            verses={verses}
            isDarkMode={isDarkMode}
          />

          {/* Full Book Download Manager */}
          {showOfflineManager && (
            <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: cardColor, borderColor: borderColor }}>
              <OfflineBookDownloader translation={translation} />
            </div>
          )}

          {selectedPassage && (
            <div className="mb-6 rounded-lg overflow-hidden h-24" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507842217343-583f20270319?w=800&h=200&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5F1E8' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', height: '100%' }}></div>
            </div>
          )}

          {/* Placeholder — only when no book+chapter selected */}
          {(!book || !chapterNum) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="w-12 h-12 mb-4" style={{ color: mutedColor }} />
              <p className="text-lg font-medium" style={{ color: textColor }}>{t('bible.selectPassageHint', 'Select a passage to begin reading')}</p>
               <p className="text-sm mt-1" style={{ color: mutedColor }}>{t('bible.selectPassageHintSub', 'Choose a book and chapter to get started')}</p>
              <a href={createPageUrl('AskAI?context=BibleReader')}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700 hover:bg-indigo-100 transition-all">
                <Sparkles className="w-4 h-4" /> Ask AI about any passage
              </a>
            </div>
          )}

          {/* No verses found — not downloaded + offline (friendly fallback) */}
           {book && chapterNum && !isLoading && verses.length === 0 && !isOnline && !isChapterOffline && (
             <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
               <div className="p-3 rounded-full" style={{ backgroundColor: '#FEF3C7' }}>
                 <AlertCircle className="w-10 h-10 text-amber-600" />
               </div>
               <div>
                 <p className="text-base font-bold" style={{ color: textColor }}>{t('offline.notAvailable', 'Not available offline yet')}</p>
                 <p className="text-sm mt-1" style={{ color: mutedColor }}>
                   {t('offline.downloadPrompt', 'This chapter hasn\'t been downloaded. Go online or download it for offline reading.')}
                 </p>
               </div>
               <div className="flex gap-2 justify-center flex-wrap">
                 <Button 
                   onClick={() => queryClient.invalidateQueries({ queryKey: ['bibleVerses', book, chapterNum, translation] })}
                   className="bg-indigo-600 hover:bg-indigo-700"
                 >
                   Go Online
                 </Button>
                 <Link to={createPageUrl('OfflineManager')}>
                   <Button variant="outline" className="gap-2">
                     <HardDrive className="w-4 h-4" /> Download
                   </Button>
                 </Link>
               </div>
             </div>
           )}

          {/* No verses online (but is online) — suggest different translation */}
          {book && chapterNum && !isLoading && verses.length === 0 && isOnline && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-base font-medium" style={{ color: textColor }}>{t('bible.noVersesFound', 'No verses found')}</p>
              <p className="text-sm mt-1" style={{ color: mutedColor }}>{t('bible.tryDifferentTranslation', 'Try a different translation.')}</p>
            </div>
          )}

          {/* Loading spinner */}
          {book && chapterNum && isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
            </div>
          )}

          {selectedPassage && verses.length > 0 ? (
            <>
              {/* ── Chapter View tab (clean reading mode) ── */}
              {book && chapter && (
                <div className="mb-6">
                  <Tabs defaultValue="classic">
                    <TabsList className="mb-4">
                      <TabsTrigger value="classic">Classic View</TabsTrigger>
                      <TabsTrigger value="chapter">📖 Chapter View</TabsTrigger>
                    </TabsList>
                    {/* Ask AI + View Location buttons */}
                     <div className="mb-3 flex flex-wrap gap-2">
                       <a href={createPageUrl(`AskAI?context=BibleReader&passage=${encodeURIComponent(`${book} ${chapter}`)}`)}
                         className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700 hover:bg-indigo-100 transition-all">
                         <Sparkles className="w-3.5 h-3.5" /> Ask AI about {book} {chapter}
                       </a>
                       <a href={createPageUrl(`BibleGeographyMap?passage=${encodeURIComponent(`${book} ${chapter}`)}`)}
                         className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 hover:bg-green-100 transition-all">
                         <MapPin className="w-3.5 h-3.5" /> View Location
                       </a>
                     </div>
                    <TabsContent value="chapter">
                      <ChapterView
                        book={book}
                        chapter={parseInt(chapter)}
                        user={currentUser}
                        onChapterChange={(c) => setChapter(c.toString())}
                        onBookChange={setBook}
                      />
                    </TabsContent>
                    <TabsContent value="classic">
                      {verses.length > 0 && (
                        <div className="mb-6">
                          <AIStudyToolsPanel
                            book={book}
                            chapter={parseInt(chapter)}
                            verses={verses}
                            selectedVerse={selectedVerseForStudy}
                            userNotes={Object.values(notes).join(' ')}
                            userTopic={book}
                            readingHistory={chaptersReadToday.map(c => ({ book, chapter: c }))}
                          />
                        </div>
                      )}
                      {!isOnline && verses.length > 0 && (
                        <div className="mb-4 p-4 rounded-lg shadow-sm" style={{ backgroundColor: isDarkMode ? '#1A2820' : '#ECFDF5', border: `2px solid ${isDarkMode ? '#2A3F32' : '#A7F3D0'}` }}>
                          <div className="flex items-start gap-3">
                            <WifiOff className="w-5 h-5 mt-0.5" style={{ color: '#10B981' }} />
                            <div className="flex-1">
                              <p className="font-semibold text-sm mb-1" style={{ color: textColor }}>📖 Reading Offline</p>
                              <p className="text-xs" style={{ color: mutedColor }}>You're viewing downloaded content. Internet connection not required.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        {isLoading ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6B8E6E' }} />
                          </div>
                        ) : (
                          <div className={`space-y-2 ${isReadingMode ? 'max-w-3xl mx-auto' : ''} ${fontSize} ${readingBgColor} ${isReadingMode ? 'p-8 rounded-xl' : ''}`}>
                            {verses.map((verse, idx) => {
                              const verseId = `${verse.book}-${verse.chapter}-${verse.verse}`;
                              const highlighted = highlights[verseId];
                              const verseNote = notes[verseId];
                              const verseRef = `${book} ${chapter}:${verse.verse}`;
                              return (
                                <div
                                  key={idx}
                                  id={verseId}
                                  className="rounded-lg p-3 mb-2 transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: activeAudioVerseIdx === idx
                                      ? (isDarkMode ? '#312E81' : '#EEF2FF')
                                      : highlighted ? (
                                          highlighted === 'yellow' ? (isDarkMode ? '#3A3A1A' : '#FFFAED') :
                                          highlighted === 'pink' ? (isDarkMode ? '#3A1F2A' : '#FDF2F8') :
                                          highlighted === 'green' ? (isDarkMode ? '#1A3A1A' : '#F0FDF4') :
                                          (isDarkMode ? '#1A2A3A' : '#EFF6FF')
                                        ) : cardColor,
                                    boxShadow: activeAudioVerseIdx === idx ? '0 0 0 2px #6366F1' : undefined,
                                    borderLeft: `4px solid ${highlighted ? (
                                      highlighted === 'yellow' ? '#FCD34D' :
                                      highlighted === 'pink' ? '#F472B6' :
                                      highlighted === 'green' ? '#86EFAC' : '#3B82F6'
                                    ) : primaryColor}`,
                                    border: `1px solid ${borderColor}`
                                  }}
                                  onDoubleClick={() => {
                                    setSelectedVerseForSharing(verse);
                                  }}
                                  onClick={() => {
                                    setSelectedVerseForStudy(verse);
                                    setReflectionVerse(verse);
                                    setReflectionModalOpen(true);
                                  }}
                                  >
                                  <div className="flex items-start gap-2 justify-between mb-2">
                                    <span className="text-sm font-bold min-w-6 mt-0.5" style={{ color: primaryColor }}>{verse.verse}</span>
                                    <div className="flex items-center gap-1 flex-wrap justify-end">
                                      <VerseActions
                                        verse={verse}
                                        book={book}
                                        chapter={chapter}
                                        translation={translation}
                                        highlighted={highlighted}
                                        isBookmarked={savedVerseIds.includes(verseId)}
                                        onHighlight={(color) => handleHighlightVerse(verseId, color, verse)}
                                        onClearHighlight={() => handleClearHighlight(verseId, verse)}
                                        onAIExplain={() => { setSelectedVerseForExplanation({ reference: `${book} ${chapter}:${verse.verse}`, text: verse.text }); setExplanationModalOpen(true); }}
                                        onShareImage={() => { setShareImageVerse(verse); setShareImageModalOpen(true); }}
                                      />
                                      <VerseNotes
                                        verseId={verseId}
                                        notes={verseNote}
                                        isPublic={dbNotes.find(n => n.book === verse.book && n.chapter === verse.chapter && n.verse === verse.verse)?.is_public}
                                        onSaveNotes={(text, isPublic) => handleSaveNote(verseId, text, isPublic, verse)}
                                        onDeleteNotes={() => handleDeleteNote(verseId, verse)}
                                      />
                                    </div>
                                  </div>
                                  {/* Primary language text with text-selection highlighting */}
                                  {bilingualMode !== 'om' && (
                                    <p className="text-base leading-relaxed select-text" style={{ color: textColor }}>
                                      <TextSelectionHighlighter
                                        verseId={verseId}
                                        currentColor={highlighted}
                                        onHighlight={(id, color) => handleHighlightVerse(id, color, verse)}
                                        onClear={(id) => handleClearHighlight(id, verse)}
                                      >
                                        {verse.text}
                                      </TextSelectionHighlighter>
                                    </p>
                                  )}
                                  {/* Afaan Oromoo text */}
                                  {(bilingualMode === 'om' || bilingualMode === 'stacked') && verse.text_om && (
                                    <p className={`leading-relaxed ${bilingualMode === 'stacked' ? 'text-sm mt-1' : 'text-base'}`}
                                       style={{ color: bilingualMode === 'stacked' ? mutedColor : textColor, fontStyle: bilingualMode === 'stacked' ? 'italic' : 'normal' }}>
                                      {verse.text_om}
                                    </p>
                                  )}
                                  {bilingualMode === 'om' && !verse.text_om && (
                                    <p className="text-base leading-relaxed" style={{ color: textColor }}>{verse.text}</p>
                                  )}
                                  <div className="mt-3 space-y-2 pt-3 border-t" style={{ borderColor: borderColor }}>
                                    <AIVerseCommentary book={book} chapter={chapter} verse={verse.verse} endVerse={verse.end_verse} translation={translation} verseText={verse.text} isDarkMode={isDarkMode} />
                                    <SpacedRepetitionManager book={book} chapter={chapter} verse={verse.verse} endVerse={verse.end_verse} verseText={verse.text} translation={translation} currentUser={currentUser} isDarkMode={isDarkMode} />
                                    <CrossReferenceNetwork
                                      book={book} chapter={chapter} verse={verse.verse}
                                      verseText={verse.text}
                                      onNavigate={(ref) => {
                                        const parts = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
                                        if (parts) handleGoToVerse({ book: parts[1], chapter: parts[2], verse: parts[3] });
                                      }}
                                    />
                                  </div>
                                  {verseNote && (
                                    <p className="text-sm italic mt-3 pt-3" style={{ color: isDarkMode ? '#E0C068' : '#B45309', borderTop: `1px solid ${isDarkMode ? '#E0C068' : '#FCD34D'}` }}>
                                      📝 {verseNote}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Study Tools Panel (Notebook, Cross-References, Commentaries) */}
              {showStudyTools && (
                <div className="mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                  <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor }}>
                    <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: textColor }}>
                      <BookMarked className="w-4 h-4" style={{ color: primaryColor }} /> Study Tools
                    </h3>
                    <button onClick={() => setShowStudyTools(false)} className="text-xs opacity-50 hover:opacity-100" style={{ color: textColor }}>✕</button>
                  </div>
                  <div className="px-6 py-2 border-b flex gap-1" style={{ borderColor }}>
                    {[
                      { key: 'notebook', label: '📓 Notebook', icon: BookMarked },
                      { key: 'commentary', label: '✨ AI Commentary', icon: GraduationCap },
                      { key: 'xref', label: '🔗 Cross-Refs', icon: GitBranch },
                      { key: 'commentaries', label: '🎓 Commentaries', icon: GraduationCap },
                      { key: 'concordancer', label: '📚 Concordancer', icon: BookOpen },
                      { key: 'ai_tools', label: '✨ AI Hub', icon: GraduationCap },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setStudyToolTab(t.key)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                        style={{
                          background: studyToolTab === t.key ? primaryColor : 'transparent',
                          color: studyToolTab === t.key ? '#fff' : textColor,
                          opacity: studyToolTab === t.key ? 1 : 0.6,
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-5">
                    {studyToolTab === 'notebook' && (
                      <DigitalNotebook currentUser={currentUser} book={book} chapter={chapter} translation={translation} />
                    )}
                    {studyToolTab === 'commentary' && (
                      <AIVerseCommentaryPanel
                        book={book}
                        chapter={chapterNum}
                        verseStart={selectedVerseForStudy?.verse || 1}
                        verseEnd={selectedVerseForStudy?.verse || verses[verses.length - 1]?.verse || 1}
                        verseText={selectedVerseForStudy?.text || verses.slice(0, 8).map(v => `${v.verse}. ${v.text}`).join(' ')}
                        translation={translation}
                        language={localStorage.getItem('faithlight_ui_lang') || 'en'}
                      />
                    )}
                    {studyToolTab === 'xref' && (
                      <CrossReferencePanel
                        book={book}
                        chapter={chapter}
                        verse={selectedVerseForStudy?.verse}
                        verseText={selectedVerseForStudy?.text}
                        isDarkMode={isDarkMode}
                      />
                    )}
                    {studyToolTab === 'commentaries' && (
                      <ScholarCommentaries
                        book={book}
                        chapter={chapter}
                        verse={selectedVerseForStudy?.verse}
                        verseText={selectedVerseForStudy?.text}
                        isDarkMode={isDarkMode}
                      />
                    )}
                    {studyToolTab === 'concordancer' && (
                      <Concordancer translation={translation} isDarkMode={isDarkMode} />
                    )}
                    {studyToolTab === 'ai_tools' && (
                      <AITheologyHub currentUser={currentUser} book={book} chapter={chapter} />
                    )}
                  </div>
                </div>
              )}

              {/* Toolbar for Study Tools & Community */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setShowStudyTools(v => !v)}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-all font-medium"
                  style={{
                    background: showStudyTools ? primaryColor : cardColor,
                    color: showStudyTools ? '#fff' : textColor,
                    borderColor: showStudyTools ? primaryColor : borderColor,
                  }}
                >
                  <BookMarked className="w-3.5 h-3.5" /> Study Tools
                </button>
                <button
                  onClick={() => setShowCommunity(v => !v)}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-all font-medium"
                  style={{
                    background: showCommunity ? primaryColor : cardColor,
                    color: showCommunity ? '#fff' : textColor,
                    borderColor: showCommunity ? primaryColor : borderColor,
                  }}
                >
                  <Users className="w-3.5 h-3.5" /> Community
                </button>
              </div>

              {/* Community Panel */}
              {showCommunity && (
                <div className="mb-6" style={{ backgroundColor: cardColor, borderRadius: '8px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                  <Tabs defaultValue="highlights" className="w-full">
                    <div className="px-6 py-3 border-b" style={{ borderColor: borderColor }}>
                      <TabsList className="w-full">
                        <TabsTrigger value="highlights" className="flex-1">Community Insights</TabsTrigger>
                        <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                        <TabsTrigger value="groups" className="flex-1">Group Plans</TabsTrigger>
                        <TabsTrigger value="devotional" className="flex-1">Devotional</TabsTrigger>
                        <TabsTrigger value="xref" className="flex-1">Cross-Refs</TabsTrigger>
                        <TabsTrigger value="summary" className="flex-1">Book Summary</TabsTrigger>
                        <TabsTrigger value="discussions" className="flex-1">Discussions</TabsTrigger>
                         <TabsTrigger value="ai-commentary" className="flex-1">AI Commentary</TabsTrigger>

                      </TabsList>
                    </div>
                    <div className="px-6 py-4">
                      <TabsContent value="highlights">
                        <CommunityHighlights 
                          book={book}
                          chapter={chapter}
                          translation={translation}
                          currentUser={currentUser}
                        />
                      </TabsContent>
                      <TabsContent value="comments">
                        <VerseCommentPanel
                          book={book}
                          chapter={chapterNum}
                          reference={`${book} ${chapterNum}`}
                          user={currentUser}
                        />
                      </TabsContent>
                      <TabsContent value="groups">
                        <GroupReadingPlanManager user={currentUser} />
                      </TabsContent>
                      <TabsContent value="devotional">
                        <AIDevotionalGenerator user={currentUser} readingHistory={readingHistory} />
                      </TabsContent>
                      <TabsContent value="xref">
                        <CrossReferenceSuggester 
                          verse={selectedVerseForStudy || verses[0]} 
                          onVerseClick={(ref) => console.log('Navigate to:', ref)}
                        />
                      </TabsContent>
                      <TabsContent value="summary">
                        <BookSummaryPanel book={book} />
                      </TabsContent>
                      <TabsContent value="discussions">
                        <ChapterDiscussionPanel
                          book={book}
                          chapter={chapter}
                          translation={translation}
                          currentUser={currentUser}
                        />
                      </TabsContent>
                       <TabsContent value="ai-commentary">
                         <AICommentaryPanel 
                           book={book}
                           chapter={chapter}
                           verse={selectedVerseForStudy?.verse || verses[0]?.verse}
                           text={selectedVerseForStudy?.text || verses[0]?.text}
                           translation={translation}
                         />
                       </TabsContent>

                    </div>
                  </Tabs>
                </div>
              )}

              {/* AI Panel */}
              {showAIPanel && (
                <div className="mb-6" style={{ backgroundColor: cardColor, borderRadius: '8px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                  <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: borderColor }}>
                    <MessageCircle className="w-5 h-5" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: textColor }}>Ask About This Passage</h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                      {messages.map((msg, idx) => (
                        <ChatMessage key={idx} message={msg} />
                      ))}
                    </div>

                    <form onSubmit={handleAskAI} className="space-y-3">
                      <Textarea
                        placeholder="Ask a question about this passage..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="min-h-20 rounded-lg"
                        style={{ borderColor: borderColor, color: textColor, backgroundColor: bgColor }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            if (!loading) handleAskAI(e);
                          }
                        }}
                      />
                      <Button 
                        type="submit" 
                        disabled={loading || !input.trim()}
                        className="w-full gap-2 font-semibold"
                        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            Ask
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : book && chapter && isLoading ? (
            <div className="text-center py-16" style={{ backgroundColor: cardColor, borderRadius: '8px', border: `1px solid ${borderColor}` }}>
              <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: primaryColor }} />
              <p className="font-semibold text-base" style={{ color: textColor }}>Loading {book} {chapter}…</p>
            </div>
          ) : book && chapter && !isLoading && !isOnline ? (
            <div className="text-center py-16" style={{ backgroundColor: cardColor, borderRadius: '8px', border: `2px dashed ${borderColor}` }}>
              <WifiOff className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
              <p className="font-semibold text-lg mb-2" style={{ color: textColor }}>No Offline Content Available</p>
              <p className="text-sm mb-6" style={{ color: mutedColor }}>
                This chapter hasn't been downloaded yet. Connect to the internet to access it or download it for offline reading.
              </p>
              <Link to={createPageUrl('OfflineBibleManager')}>
                <Button variant="outline" style={{ borderColor: borderColor, color: primaryColor }}>
                  <HardDrive className="w-4 h-4 mr-2" />
                  View Downloads
                </Button>
              </Link>
            </div>
          ) : book && chapter && !isLoading && verses.length === 0 ? (
            <div className="text-center py-16" style={{ backgroundColor: cardColor, borderRadius: '8px', border: `2px dashed ${borderColor}` }}>
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: borderColor }} />
              <p className="font-semibold text-base" style={{ color: textColor }}>No verses found for {book} {chapter}</p>
              <p className="text-sm mt-2" style={{ color: mutedColor }}>Try a different translation or check your connection.</p>
            </div>
          ) : (
            <div className="text-center py-16" style={{ backgroundColor: cardColor, borderRadius: '8px', border: `2px dashed ${borderColor}` }}>
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: borderColor }} />
              <p className="font-semibold text-base" style={{ color: textColor }}>Select a passage to get started</p>
              <p className="text-sm mt-2" style={{ color: mutedColor }}>Choose a book and chapter above</p>
            </div>
          )}

          {/* Chapter Navigation */}
          <ReaderBottomNav
            book={book}
            chapter={chapter}
            isDarkMode={isDarkMode}
            onChapterChange={(newChapter) => {
              setChapter(newChapter);
              queryClient.removeQueries({ queryKey: ['bibleVerses'] });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Verse-by-Verse Audio Player */}
          {book && chapter && verses.length > 0 && (
            <div className="mt-6">
              <VerseAudioPlayer
                book={book}
                chapter={chapter}
                verses={verses}
                isDarkMode={isDarkMode}
                onVerseChange={setActiveAudioVerseIdx}
              />
            </div>
          )}

          {/* Multi-Translation Comparison — enhanced side-by-side with diff + AI summary */}
          {book && chapter && verses.length > 0 && (
            <div className="mt-4">
              <MultiTranslationCompare
                book={book}
                chapter={parseInt(chapter)}
                defaultTranslation={translation}
              />
            </div>
          )}

          {/* AI Theology Hub */}
          {book && chapter && (
            <div className="mt-4">
              <AITheologyHub currentUser={currentUser} book={book} chapter={chapter} />
            </div>
          )}

          {/* Community Bible Hub */}
          {book && chapter && (
            <div className="mt-4">
              <CommunityBibleHub currentUser={currentUser} book={book} chapter={chapter} />
            </div>
          )}

          {/* Prayer Journal + Verse Share — shown when verse selected */}
          {selectedVerseForSharing && (
            <div className="mt-6 space-y-4">
              <VerseSharePanel
                verseText={selectedVerseForSharing.text}
                reference={`${book} ${chapter}:${selectedVerseForSharing.verse}`}
              />
              <PrayerJournalPanel
                verseReference={`${book} ${chapter}:${selectedVerseForSharing.verse}`}
                currentAudioTime={currentAudioTime}
              />
              <button
                onClick={() => setSelectedVerseForSharing(null)}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕ Close
              </button>
            </div>
          )}

          {/* Bottom Sections */}
          <div className="mt-8 space-y-4">
            {/* Reading Goal */}
            {currentUser && (
              <ReadingGoalWidget
                user={currentUser}
                chaptersReadToday={chaptersReadToday}
                versesReadToday={verses.length}
              />
            )}

            {/* AI Study Plan Builder */}
            <div style={{ backgroundColor: cardColor, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
              <AIStudyPlanBuilder currentUser={currentUser} isDarkMode={isDarkMode} />
            </div>

            {/* Enhanced Offline Download Manager */}
            <div style={{ backgroundColor: cardColor, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
              <div className="flex items-center gap-2 mb-4">
                <HardDrive className="w-5 h-5" style={{ color: primaryColor }} />
                <h3 className="font-semibold text-sm" style={{ color: textColor }}>Offline Library</h3>
              </div>
              <OfflineDownloadManager translation={translation} />
            </div>

            <StorageIndicator isDarkMode={isDarkMode} />
          </div>
          </div>
          </main>

      {/* Step 6: Floating Action Buttons */}
      {selectedPassage && (
        <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-3">
          <Button
            size="icon"
            onClick={() => setShowCommunity(!showCommunity)}
            className="rounded-full shadow-lg"
            style={{ 
              backgroundColor: '#8B5CF6', 
              color: '#FFFFFF',
              width: '56px',
              height: '56px'
            }}
            title="Community insights & discussions"
          >
            <Users className="w-6 h-6" />
          </Button>
          <Button
            size="icon"
            onClick={() => setShowAudioBar(!showAudioBar)}
            className="rounded-full shadow-lg"
            style={{ 
              backgroundColor: '#C9A24D', 
              color: '#FFFFFF',
              width: '56px',
              height: '56px'
            }}
            title="Listen to chapter"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v9.28c-.47-.46-1.12-.75-1.84-.75-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </Button>
          <Button
            size="icon"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="rounded-full shadow-lg"
            style={{ 
              backgroundColor: '#6B8E6E', 
              color: '#FFFFFF',
              width: '56px',
              height: '56px'
            }}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Floating Audio Bar */}
      {showAudioBar && selectedPassage && (
        <div style={{ marginBottom: '80px' }}>
          <FloatingAudioBar 
            verses={verses} 
            book={book}
            chapter={chapter}
            translation={translation}
            isDarkMode={isDarkMode}
            onClose={() => setShowAudioBar(false)}
          />
        </div>
      )}

      {/* Highlight Panel */}
      {showHighlightPanel && selectedVerseForHighlight && (
        <VerseHighlightPanel
          verse={selectedVerseForHighlight}
          user={currentUser}
          onClose={(refresh) => {
            setShowHighlightPanel(false);
            if (refresh) {
              queryClient.invalidateQueries({ queryKey: ['verseHighlights'] });
            }
          }}
        />
      )}

      {/* Go To Verse Dialog */}
      <GoToVerse
        open={showGoTo}
        onOpenChange={setShowGoTo}
        onNavigate={handleGoToVerse}
        isDarkMode={isDarkMode}
      />

      {shareImageVerse && (
        <VerseShareImageModal
          open={shareImageModalOpen}
          onOpenChange={setShareImageModalOpen}
          verse={shareImageVerse.text}
          reference={`${book} ${chapter}:${shareImageVerse.verse}`}
          isDarkMode={isDarkMode}
        />
      )}

      {reflectionModalOpen && reflectionVerse && (
        <VerseReflectionModal
          verse={reflectionVerse}
          book={book}
          chapter={chapter}
          user={currentUser}
          isDarkMode={isDarkMode}
          onClose={() => setReflectionModalOpen(false)}
        />
      )}

      {selectedVerseForExplanation && (
        <VerseExplanationModal
          open={explanationModalOpen}
          onClose={() => setExplanationModalOpen(false)}
          verse_reference={selectedVerseForExplanation.reference}
          verse_text={selectedVerseForExplanation.text}
        />
      )}
      </main>
      </BibleReaderErrorBoundary>
      );
      }