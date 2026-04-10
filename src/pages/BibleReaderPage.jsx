import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/PullToRefresh';
import { ChevronLeft, ChevronRight, BookOpen, Volume2, Loader2, AlertCircle, ArrowLeft, Share2, Bookmark, Copy, Mic, Download, Info, Highlighter, Check, Sparkles, Heart } from 'lucide-react';
import { addFavorite, removeFavorite, isFavorite } from '@/components/bible/FavoritesManager';
import { getVerse, getChapter } from '@/lib/bibleDataService';
import { parseScriptureReference, getBookDisplayName, isLanguageAvailable } from '@/lib/bibleDataValidator';
import ChapterAudioPlayer from '@/components/bible/ChapterAudioPlayer';
import ChapterAudioPlayerBrain from '@/components/bible/ChapterAudioPlayerBrain';
import { BIBLE_BOOKS, getBookName } from '@/lib/bibleBookNames';
import { saveChapterOffline, isChapterOffline } from '@/lib/offlineChapterDB';
import VerseImageGenerator from '@/components/verse/VerseImageGenerator';
import { getBibleLangConfig } from '@/lib/bibleLangConfig';
import { getAvailableLanguages, isBibleLanguageReady, ALL_LANGUAGES } from '@/lib/bibleLanguageAvailability';
import { useBibleDataset } from '@/components/hooks/useBibleDataset';
import OfflineCacheIndicator from '@/components/bible/OfflineCacheIndicator';
import { formatTextError } from '@/lib/bibleBibleChapterFetch';
import VerseExplainPanel from '@/components/bible/VerseExplainPanel';
import VerseAIStudyPanel from '@/components/bible/VerseAIStudyPanel';
import VerseHighlightSheet, { HIGHLIGHT_STYLES } from '@/components/bible/VerseHighlightSheet';
import VerseAudioBar from '@/components/bible/VerseAudioBar';
import { resolveReaderLanguage, isOldTestament, CHAPTER_UNAVAILABLE_MESSAGES, BIBLE_TEXT_CONFIG, getAvailableReadingLanguages } from '@/lib/bibleTextConfig';
import { getBibleConfig, getUnavailableMessage } from '@/lib/bibleBrainConfig';
import { useLanguageStore } from '@/stores/languageStore';
import { getOromoBibleChapter } from '@/lib/getOromoBibleChapter';
import VerseShareOverlay from '@/components/bible/VerseShareOverlay';
import { getReaderTheme } from '@/lib/readerTheme';
import ReaderThemePicker from '@/components/bible/ReaderThemePicker';
import { getLocalHighlightsForChapter, setLocalHighlight, removeLocalHighlight } from '@/lib/localHighlights';
import { getCachedChapter, cacheChapter } from '@/lib/bibleOfflineCache';
import { AccessibleSelect } from '@/components/ui/accessible-select';
import { refreshBibleReader } from '@/utils/pageRefreshHandlers';

