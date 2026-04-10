import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Sparkles, RefreshCw, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'fl_morning_devotion';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadCachedDevotion() {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (cached && cached.date === getTodayKey()) return cached;
  } catch {}
  return null;
}

function saveDevotion(devotion) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...devotion, date: getTodayKey() }));
}

export default function MorningDevotionCard() {
  const { user, isAuthenticated } = useAuth();
  const [devotion, setDevotion] = useState(loadCachedDevotion);
  const [loading, setLoading] = useState(!loadCachedDevotion());
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!devotion && isAuthenticated && user?.email) {
      generateDevotion();
    } else if (!devotion && !isAuthenticated) {
      generateGenericDevotion();
    }
  }, [isAuthenticated, user]);

  const generateDevotion = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch user's prayer journal entries and verse notes for context
      const [prayers, notes] = await Promise.all([
        base44.entities.PrayerRequest.filter({ userEmail: user.email }, '-created_date', 5).catch(() => []),
        base44.entities.VerseNote.filter({ userEmail: user.email }, '-created_date', 5).catch(() => []),
      ]);

      const prayerContext = prayers.map(p => p.title || p.body).slice(0, 3).join('; ');
      const verseContext = notes.map(n => n.reference).slice(0, 3).join(', ');

      const prompt = `You are a warm, faith-based devotional writer. Generate a short morning devotion (3-4 sentences max) that feels personal and uplifting.
${prayerContext ? `The user has been praying about: ${prayerContext}.` : ''}
${verseContext ? `They have been reading: ${verseContext}.` : ''}
Return JSON with: { title: string (5-7 words), reflection: string (2-3 sentences), verse: string (book:chapter:verse reference), verseText: string (short quote), prayer: string (1 sentence closing prayer) }`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            reflection: { type: 'string' },
            verse: { type: 'string' },
            verseText: { type: 'string' },
            prayer: { type: 'string' },
          },
        },
      });

      saveDevotion(result);
      setDevotion(result);
    } catch (e) {
      console.error(e);
      setError('Could not generate devotion. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateGenericDevotion = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a short uplifting morning devotion. Return JSON: { title: string, reflection: string (2-3 sentences), verse: string (reference), verseText: string (short), prayer: string (1 sentence) }`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            reflection: { type: 'string' },
            verse: { type: 'string' },
            verseText: { type: 'string' },
            prayer: { type: 'string' },
          },
        },
      });
      saveDevotion(result);
      setDevotion(result);
    } catch (e) {
      setError('Could not load devotion.');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDevotion(null);
    if (isAuthenticated && user?.email) generateDevotion();
    else generateGenericDevotion();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 pt-3">
        <div className="h-4 bg-violet-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-3 text-sm text-gray-500">
        {error}
        <button onClick={refresh} className="ml-2 text-violet-600 underline text-xs">Retry</button>
      </div>
    );
  }

  if (!devotion) return null;

  return (
    <div className="pt-3">
      {/* Title */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☀️</span>
          <h3 className="text-base font-bold text-gray-900 leading-tight">{devotion.title}</h3>
        </div>
        <button
          onClick={refresh}
          aria-label="Refresh devotion"
          className="text-gray-400 hover:text-violet-600 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Verse highlight */}
      {devotion.verseText && (
        <div className="bg-violet-50 border-l-4 border-violet-400 rounded-r-xl px-3 py-2.5 mb-3">
          <p className="text-xs font-bold text-violet-600 mb-1 flex items-center gap-1">
            <BookOpen size={11} /> {devotion.verse}
          </p>
          <p className="text-sm text-gray-700 italic leading-relaxed">"{devotion.verseText}"</p>
        </div>
      )}

      {/* Reflection */}
      <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
        {devotion.reflection}
      </p>

      <AnimatePresence>
        {expanded && devotion.prayer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-amber-700 mb-1">🙏 Prayer</p>
              <p className="text-sm text-gray-700 italic">{devotion.prayer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? 'Show less' : 'Read more and prayer'}
        className="mt-1 flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium min-h-[44px] px-1"
      >
        {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Read more & Prayer</>}
      </button>

      {isAuthenticated && (
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <Sparkles size={10} /> Personalized from your journal & verses
        </p>
      )}
    </div>
  );
}