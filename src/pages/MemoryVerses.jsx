import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Brain, Star, CheckCircle2, RotateCcw, BookOpen, Highlighter, TrendingUp } from 'lucide-react';
import AddVerseModal from '../components/memory/AddVerseModal.jsx';
import FlashcardView from '../components/memory/FlashcardView.jsx';
import { toast } from 'sonner';

const MASTERY_COLORS = {
  new: 'bg-gray-100 text-gray-600',
  learning: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-amber-100 text-amber-700',
  mastered: 'bg-green-100 text-green-700',
};

export default function MemoryVersesPage() {
  const [verses, setVerses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [filterMastery, setFilterMastery] = useState('all');
  const [highlights, setHighlights] = useState([]);
  const [showHighlights, setShowHighlights] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          const data = await base44.entities.MemoryVerse.filter({ user_id: u.id }, '-created_date');
          setVerses(data);
          // Load verse highlights (from study rooms & Bible reader)
          const hl = await base44.entities.VerseHighlight.filter({ user_id: u.id }, '-created_date', 30).catch(() => []);
          setHighlights(hl);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAddVerse = async (verseData) => {
    const created = await base44.entities.MemoryVerse.create({ ...verseData, user_id: user.id });
    setVerses(prev => [created, ...prev]);
    setShowAddModal(false);
  };

  const saveHighlightAsFlashcard = async (hl) => {
    const exists = verses.some(v => v.verse_ref === hl.verse_ref);
    if (exists) { toast.info('This verse is already in your flashcards'); return; }
    const created = await base44.entities.MemoryVerse.create({
      user_id: user.id,
      verse_ref: hl.verse_ref || hl.reference || 'Unknown',
      verse_text: hl.verse_text || hl.content || '',
      translation: 'WEB',
      mastery_level: 'new',
      tags: ['from-highlight'],
    });
    setVerses(prev => [created, ...prev]);
    toast.success('Highlight saved as flashcard!');
  };

  const handleReviewComplete = async (verse, quality) => {
    // SM-2 spaced repetition algorithm
    let { ease_factor = 2.5, interval_days = 1, review_count = 0 } = verse;
    const ef = Math.max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    let newInterval;
    if (quality < 3) {
      newInterval = 1;
    } else if (review_count === 0) {
      newInterval = 1;
    } else if (review_count === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval_days * ef);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    let mastery = 'learning';
    if (newInterval >= 21) mastery = 'mastered';
    else if (newInterval >= 7) mastery = 'reviewing';

    const updated = await base44.entities.MemoryVerse.update(verse.id, {
      ease_factor: ef,
      interval_days: newInterval,
      review_count: review_count + 1,
      next_review: nextReview.toISOString(),
      mastery_level: mastery,
    });
    setVerses(prev => prev.map(v => v.id === verse.id ? updated : v));
  };

  const handleDelete = async (id) => {
    await base44.entities.MemoryVerse.delete(id);
    setVerses(prev => prev.filter(v => v.id !== id));
  };

  const dueForReview = verses.filter(v => {
    if (!v.next_review) return true;
    return new Date(v.next_review) <= new Date();
  });

  const filtered = filterMastery === 'all' ? verses : verses.filter(v => v.mastery_level === filterMastery);

  const stats = {
    total: verses.length,
    mastered: verses.filter(v => v.mastery_level === 'mastered').length,
    due: dueForReview.length,
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Memory Verses</h2>
          <p className="text-gray-500 mb-4">Sign in to start memorizing Scripture</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-700 hover:bg-indigo-800">Sign In</Button>
        </div>
      </div>
    );
  }

  if (practiceMode) {
    return (
      <FlashcardView
        verses={dueForReview.length > 0 ? dueForReview : verses}
        onReviewComplete={handleReviewComplete}
        onExit={() => setPracticeMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" /> Memory Verses
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Memorize Scripture with spaced repetition</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-indigo-700 hover:bg-indigo-800 gap-1.5">
            <Plus className="w-4 h-4" /> Add Verse
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: stats.total, icon: BookOpen, color: 'text-indigo-600' },
            { label: 'Due Today', value: stats.due, icon: RotateCcw, color: 'text-amber-600' },
            { label: 'Mastered', value: stats.mastered, icon: Star, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Practice Button */}
        {verses.length > 0 && (
          <button
            onClick={() => setPracticeMode(true)}
            className="w-full mb-5 py-4 rounded-2xl font-bold text-white text-sm gap-2 flex items-center justify-center transition-all"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
          >
            <Brain className="w-5 h-5" />
            {dueForReview.length > 0 ? `Practice Now — ${dueForReview.length} verse${dueForReview.length > 1 ? 's' : ''} due` : 'Practice All Verses'}
          </button>
        )}

        {/* Highlights → Flashcards */}
        {highlights.length > 0 && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowHighlights(h => !h)}
              className="w-full flex items-center justify-between px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-amber-900 text-sm">Save Highlights as Flashcards</span>
                <span className="bg-amber-200 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">{highlights.length}</span>
              </div>
              <span className="text-amber-600 text-xs">{showHighlights ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showHighlights && (
              <div className="border-t border-amber-200 divide-y divide-amber-100 max-h-64 overflow-y-auto">
                {highlights.map(hl => {
                  const ref = hl.verse_ref || hl.reference || '';
                  const alreadySaved = verses.some(v => v.verse_ref === ref);
                  return (
                    <div key={hl.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-900">{ref}</p>
                        <p className="text-xs text-amber-700 line-clamp-1">{hl.verse_text || hl.content}</p>
                      </div>
                      <button
                        onClick={() => saveHighlightAsFlashcard(hl)}
                        disabled={alreadySaved}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors
                          ${alreadySaved ? 'bg-green-100 text-green-700' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
                        {alreadySaved ? '✓ Saved' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'new', 'learning', 'reviewing', 'mastered'].map(m => (
            <button key={m} onClick={() => setFilterMastery(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${filterMastery === m ? 'bg-indigo-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}>
              {m === 'all' ? 'All Verses' : m}
            </button>
          ))}
        </div>

        {/* Verses List */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Brain className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No verses yet</p>
            <p className="text-sm mt-1">Add a verse to start memorizing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(verse => (
              <div key={verse.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{verse.verse_ref}</p>
                    <Badge className={`text-xs mt-0.5 ${MASTERY_COLORS[verse.mastery_level] || MASTERY_COLORS.new}`}>
                      {verse.mastery_level || 'new'}
                    </Badge>
                  </div>
                  <button onClick={() => handleDelete(verse.id)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{verse.verse_text}</p>
                {verse.review_count > 0 && (
                  <p className="text-xs text-gray-400 mt-2">Reviewed {verse.review_count}× · Next: {verse.next_review ? new Date(verse.next_review).toLocaleDateString() : 'today'}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddVerseModal onAdd={handleAddVerse} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}