// ── UI label strings ──────────────────────────────────────────────────────────
const UI = {
  en: {
    title: 'Bible Reader', selectBook: 'Select Book', selectChapter: 'Select Chapter',
    prev: 'Previous', next: 'Next', playAudio: 'Play Audio', noAudio: 'Audio not available',
    back: 'Back', share: 'Share', bookmark: 'Bookmark', copy: 'Copy',
    highlight: 'Highlight', explain: 'Explain This Verse', attachPrayer: 'Attach to Prayer',
    attachComment: 'Attach to Comment', verseUnavailable: 'Verse text is not available',
    chapterUnavailable: 'This chapter is not available', tryAnother: 'Try another chapter',
    audioUnavailableChapter: 'Audio not available for this chapter',
    readerUnavailable: 'Bible reader is unavailable right now',
    chapterNotFound: 'Chapter not found', oldTestament: 'Old Testament',
    newTestament: 'New Testament', loading: 'Loading scripture...',
    liveUnavailableFallback: 'Showing saved verse — live chapter unavailable',
    aiTranslatedNote: 'AI-assisted translation from English',
    fallbackNote: 'Bible not available in this language — showing English',
    createImage: 'Create Image',
    makeSermon: 'Make Sermon',
  },
  om: {
    title: 'Dubbisaa Macaafa Qulqulluu', selectBook: 'Kitaaba Filadhu',
    selectChapter: 'Boqonnaa Filadhu', prev: 'Duraa', next: 'Itti Fufaa',
    playAudio: 'Dhaggeeffadhu', noAudio: 'Sagaleen aayata kanaaf hin jiru',
    back: 'Duubatti', share: 'Qoodi', bookmark: 'Mallattoo Dubbisaa', copy: 'Koppii Godhi',
    highlight: 'Cimsii', explain: 'Luqqisa Ibsi', attachPrayer: 'Kadhataatti Maxxansi',
    attachComment: 'Yaadannoo irratti Maxxansi', verseUnavailable: 'Barruun aayataa yeroo ammaa hin argamu',
    chapterUnavailable: 'Boqonnaan kun afaan kanaan hin argamu', tryAnother: 'Boqonnaa biraa yaali',
    audioUnavailableChapter: 'Sagaleen boqonnaa kanaaf hin jiru',
    readerUnavailable: 'Dubbisaan Macaafa Qulqulluu yeroo ammaa hin hojjetu',
    chapterNotFound: 'Boqonnaan hin argamne', oldTestament: 'Kakuu Moofaa',
    newTestament: 'Kakuu Haaraa', loading: "Macaafa Qulqulluu fe'amaa jira...",
    liveUnavailableFallback: 'Odeeffannoon boqonnaa hin jiru; barruun kuufame agarsiifamaa jira',
    fallbackNote: 'Macaafni Qulqulluun afaan kanaan hin argamu — afaan Ingiliffaan agarsiifamaa jira',
    createImage: 'Suuraa Uumi',
    makeSermon: 'Lallaba Hojii',
  },
  hae: {
    title: 'Dubbisaa Macaafa Qulqulluu (Bahaa)', selectBook: 'Kitaaba Filadhu',
    selectChapter: 'Boqonnaa Filadhu', prev: 'Duraa', next: 'Itti Fufaa',
    playAudio: 'Dhaggeeffadhu', noAudio: 'Sagaleen aayata kanaaf hin jiru',
    back: 'Duubatti', share: 'Qoodi', bookmark: 'Mallattoo Dubbisaa', copy: 'Koppii Godhi',
    highlight: 'Cimsii', explain: 'Luqqisa Ibsi', attachPrayer: 'Kadhataatti Maxxansi',
    attachComment: 'Yaadannoo irratti Maxxansi', verseUnavailable: 'Barruun aayataa yeroo ammaa hin argamu',
    chapterUnavailable: 'Boqonnaan kun afaan kanaan hin argamu', tryAnother: 'Boqonnaa biraa yaali',
    audioUnavailableChapter: 'Sagaleen boqonnaa kanaaf hin jiru',
    readerUnavailable: 'Dubbisaan Macaafa Qulqulluu yeroo ammaa hin hojjetu',
    chapterNotFound: 'Boqonnaan hin argamne', oldTestament: 'Kakuu Moofaa',
    newTestament: 'Kakuu Haaraa', loading: "Macaafa Qulqulluu fe'amaa jira...",
    liveUnavailableFallback: 'Odeeffannoon boqonnaa hin jiru; barruun kuufame agarsiifamaa jira',
    fallbackNote: 'Macaafni Qulqulluun afaan kanaan hin argamu — afaan Ingiliffaan agarsiifamaa jira',
    createImage: 'Suuraa Uumi',
    makeSermon: 'Lallaba Hojii',
  },
  gaz: {
    title: 'Dubbisaa Macaafa Qulqulluu (Lixaa)', selectBook: 'Kitaaba Filadhu',
    selectChapter: 'Boqonnaa Filadhu', prev: 'Duraa', next: 'Itti Fufaa',
    playAudio: 'Dhaggeeffadhu', noAudio: 'Sagaleen aayata kanaaf hin jiru',
    back: 'Duubatti', share: 'Qoodi', bookmark: 'Mallattoo Dubbisaa', copy: 'Koppii Godhi',
    highlight: 'Cimsii', explain: 'Luqqisa Ibsi', attachPrayer: 'Kadhataatti Maxxansi',
    attachComment: 'Yaadannoo irratti Maxxansi', verseUnavailable: 'Barruun aayataa yeroo ammaa hin argamu',
    chapterUnavailable: 'Boqonnaan kun afaan kanaan hin argamu', tryAnother: 'Boqonnaa biraa yaali',
    audioUnavailableChapter: 'Sagaleen boqonnaa kanaaf hin jiru',
    readerUnavailable: 'Dubbisaan Macaafa Qulqulluu yeroo ammaa hin hojjetu',
    chapterNotFound: 'Boqonnaan hin argamne', oldTestament: 'Kakuu Moofaa',
    newTestament: 'Kakuu Haaraa', loading: "Macaafa Qulqulluu fe'amaa jira...",
    liveUnavailableFallback: 'Odeeffannoon boqonnaa hin jiru; barruun kuufame agarsiifamaa jira',
    fallbackNote: 'Macaafni Qulqulluun afaan kanaan hin argamu — afaan Ingiliffaan agarsiifamaa jira',
    createImage: 'Suuraa Uumi',
    makeSermon: 'Lallaba Hojii',
  },
  am: {
    title: 'መጽሐፍ ቅዱስ አንባቢ', selectBook: 'መጽሐፍ ይምረጡ', selectChapter: 'ምዕራፍ ይምረጡ',
    prev: 'ቀዳሚ', next: 'ቀጣይ', playAudio: 'ድምፅ አጫውት', noAudio: 'ድምፅ አይገኝም',
    back: 'ተመለስ', share: 'አጋራ', bookmark: 'ምልክት ያድርጉ', copy: 'ቅዳ',
    highlight: 'አብርህ', explain: 'ቁጥሩን ያብራሩ', attachPrayer: 'ወደ ጸሎት አያይዝ',
    attachComment: 'ወደ አስተያየት አያይዝ', verseUnavailable: 'የቁጥር ጽሑፍ አሁን አይገኝም',
    chapterUnavailable: 'ይህ ምዕራፍ በዚህ ቋንቋ አይገኝም', tryAnother: 'ሌላ ምዕራፍ ይሞክሩ',
    audioUnavailableChapter: 'ለዚህ ምዕራፍ ድምፅ አይገኝም',
    readerUnavailable: 'መጽሐፍ ቅዱስ አንባቢ አሁን አይሠራም',
    chapterNotFound: 'ምዕራፉ አልተገኘም', oldTestament: 'ብሉይ ኪዳን',
    newTestament: 'አዲስ ኪዳን', loading: 'መጽሐፍ ቅዱስ እየተጫነ ነው...',
    liveUnavailableFallback: 'የተቀመጠ ቁጥር ያሳያል — ቀጥታ ምዕራፍ አይገኝም',
    aiTranslatedNote: 'ከእንግሊዝኛ AI-assisted ትርጉም',
    fallbackNote: 'መጽሐፍ ቅዱስ በዚህ ቋንቋ አይገኝም — እንግሊዝኛ ያሳያል',
    createImage: 'ምስል ፍጠር',
    makeSermon: 'ስብከት ፍጠር',
  },
  sw: {
    title: 'Msomaji wa Biblia', selectBook: 'Chagua Kitabu', selectChapter: 'Chagua Sura',
    prev: 'Iliyotangulia', next: 'Inayofuata', playAudio: 'Sikiliza Sauti', noAudio: 'Sauti haipatikani',
    back: 'Rudi', share: 'Shiriki', bookmark: 'Alama', copy: 'Nakili',
    highlight: 'Angazia', explain: 'Eleza Aya Hii', attachPrayer: 'Ambatanisha na Sala',
    attachComment: 'Ambatanisha na Maoni', verseUnavailable: 'Maandishi ya aya hayapatikani',
    chapterUnavailable: 'Sura hii haipatikani kwa lugha hii', tryAnother: 'Jaribu sura nyingine',
    audioUnavailableChapter: 'Sauti haipatikani kwa sura hii',
    readerUnavailable: 'Msomaji wa Biblia haifanyi kazi sasa hivi',
    chapterNotFound: 'Sura haikupatikana', oldTestament: 'Agano la Kale',
    newTestament: 'Agano Jipya', loading: 'Inapakia maandiko...',
    liveUnavailableFallback: 'Inaonyesha aya iliyohifadhiwa — sura ya moja kwa moja haipatikani',
    aiTranslatedNote: 'Tafsiri ya AI kutoka Kiingereza',
    fallbackNote: 'Biblia haipatikani kwa lugha hii — inaonyesha Kiingereza',
    createImage: 'Unda Picha',
    makeSermon: 'Tengeneza Mahubiri',
  },
  ti: {
    title: 'መጽሓፍ ቅዱስ ኣንባቢ', selectBook: 'መጽሓፍ ምረጽ', selectChapter: 'ምዕራፍ ምረጽ',
    prev: 'ዝሓለፈ', next: 'ዝቕጽል', playAudio: 'ድምጺ ስማዕ', noAudio: 'ድምጺ ኣይርከብን',
    back: 'ተመለስ', share: 'ሸምግለ', bookmark: 'ምልክት ግበር', copy: 'ቅዳሕ',
    highlight: 'ብርሃን ግበር', explain: 'ንቁጽሪ ኣብርህ', attachPrayer: 'ናብ ጸሎት ኣተሓሕዝ',
    attachComment: 'ናብ ርእይቶ ኣተሓሕዝ', verseUnavailable: 'ጽሑፍ ቁጽሪ ሕጂ ኣይርከብን',
    chapterUnavailable: 'እዚ ምዕራፍ ኣብዚ ቋንቋ ኣይርከብን', tryAnother: 'ካልእ ምዕራፍ ፈትን',
    audioUnavailableChapter: 'ድምጺ ንዚ ምዕራፍ ኣይርከብን',
    readerUnavailable: 'ኣንባቢ መጽሓፍ ቅዱስ ሕጂ ኣይሰርሕን',
    chapterNotFound: 'ምዕራፍ ኣይተረኽበን', oldTestament: 'ብሉይ ኪዳን',
    newTestament: 'ሓዲሽ ኪዳን', loading: 'መጽሓፍ ቅዱስ ይጽዓን ኣሎ...',
    liveUnavailableFallback: 'ዝተቐመጠ ቁጽሪ ይሕዝ — ቀጥታ ምዕራፍ ኣይርከብን',
    aiTranslatedNote: 'ካብ እንግሊዝኛ AI ብሓገዝ ትርጉም',
    fallbackNote: 'መጽሓፍ ቅዱስ ኣብዚ ቋንቋ ኣይርከብን — እንግሊዝኛ ይሕዝ',
    createImage: 'ምስሊ ፍጠር',
    makeSermon: 'ስብከት ምፍጠር',
  },
};

