import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Share2, RefreshCw, BookOpen } from 'lucide-react';

// Picks a deterministic-but-daily random verse from BibleVerseText
function getTodaysSeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export default function DailyVerseFromDB({ language = 'en' }) {
   const [verse, setVerse] = useState(null);
   const [loading, setLoading] = useState(true);
   const [shared, setShared] = useState(false);
   const [source, setSource] = useState(null); // 'local' or 'biblebrain'

   useEffect(() => {
     let cancelled = false;

     const cacheKey = `daily_verse_db_${language}_${getTodaysSeed()}`;
     const cached = sessionStorage.getItem(cacheKey);
     if (cached) {
       try {
         const parsed = JSON.parse(cached);
         setVerse(parsed);
         setSource(parsed._source || 'local');
         setLoading(false);
         return;
       } catch {}
     }

     setLoading(true);
     setVerse(null);

     base44.entities.BibleVerseText.filter(
       { language_code: language },
       'created_date',
       500
     ).then(verses => {
       if (cancelled || !verses?.length) { 
         if (!cancelled) {
           // For Oromo, show unavailable if no local data
           if (language === 'om') {
             setLoading(false);
             return;
           }
           setLoading(false);
         }
         return;
       }
       // Use today's seed to pick a stable daily verse
       const idx = getTodaysSeed() % verses.length;
       const picked = { ...verses[idx], _source: 'local' };
       sessionStorage.setItem(cacheKey, JSON.stringify(picked));
       setVerse(picked);
       setSource('local');
       setLoading(false);
     }).catch(() => {
       if (!cancelled) setLoading(false);
     });

     return () => { cancelled = true; };
   }, [language]);

  const handleShare = async () => {
    if (!verse) return;
    const text = `"${verse.text}"\n— ${verse.reference || `${verse.book_name} ${verse.chapter}:${verse.verse}`}`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: 'Daily Bible Verse' });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="rounded-3xl p-5 animate-pulse" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="h-3 w-24 rounded bg-purple-100 mb-3" />
        <div className="h-4 w-full rounded bg-gray-100 mb-2" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
      </div>
    );
  }

  // No verse for Oromo when no local data available
  if (!verse && language === 'om') {
    return (
      <div className="rounded-3xl p-5" style={{ backgroundColor: '#FEF2F2', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #FECACA' }}>
        <p className="text-sm font-medium" style={{ color: '#991B1B' }}>
          Afaan Oromoo Bible is temporarily unavailable. Please use English for now.
        </p>
      </div>
    );
  }

  if (!verse) return null;

  const reference = verse.reference || `${verse.book_name} ${verse.chapter}:${verse.verse}`;

  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" style={{ color: '#8B5CF6' }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8B5CF6' }}>Daily Verse</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono uppercase" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
          {verse.language_code}
        </span>
      </div>

      {/* Reference */}
      <p className="text-sm font-semibold mb-2" style={{ color: '#8B5CF6' }}>{reference}</p>

      {/* Verse text */}
      <p className="text-base font-medium leading-7 mb-4" style={{ color: '#1F2937', fontStyle: 'italic' }}>
        "{verse.text}"
      </p>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-colors"
        style={{ backgroundColor: shared ? '#D1FAE5' : '#EDE9FE', color: shared ? '#065F46' : '#8B5CF6' }}
      >
        {shared ? (
          <>✓ Copied!</>
        ) : (
          <><Share2 className="w-4 h-4" /> Share</>
        )}
      </button>
    </div>
  );
}