const getUI = (lang) => UI[lang] || UI.en;

const OT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Moofaa');
const NT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Haaraa');
const CHAPTER_COUNTS = Object.fromEntries(BIBLE_BOOKS.map(b => [b.book_id, b.chapters_count]));

const BOOK_API_MAP = {
  GEN:'genesis',EXO:'exodus',LEV:'leviticus',NUM:'numbers',DEU:'deuteronomy',
  JOS:'joshua',JDG:'judges',RUT:'ruth','1SA':'1+samuel','2SA':'2+samuel',
  '1KI':'1+kings','2KI':'2+kings','1CH':'1+chronicles','2CH':'2+chronicles',
  EZR:'ezra',NEH:'nehemiah',EST:'esther',JOB:'job',PSA:'psalms',PRO:'proverbs',
  ECC:'ecclesiastes',SNG:'song+of+solomon',ISA:'isaiah',JER:'jeremiah',
  LAM:'lamentations',EZK:'ezekiel',DAN:'daniel',HOS:'hosea',JOL:'joel',
  AMO:'amos',OBA:'obadiah',JON:'jonah',MIC:'micah',NAH:'nahum',HAB:'habakkuk',
  ZEP:'zephaniah',HAG:'haggai',ZEC:'zechariah',MAL:'malachi',
  MAT:'matthew',MRK:'mark',LUK:'luke',JHN:'john',ACT:'acts',ROM:'romans',
  '1CO':'1+corinthians','2CO':'2+corinthians',GAL:'galatians',EPH:'ephesians',
  PHP:'philippians',COL:'colossians','1TH':'1+thessalonians','2TH':'2+thessalonians',
  '1TI':'1+timothy','2TI':'2+timothy',TIT:'titus',PHM:'philemon',HEB:'hebrews',
  JAS:'james','1PE':'1+peter','2PE':'2+peter','1JN':'1+john','2JN':'2+john',
  '3JN':'3+john',JUD:'jude',REV:'revelation'
};

const LANG_FULL_NAMES = {
  en: 'English', om: 'Afaan Oromoo (West Central)', am: 'Amharic', sw: 'Swahili',
  ti: 'Tigrinya', ar: 'Arabic', fr: 'French',
  hae: 'Afaan Oromoo (Eastern / Bahaa)',
  gaz: 'Afaan Oromoo (West Central / Lixaa Giddugaleessa)',
};

// ── Fetch helpers ─────────────────────────────────────────────────────────────
async function fetchEnglishChapter(bookId, chapter) {
  const book = BOOK_API_MAP[bookId] || bookId.toLowerCase();
  const resp = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
  if (!resp.ok) throw new Error('bible-api error');
  const json = await resp.json();
  if (!json.verses?.length) throw new Error('No verses');
  return json.verses;
}

async function fetchSwahiliChapter(bookId, chapter) {
  // Try Swahili Union Version via bible-api.com
  const book = BOOK_API_MAP[bookId] || bookId.toLowerCase();
  const resp = await fetch(`https://bible-api.com/${book}+${chapter}?translation=suv`);
  if (!resp.ok) throw new Error('bible-api sw error');
  const json = await resp.json();
  if (!json.verses?.length) throw new Error('No SW verses');
  return json.verses;
}

async function translateWithAI(enVerses, targetLang, bookName, chapter) {
  const passageText = enVerses.map(v => `${v.verse}. ${v.text.trim()}`).join('\n');
  const langFullName = LANG_FULL_NAMES[targetLang] || targetLang;
  const aiResp = await base44.integrations.Core.InvokeLLM({
    prompt: `Translate the following Bible passage from English into ${langFullName}.
This is sacred scripture — keep it faithful, reverent, and accurate.
Return ONLY a JSON object with key "verses" which is an array of objects with fields "verse_number" (integer) and "verse_text" (string).
Do not add commentary. Do not include anything outside the JSON.

Passage (${bookName} chapter ${chapter}):
${passageText}`,
    response_json_schema: {
      type: "object",
      properties: {
        verses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              verse_number: { type: "number" },
              verse_text: { type: "string" }
            }
          }
        }
      }
    }
  });
  return aiResp?.verses || [];
}

// ── Sub-components ────────────────────────────────────────────────────────────
function BookPickerModal({ lang, onSelect, onClose }) {
  const L = getUI(lang);
  const [query, setQuery] = useState('');
  const filtered = (books) => books.filter(b => {
    const name = lang === 'om' ? b.name_om : b.name_en;
    return !query || name.toLowerCase().includes(query.toLowerCase());
  });
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white w-full max-w-md flex flex-col" style={{ borderRadius: '24px 24px 0 0', maxHeight: '85vh' }}>
        <div className="px-5 pt-4 pb-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: '#1F2937' }}>{L.selectBook}</h2>
          <button onClick={onClose} aria-label="Close" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
            <span className="text-lg leading-none" style={{ color: '#6B7280' }}>×</span>
          </button>
        </div>
        <div className="px-4 py-2">
          <input
            className="w-full px-4 py-2.5 rounded-2xl text-sm border outline-none"
            style={{ backgroundColor: '#F8F6F1', borderColor: '#E5E7EB' }}
            placeholder={['om','hae','gaz'].includes(lang) ? 'Kitaaba barbaadi...' : lang === 'sw' ? 'Tafuta vitabu...' : 'Search books...'}
            value={query} onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto flex-1 px-3 pb-5">
          <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{L.oldTestament}</p>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {filtered(OT_BOOKS).map(b => (
              <button key={b.book_id} onClick={() => onSelect(b.book_id)}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: '#F8F6F1', color: '#1F2937', minHeight: '44px' }}>
                {['om','hae','gaz'].includes(lang) ? b.name_om : b.name_en}
              </button>
            ))}
          </div>
          <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{L.newTestament}</p>
          <div className="grid grid-cols-2 gap-1">
            {filtered(NT_BOOKS).map(b => (
              <button key={b.book_id} onClick={() => onSelect(b.book_id)}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: '#F8F6F1', color: '#1F2937', minHeight: '44px' }}>
                {['om','hae','gaz'].includes(lang) ? b.name_om : b.name_en}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterPickerModal({ bookId, lang, onSelect, onClose }) {
  const L = getUI(lang);
  const total = CHAPTER_COUNTS[bookId] || 1;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white w-full max-w-sm" style={{ borderRadius: '24px 24px 0 0', maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: '#1F2937' }}>{L.selectChapter}</h2>
          <button onClick={onClose} aria-label="Close" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
            <span className="text-lg leading-none" style={{ color: '#6B7280' }}>×</span>
          </button>
        </div>
        <div className="p-4 overflow-y-auto grid grid-cols-5 gap-2">
          {Array.from({ length: total }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => onSelect(n)}
              className="py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
              style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6', minHeight: '44px' }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VerseActionSheet({ verse, lang, onClose, onImageGen, onExplain, onHighlight, onSermon, onAIStudy, onShareCard, onAddNote }) {
  const L = getUI(lang);
  const sermonLabel = L.makeSermon || 'Make Sermon';
  const actions = [
    { label: L.explain, icon: BookOpen, accent: true },
    { label: 'AI Study Assistant', icon: Sparkles, aiAccent: true },
    { label: sermonLabel, icon: Sparkles, sermonAccent: true },
    { label: L.highlight || 'Highlight', icon: Highlighter },
    { label: 'Share Verse Card', icon: Share2, shareAccent: true },
    { label: 'Add Study Note', icon: Copy },
    { label: L.createImage, icon: Share2 },
    { label: L.copy, icon: Copy },
    { label: L.attachPrayer, icon: Mic },
  ];
  const handleAction = (label) => {
    if (label === L.explain) { onExplain?.(verse); onClose(); return; }
    if (label === 'AI Study Assistant') { onAIStudy?.(verse); onClose(); return; }
    if (label === sermonLabel) { onSermon?.(verse); onClose(); return; }
    if (label === (L.highlight || 'Highlight')) { onHighlight?.(verse); onClose(); return; }
    if (label === 'Share Verse Card') { onShareCard?.(verse); onClose(); return; }
    if (label === 'Add Study Note') { onAddNote?.(verse); onClose(); return; }
    if (label === L.createImage) { onImageGen?.(verse); onClose(); return; }
    if (label === L.copy) navigator.clipboard?.writeText(`${verse.reference_text}\n${verse.verse_text}`);
    if (label === L.share) navigator.share?.({ text: `${verse.reference_text}\n${verse.verse_text}` }).catch(() => {});
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full bg-white pb-safe" style={{ borderRadius: '24px 24px 0 0' }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ backgroundColor: '#E5E7EB' }} />
        <div className="px-4 pb-2 mb-1">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{verse.reference_text}</p>
        </div>
        {actions.map(({ label, icon: Icon, accent, sermonAccent, aiAccent, shareAccent }) => (
          <button key={label} onClick={() => handleAction(label)}
            className="w-full flex items-center gap-4 px-5 py-4 transition-colors hover:opacity-80">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: accent ? '#EDE9FE' : aiAccent ? '#F0FDF4' : sermonAccent ? '#FEF3C7' : shareAccent ? '#FEF3C7' : '#F3F4F6' }}>
              <Icon className="w-5 h-5" style={{ color: accent ? '#8B5CF6' : aiAccent ? '#16A34A' : sermonAccent ? '#D97706' : shareAccent ? '#EA580C' : '#6B7280' }} />
            </div>
            <span className="text-base font-medium" style={{ color: accent ? '#8B5CF6' : aiAccent ? '#16A34A' : sermonAccent ? '#D97706' : shareAccent ? '#EA580C' : '#1F2937' }}>{label}</span>
          </button>
        ))}
        <div className="px-4 pb-6 pt-2">
          <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-semibold"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
            {['om','hae','gaz'].includes(lang) ? 'Cufi' : lang === 'am' ? 'ዝጋ' : lang === 'sw' ? 'Funga' : lang === 'ti' ? 'ዕጸ' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Language status badge ─────────────────────────────────────────────────────
function LangStatusBadge({ langCfg, isAI }) {
  if (!langCfg) return null;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1"
      style={{ backgroundColor: langCfg.statusBg, color: langCfg.statusColor }}>
      {langCfg.nativeName}
      {isAI && <Info className="w-3 h-3" />}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BibleReaderPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  
  // Get app language from global language store (single source of truth)
  const { uiLanguage } = useLanguageStore(s => ({ uiLanguage: s.uiLanguage }));
  const appLanguage = uiLanguage || localStorage.getItem('faithlight_language') || 'en';
  const readerLanguage = resolveReaderLanguage(appLanguage);

  const initialBookId = urlParams.get('book_id') || 'MAT';
  const initialChapter = parseInt(urlParams.get('chapter') || '1') || 1;
  const initialVerseStart = parseInt(urlParams.get('verse_start') || '0') || 0;
  const initialVerseEnd = parseInt(urlParams.get('verse_end') || '0') || 0;
  const initialAttachedVerseId = urlParams.get('attached_verse_id') || null;

  // Sync reader language with app language using resolver
  const [lang, setLang] = useState(readerLanguage);
  const [bookId, setBookId] = useState(initialBookId);
  const [chapter, setChapter] = useState(initialChapter);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [attachedVerseBackup, setAttachedVerseBackup] = useState(null);
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);
  const [servingFromCache, setServingFromCache] = useState(false);
  const [showImageGen, setShowImageGen] = useState(null);
  const [explainVerse, setExplainVerse] = useState(null);
  const [aiStudyVerse, setAIStudyVerse] = useState(null);
  const [contentNote, setContentNote] = useState(null); // null | 'missing' | 'fallback'
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [highlightVerse, setHighlightVerse] = useState(null);
  const [userHighlights, setUserHighlights] = useState({}); // key: verse_id → color
  const [audioVerseNumber, setAudioVerseNumber] = useState(null); // verse showing the inline audio bar
  const [favoriteVerses, setFavoriteVerses] = useState({}); // verse_id → true
  const [shareVerse, setShareVerse] = useState(null); // verse for social share overlay
  const [readerTheme, setReaderTheme] = useState(() => getReaderTheme());
  const [localHighlights, setLocalHighlights] = useState({});
  const [isRefreshingChapter, setIsRefreshingChapter] = useState(false);
  const verseRefs = useRef({});

  // Track network status
  useEffect(() => {
    const goOnline = () => setIsNetworkOffline(false);
    const goOffline = () => setIsNetworkOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // Load favorites state for current chapter
  useEffect(() => {
    const map = {};
    // We'll check per-verse lazily, so just seed an empty map on chapter change
    setFavoriteVerses({});
  }, [bookId, chapter]);

  const toggleFavorite = (verse) => {
    const vid = verse.verse_id;
    if (isFavorite(vid)) {
      removeFavorite(vid);
      setFavoriteVerses(prev => { const n = { ...prev }; delete n[vid]; return n; });
    } else {
      addFavorite({ ...verse, book_id: bookId, chapter, language: lang });
      setFavoriteVerses(prev => ({ ...prev, [vid]: true }));
    }
  };

  const isVerseFavorited = (vid) => favoriteVerses[vid] ?? isFavorite(vid);

  // Load current user for highlights + reading plan tracking
  const [currentUser, setCurrentUser] = useState(null);
  const [chapterRead, setChapterRead] = useState(false);
  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  // Save last reading position for "Continue Reading"
  useEffect(() => {
    if (!bookId || !chapter) return;
    try {
      localStorage.setItem('faithlight_reading_history', JSON.stringify({
        book_id: bookId,
        book: getBookName(bookId, 'en'),
        chapter,
        timestamp: Date.now(),
      }));
    } catch {}
  }, [bookId, chapter]);

  // Reset read state when chapter changes
  useEffect(() => { setChapterRead(false); }, [bookId, chapter]);

  // Load local (device) highlights whenever chapter changes
  useEffect(() => {
    setLocalHighlights(getLocalHighlightsForChapter(bookId, chapter));
  }, [bookId, chapter]);

  const handleMarkChapterRead = async () => {
    if (!currentUser?.email || chapterRead) return;
    setChapterRead(true);
    // Find active reading plans and mark this chapter
    try {
      const plans = await base44.entities.UserReadingPlanProgress.filter(
        { user_email: currentUser.email, is_completed: false }, null, 10
      );
      for (const plan of plans) {
        const alreadyDone = plan.completed_days || [];
        const dayIndex = (plan.readings_cache || []).findIndex(
          r => r?.book_id === bookId && r?.chapter === chapter
        );
        if (dayIndex >= 0 && !alreadyDone.includes(dayIndex + 1)) {
          const updatedDays = [...alreadyDone, dayIndex + 1];
          await base44.entities.UserReadingPlanProgress.update(plan.id, {
            completed_days: updatedDays,
            last_read_at: new Date().toISOString(),
            is_completed: updatedDays.length >= plan.plan_duration_days,
          });
        }
      }
    } catch {}
    // Update BibleReadingProgress tracker
    try {
      const existing = await base44.entities.BibleReadingProgress.filter(
        { user_email: currentUser.email, book_id: bookId }, null, 1
      );
      const totalChaps = CHAPTER_COUNTS[bookId] || 1;
      if (existing[0]) {
        const chaptersRead = [...new Set([...(existing[0].chapters_read || []), chapter])];
        await base44.entities.BibleReadingProgress.update(existing[0].id, {
          chapters_read: chaptersRead,
          percent_complete: Math.round((chaptersRead.length / totalChaps) * 100),
          last_read_chapter: chapter,
          last_read_at: new Date().toISOString(),
        });
      } else {
        await base44.entities.BibleReadingProgress.create({
          user_email: currentUser.email,
          book_id: bookId,
          book_name: getBookName(bookId, 'en'),
          total_chapters: totalChaps,
          chapters_read: [chapter],
          percent_complete: Math.round((1 / totalChaps) * 100),
          last_read_chapter: chapter,
          last_read_at: new Date().toISOString(),
        });
      }
    } catch {}
  };

  // Load highlights for this chapter
  useEffect(() => {
    if (!currentUser?.email || !bookId || !chapter) return;
    base44.entities.UserHighlight.filter({ user_email: currentUser.email, book_id: bookId, chapter })
      .then(rows => {
        const map = {};
        rows.forEach(r => { map[r.verse_number] = r; });
        setUserHighlights(map);
      })
      .catch(() => {});
  }, [currentUser?.email, bookId, chapter]);

  const handleHighlight = async (color) => {
    if (!highlightVerse) return;
    const vNum = highlightVerse.verse_number;

    // Always persist locally (works offline / without login)
    setLocalHighlight(bookId, chapter, vNum, color);
    setLocalHighlights(prev => ({ ...prev, [vNum]: { color } }));

    // Also sync to backend if logged in
    if (currentUser?.email) {
      const existing = userHighlights[vNum];
      try {
        if (existing) {
          await base44.entities.UserHighlight.update(existing.id, { color });
        } else {
          await base44.entities.UserHighlight.create({
            user_email: currentUser.email,
            book_id: bookId,
            book_name: getBookName(bookId, lang),
            chapter,
            verse_number: vNum,
            verse_text: highlightVerse.verse_text,
            reference_text: highlightVerse.reference_text,
            color,
            language: lang,
          });
        }
        setUserHighlights(prev => ({ ...prev, [vNum]: { ...(existing || {}), color } }));
      } catch {}
    }
    setHighlightVerse(null);
  };

  const handleRemoveHighlight = async () => {
    if (!highlightVerse) return;
    const vNum = highlightVerse.verse_number;

    // Remove locally
    removeLocalHighlight(bookId, chapter, vNum);
    setLocalHighlights(prev => { const next = { ...prev }; delete next[vNum]; return next; });

    // Remove from backend if logged in
    if (currentUser?.email) {
      const existing = userHighlights[vNum];
      if (existing?.id) {
        await base44.entities.UserHighlight.delete(existing.id).catch(() => {});
        setUserHighlights(prev => { const next = { ...prev }; delete next[vNum]; return next; });
      }
    }
    setHighlightVerse(null);
  };

  // Load available languages on mount
  useEffect(() => {
    getAvailableLanguages().then(setAvailableLanguages).catch(err => {
      console.error('Error loading available languages:', err);
      setAvailableLanguages([{ code: 'en', name: 'English', native: 'English', available: true }]);
    });
  }, []);

  // Sync reader language when global app language changes
  useEffect(() => {
    const newReaderLang = resolveReaderLanguage(appLanguage);
    setLang(newReaderLang);
  }, [appLanguage]);

  // No languages are currently "coming soon" — hae/gaz/en are all active

  const bookName = getBookName(bookId, lang);
  const currentLangCfg = getBibleLangConfig(lang);
  const currentL = getUI(lang);
  const allBooks = [...OT_BOOKS, ...NT_BOOKS];

  // Audio is available for all supported languages via Bible Brain
  const hasAudio = true;
  const audioFilesetId = null;

  // If Oromo UI is selected but text unavailable, we'll show Oromo UI with English text gracefully
  const textAvailableLanguage = (() => {
    if (lang === 'en' || lang === 'ar') return lang; // English and Arabic always available
    // For Oromo, English will be shown as fallback
    return lang;
  })();

  useEffect(() => {
    if (!initialAttachedVerseId) return;
    base44.entities.AttachedVerse.filter({ id: initialAttachedVerseId }, null, 1)
      .then(rows => { if (rows?.[0]) setAttachedVerseBackup(rows[0]); })
      .catch(() => {});
  }, [initialAttachedVerseId]);

  // Use the Bible dataset hook
  const { loadChapter: loadChapterFromDataset, chapter: chapterData, loading: datasetLoading, error: datasetError, fallbackUsed } = useBibleDataset(lang);

  

const buildVerses = (rawVerses, bookIdArg, chapterArg, langCode) => {
  // Safe verse building — handle missing verses gracefully
  if (!Array.isArray(rawVerses)) return [];
  return rawVerses
    .filter(v => v && (v.verse || v.verse_number)) // Skip invalid verses
    .map(v => ({
      verse_number: v.verse || v.verse_number,
      verse_text: (v.text || '').trim(),
      verse_id: `${bookIdArg}-${chapterArg}-${v.verse || v.verse_number}`,
      reference_text: `${getBookName(bookIdArg, langCode)} ${chapterArg}:${v.verse || v.verse_number}`,
    }));
};

  const fetchChapter = useCallback(async (bkId, ch, langCode) => {
    setLoading(true);
    setError('');
    setVerses([]);
    setContentNote(null);

    // Map book IDs to bible-api.com names
    const bibleApiBook = BOOK_API_MAP[bkId] || bkId.toLowerCase();

    // Translation codes for bible-api.com (free, public-domain)
    const FREE_TRANSLATIONS = {
      en: 'kjv',
      fr: 'ls1910',   // Louis Segond 1910 (public domain)
      sw: 'suv',      // Swahili Union Version
      om: 'kjv',      // fallback KJV with note
      hae: 'kjv',
      gaz: 'kjv',
      am: 'kjv',
      ar: 'kjv',
      ti: 'kjv',
      om_eastern: 'kjv',
      om_west_central: 'kjv',
    };

    try {
      // 0. Check IndexedDB offline cache first (works when offline)
      const bibleId = langCode === 'en' ? 'kjv' : langCode;
      const offlineCached = await getCachedChapter(bibleId, bkId, ch);
      if (offlineCached?.verses?.length) {
        setVerses(buildVerses(offlineCached.verses, bkId, ch, langCode));
        setServingFromCache(true);
        setLoading(false);
        return;
      }
      setServingFromCache(false);

      // 0b. Check for Oromo Bible data first
      if (langCode === 'om') {
        const oromoVerses = getOromoBibleChapter('om', bkId, ch);
        if (oromoVerses && oromoVerses.length > 0) {
          setVerses(buildVerses(oromoVerses, bkId, ch, langCode));
          setContentNote(null);
          setLoading(false);
          return;
        }
      }

      // Normalize language code using config keys
      const normalizedLang = langCode === 'hae' ? 'om_eastern' :
                             langCode === 'gaz' ? 'om_west_central' :
                             langCode === 'om' ? 'om_west_central' : langCode;

      // 1. Try Bible Brain fileset if configured
      const textCfg = BIBLE_TEXT_CONFIG[normalizedLang];
      if (textCfg && textCfg.textFilesetId) {
        try {
          const resp = await base44.functions.invoke('bibleBrainFetch', {
            filesetId: textCfg.textFilesetId,
            bookId: bkId,
            chapter: ch,
          });
          const fetchedVerses = resp?.data?.verses || [];
          if (fetchedVerses.length > 0) {
            setVerses(buildVerses(fetchedVerses, bkId, ch, langCode));
            setContentNote(null);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn(`Bible Brain fetch failed for ${normalizedLang}:`, apiErr);
        }
      }

      // 2. Try BibleVerseText entity cache
      try {
        const verseData = await base44.entities.BibleVerseText.filter({
          language_code: normalizedLang,
          book_id: bkId,
          chapter: ch,
        }, 'verse', 500);
        if (verseData && verseData.length > 0) {
          setVerses(buildVerses(verseData, bkId, ch, langCode));
          setContentNote(null);
          setLoading(false);
          return;
        }
      } catch {}

      // 3. Free public-domain fallback via bible-api.com
      const translation = FREE_TRANSLATIONS[langCode] || FREE_TRANSLATIONS[normalizedLang] || 'kjv';
      const isNonEnglishFallback = translation === 'kjv' && !['en'].includes(langCode);

      const resp = await fetch(
        `https://bible-api.com/${bibleApiBook}+${ch}?translation=${translation}`
      );
      if (resp.ok) {
        const json = await resp.json();
        if (json.verses?.length > 0) {
          const built = buildVerses(json.verses, bkId, ch, langCode);
          setVerses(built);
          setContentNote(isNonEnglishFallback ? 'fallback' : null);
          setLoading(false);
          // Cache in IndexedDB for offline use
          cacheChapter(bibleId, bkId, ch, json.verses).catch(() => {});
          return;
        }
      }

      // 4. Nothing found — show friendly message
      const msg = CHAPTER_UNAVAILABLE_MESSAGES[normalizedLang] || CHAPTER_UNAVAILABLE_MESSAGES.en;
      setError(msg);
      setContentNote('missing');
      setLoading(false);

    } catch (err) {
      console.error('Error fetching chapter:', err);
      // Last resort: try plain KJV
      try {
        const resp = await fetch(`https://bible-api.com/${bibleApiBook}+${ch}?translation=kjv`);
        if (resp.ok) {
          const json = await resp.json();
          if (json.verses?.length > 0) {
            setVerses(buildVerses(json.verses, bkId, ch, langCode));
            setContentNote('fallback');
            setLoading(false);
            return;
          }
        }
      } catch {}
      const friendlyError = formatTextError(err, getUI(langCode).title);
      setError(friendlyError);
      setContentNote('missing');
      setLoading(false);
    }
  }, [loadChapterFromDataset]);

  // Handle dataset chapter updates
  useEffect(() => {
    if (chapterData && chapterData.success) {
      const loadedVerses = (chapterData.verses || []).map(v => ({
        verse_number: v.verse,
        verse_text: v.text,
        verse_id: `${bookId}-${chapter}-${v.verse}`,
        reference_text: `${chapterData.bookName || getBookName(bookId, lang)} ${chapter}:${v.verse}`,
      }));
      setVerses(loadedVerses);
      setLoading(false);
      setError('');
      setContentNote(null);
    } else if (chapterData && chapterData.success === false) {
      setError(chapterData.error || 'Failed to load chapter');
      setContentNote('missing');
      setLoading(false);
    }
  }, [chapterData, bookId, chapter, lang]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { 
    setLoading(datasetLoading);
    if (datasetError) setError(datasetError);
  }, [datasetLoading, datasetError]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchChapter(bookId, chapter, lang); }, [bookId, chapter, lang]);

  const handleRefreshChapter = useCallback(async () => {
    setIsRefreshingChapter(true);
    await fetchChapter(bookId, chapter, lang);
    setIsRefreshingChapter(false);
  }, [bookId, chapter, lang, fetchChapter]);

  const handleSaveOffline = async () => {
    if (!verses.length) return;
    try {
      await saveChapterOffline(lang, lang, bookId, chapter, verses);
      setIsOffline(true);
    } catch (e) {
      console.error('Offline save error:', e);
    }
  };

  useEffect(() => {
    isChapterOffline(lang, lang, bookId, chapter)
      .then(setIsOffline)
      .catch(() => setIsOffline(false));
  }, [lang, bookId, chapter]);

  useEffect(() => {
    if (!initialVerseStart || verses.length === 0) return;
    const t = setTimeout(() => {
      verseRefs.current[initialVerseStart]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
    return () => clearTimeout(t);
  }, [verses, initialVerseStart]);

  const handleSermon = (verse) => {
    const ref = encodeURIComponent(verse.reference_text);
    navigate(`/sermon-assistant?task=sermon_outline&text=${ref}`);
  };

  const handleAddNote = (verse) => {
    const params = new URLSearchParams({
      verse_reference: verse.reference_text,
      verse_text: verse.verse_text,
      book_id: bookId,
      book_name: bookName,
      chapter: String(chapter),
      verse: String(verse.verse_number),
    });
    navigate(`/StudyNotes?${params.toString()}`);
  };

  const handleBookSelect = (newBookId) => { setBookId(newBookId); setChapter(1); setBookPickerOpen(false); };
  const handleChapterSelect = (n) => { setChapter(n); setChapterPickerOpen(false); };

  const handlePrev = () => {
    if (chapter > 1) { setChapter(c => c - 1); return; }
    const idx = allBooks.findIndex(b => b.book_id === bookId);
    if (idx > 0) { const prev = allBooks[idx - 1]; setBookId(prev.book_id); setChapter(CHAPTER_COUNTS[prev.book_id] || 1); }
  };

  const handleNext = () => {
    const total = CHAPTER_COUNTS[bookId] || 1;
    if (chapter < total) { setChapter(c => c + 1); return; }
    const idx = allBooks.findIndex(b => b.book_id === bookId);
    if (idx < allBooks.length - 1) { const next = allBooks[idx + 1]; setBookId(next.book_id); setChapter(1); }
  };

  const isVerseHighlighted = (vNum) => {
    if (!initialVerseStart) return false;
    if (initialVerseEnd && initialVerseEnd > initialVerseStart) return vNum >= initialVerseStart && vNum <= initialVerseEnd;
    return vNum === initialVerseStart;
  };

  const T = readerTheme;

  return (
    <PullToRefresh onRefresh={handleRefreshChapter}>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: T.bg, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Top app bar */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: T.headerBg, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.history.back()}
            aria-label={currentL.back}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#F3F4F6' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: '#1F2937' }} />
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <button onClick={() => setBookPickerOpen(true)}
              aria-label={`${currentL.selectBook}: ${bookName}`}
              className="flex items-center gap-1.5 px-3 rounded-2xl font-semibold text-sm truncate transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6', minHeight: '44px' }}>
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{bookName}</span>
            </button>
            <button onClick={() => setChapterPickerOpen(true)}
              aria-label={`${currentL.selectChapter}: ${chapter}`}
              className="px-3 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#F3F4F6', color: '#1F2937', minHeight: '44px', minWidth: '44px' }}>
              {chapter}
            </button>
            <AccessibleSelect
              name="reader-language"
              value={lang}
              onValueChange={setLang}
              options={getAvailableReadingLanguages(bookId).map(({ value, label }) => ({ value, label }))}
              placeholder="Language"
              className="min-w-[80px]"
            />
          </div>

          <ReaderThemePicker currentThemeId={T.id} onThemeChange={setReaderTheme} />

          <button onClick={handleSaveOffline}
            aria-label={isOffline ? 'Saved offline' : 'Save for offline'}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: isOffline ? '#ECFDF5' : '#F3F4F6' }}>
            <Download className="w-5 h-5" style={{ color: isOffline ? '#16A34A' : '#6B7280' }} />
          </button>

          {hasAudio && (
            <button onClick={() => setShowAudio(v => !v)}
              aria-label={showAudio ? 'Hide audio player' : currentL.playAudio}
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: showAudio ? '#EDE9FE' : '#F3F4F6' }}>
              <Volume2 className="w-5 h-5" style={{ color: showAudio ? '#8B5CF6' : '#6B7280' }} />
            </button>
          )}
        </div>

        {showAudio && hasAudio && (
           <div className="max-w-2xl mx-auto px-4 pb-3">
             <ChapterAudioPlayerBrain
               bookId={bookId}
               chapter={chapter}
               language={lang}
               bookName={bookName}
               onClose={() => setShowAudio(false)}
             />
           </div>
         )}
        {/* Show audio unavailable message if audio button toggled but no audio */}
        {showAudio && !hasAudio && (
           <div className="max-w-2xl mx-auto px-4 pb-3 text-center text-sm" style={{ color: '#6B7280' }}>
             {currentL.noAudio}
           </div>
         )}

      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-32" style={{ color: T.text }}>

        {/* Offline / served-from-cache banner */}
        {(isNetworkOffline || servingFromCache) && (
          <div className="mb-4 p-3 rounded-2xl flex items-center gap-2" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <span className="text-base">📴</span>
            <p className="text-xs font-medium" style={{ color: '#1D4ED8' }}>
              {isNetworkOffline ? 'You\'re offline — showing cached content' : 'Loaded from offline cache'}
            </p>
          </div>
        )}

        {/* Language unavailable banner — only show for true missing languages, not OT unavailable */}
          {contentNote === 'missing' && !verses.length && !isOldTestament(bookId) && (
            <div className="mb-4 p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#DC2626' }} />
              <p className="text-sm leading-relaxed font-medium" style={{ color: '#991B1B', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                {CHAPTER_UNAVAILABLE_MESSAGES[lang] || CHAPTER_UNAVAILABLE_MESSAGES.en}
              </p>
            </div>
          )}

        {/* Fallback language banner (local data) */}
        {contentNote === 'fallback' && (
          <div className="mb-4 p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#D97706' }} />
            <p className="text-sm leading-relaxed font-medium" style={{ color: '#92400E', textAlign: lang === 'ar' ? 'right' : 'left' }}>
              {currentL.fallbackNote}
            </p>
          </div>
        )}

        {/* Fallback to Bible Brain banner */}
        {contentNote === 'bibleBrain' && (
          <div className="mb-4 p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#0284C7' }} />
            <p className="text-sm leading-relaxed font-medium" style={{ color: '#075985', textAlign: lang === 'ar' ? 'right' : 'left' }}>
              Loading from Bible Brain API...
            </p>
          </div>
        )}

        {/* Empty state when no verses available */}

        {/* Attached verse fallback */}
        {showFallbackBanner && attachedVerseBackup && (
          <div className="mb-4 p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#D97706' }} />
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#92400E' }}>{currentL.liveUnavailableFallback}</p>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs font-semibold mb-1" style={{ color: '#8B5CF6' }}>{attachedVerseBackup.reference_text}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#1F2937' }}>{attachedVerseBackup.verse_text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Show error only if not an OT unavailable case (OT unavailable is expected, not an error) */}
          {error && !loading && !(isOldTestament(bookId) && !BIBLE_TEXT_CONFIG[lang]?.hasOT) && (
            <div className="flex flex-col items-center py-20 text-center">
              <AlertCircle className="w-12 h-12 mb-4" style={{ color: '#FCA5A5' }} />
              <p className="text-base font-semibold mb-4" style={{ color: '#1F2937' }}>{error}</p>
              <button onClick={() => fetchChapter(bookId, chapter, lang)}
                className="px-5 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ backgroundColor: '#8B5CF6' }}>{currentL.tryAnother}</button>
            </div>
          )}

        {loading && (
          <div className="flex flex-col justify-center items-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B5CF6' }} />
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{currentL.loading}</p>
          </div>
        )}

        {!loading && !error && verses.length === 0 && !showFallbackBanner && (
           <div className="flex flex-col items-center py-20 text-center">
             <BookOpen className="w-12 h-12 mb-4" style={{ color: '#D1D5DB' }} />
             <p className="text-base font-semibold" style={{ color: '#1F2937' }}>{currentL.chapterUnavailable}</p>
             <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{currentL.tryAnother}</p>
             {/* Smart suggestion: skip to next available chapter */}
             <button
               onClick={() => handleNext()}
               className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
               style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}
             >
               Go to Next Chapter
             </button>
           </div>
         )}

        {/* Offline cache indicator */}
        {!loading && verses.length > 0 && (
          <div className="mb-4">
            <OfflineCacheIndicator
              languageCode={lang}
              bookId={bookId}
              chapter={chapter}
              verses={verses}
              uiLanguage={lang}
            />
          </div>
        )}

        {!loading && verses.length > 0 && (
          <div className="space-y-0.5">
            {verses.map((v) => {
              const urlHighlighted = isVerseHighlighted(v.verse_number);
              // Merge backend + local highlights (local takes priority for offline use)
              const userHL = localHighlights[v.verse_number] || userHighlights[v.verse_number];
              const hlStyle = userHL ? HIGHLIGHT_STYLES[userHL.color] : null;
              const selected = selectedVerse?.verse_number === v.verse_number;
              return (
                <div key={v.verse_id || v.verse_number}
                ref={el => { verseRefs.current[v.verse_number] = el; }}
                className="rounded-2xl px-4 py-3 cursor-pointer transition-all"
                style={{
                  backgroundColor: hlStyle ? hlStyle.bg : urlHighlighted ? '#EDE9FE' : selected ? '#F3F4F6' : 'transparent',
                  border: hlStyle ? `2px solid ${hlStyle.border}` : urlHighlighted ? '2px solid #A78BFA' : selected ? '1px solid #E5E7EB' : '2px solid transparent',
                }}
                onClick={() => setSelectedVerse(prev => prev?.verse_number === v.verse_number ? null : v)}
                >
                <div className="flex items-start gap-3" style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
                   <span className="text-xs font-bold mt-1.5 w-5 shrink-0" style={{ color: hlStyle ? hlStyle.border : urlHighlighted ? '#8B5CF6' : T.verseNumColor }}>
                     {v.verse_number}
                   </span>
                   <p className="leading-8 flex-1 text-[19px]" style={{ color: urlHighlighted ? '#5B21B6' : T.text, textAlign: lang === 'ar' ? 'right' : 'left' }}>
                      {(v?.verse_text || '').trim() || <span className="italic" style={{ color: '#9CA3AF' }}>{currentL.verseUnavailable}</span>}
                    </p>
                   {/* Favorite button */}
                   <button
                     onClick={(e) => { e.stopPropagation(); toggleFavorite(v); }}
                     aria-label={isVerseFavorited(v.verse_id) ? 'Remove from favorites' : 'Add to favorites'}
                     className="mt-1.5 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                     style={{ color: isVerseFavorited(v.verse_id) ? '#F43F5E' : '#D1D5DB' }}
                   >
                     <Heart size={13} fill={isVerseFavorited(v.verse_id) ? '#F43F5E' : 'none'} />
                   </button>
                   {/* Per-verse audio toggle */}
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       setAudioVerseNumber(prev => prev === v.verse_number ? null : v.verse_number);
                     }}
                     aria-label={audioVerseNumber === v.verse_number ? 'Hide audio' : 'Play audio'}
                     className="mt-1.5 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                     style={{
                       backgroundColor: audioVerseNumber === v.verse_number ? '#EDE9FE' : 'transparent',
                       color: audioVerseNumber === v.verse_number ? '#8B5CF6' : '#D1D5DB',
                     }}
                   >
                     <Volume2 size={13} />
                   </button>
                 </div>

                {/* Inline audio bar — shown when this verse's audio button is tapped */}
                {audioVerseNumber === v.verse_number && (
                  <VerseAudioBar
                    book={bookId}
                    chapter={chapter}
                    language={lang}
                    bookName={bookName}
                    activeVerseNumber={v.verse_number}
                    totalVerses={verses.length}
                  />
                )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom prev/next nav */}
      <div className="fixed z-30 left-0 right-0" style={{ bottom: '72px', backgroundColor: T.navBg, borderTop: `1px solid ${T.border}`, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        {/* Mark chapter as read */}
        {!loading && verses.length > 0 && currentUser && (
          <div className="max-w-2xl mx-auto px-4 pt-2">
            <button
              onClick={handleMarkChapterRead}
              disabled={chapterRead}
              className={`w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                chapterRead
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Check className="w-4 h-4" />
              {chapterRead ? (currentL.done || 'Done!') : (currentL.markRead || 'Mark Chapter Read')}
            </button>
          </div>
        )}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={handlePrev} aria-label={currentL.prev}
            className="flex items-center gap-1.5 px-4 rounded-2xl font-semibold text-sm transition-colors hover:opacity-80"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280', minHeight: '44px' }}>
            <ChevronLeft className="w-4 h-4" /> {currentL.prev}
          </button>
          <button onClick={() => setChapterPickerOpen(true)}
            aria-label={`${currentL.selectChapter}: ${bookName} ${chapter}`}
            className="text-sm font-bold px-4 rounded-2xl"
            style={{ color: '#8B5CF6', backgroundColor: '#EDE9FE', minHeight: '44px' }}>
            {bookName} {chapter}
          </button>
          <button onClick={handleNext} aria-label={currentL.next}
            className="flex items-center gap-1.5 px-4 rounded-2xl font-semibold text-sm transition-colors hover:opacity-80"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280', minHeight: '44px' }}>
            {currentL.next} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {bookPickerOpen && <BookPickerModal lang={lang} onSelect={handleBookSelect} onClose={() => setBookPickerOpen(false)} />}
      {chapterPickerOpen && <ChapterPickerModal bookId={bookId} lang={lang} onSelect={handleChapterSelect} onClose={() => setChapterPickerOpen(false)} />}
      {selectedVerse && <VerseActionSheet verse={selectedVerse} lang={lang} onClose={() => setSelectedVerse(null)} onImageGen={setShowImageGen} onExplain={setExplainVerse} onHighlight={(v) => setHighlightVerse(v)} onSermon={handleSermon} onAIStudy={setAIStudyVerse} onShareCard={setShareVerse} onAddNote={handleAddNote} />}
      {showImageGen && <VerseImageGenerator verse={showImageGen.verse_text} reference={showImageGen.reference_text} />}
      {explainVerse && <VerseExplainPanel verse={explainVerse} lang={lang} onClose={() => setExplainVerse(null)} />}
      {aiStudyVerse && <VerseAIStudyPanel verse={aiStudyVerse} lang={lang} onClose={() => setAIStudyVerse(null)} />}
      {shareVerse && (
        <VerseShareOverlay
          verse={shareVerse.verse_text}
          reference={shareVerse.reference_text}
          onClose={() => setShareVerse(null)}
        />
      )}
      {highlightVerse && (
        <VerseHighlightSheet
          verse={highlightVerse}
          existingColor={userHighlights[highlightVerse.verse_number]?.color}
          onHighlight={handleHighlight}
          onRemove={handleRemoveHighlight}
          onClose={() => setHighlightVerse(null)}
        />
      )}
      </div>
    </PullToRefresh>
  );
}