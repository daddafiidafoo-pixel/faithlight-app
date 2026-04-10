import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Check, X, ChevronDown, ChevronUp, Star, BarChart2, BookOpen, Shuffle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const SR_INTERVALS = [1, 3, 7, 14, 30, 90];

function getNextReviewDate(level, isCorrect) {
  const newLevel = isCorrect ? Math.min(level + 1, SR_INTERVALS.length - 1) : Math.max(0, level - 1);
  return { newLevel, nextDate: new Date(Date.now() + SR_INTERVALS[newLevel] * 86400000).toISOString() };
}

function isDue(item) {
  return !item.next_review_date || new Date(item.next_review_date) <= new Date();
}

const LEVEL_LABELS = ['New', 'Learning', 'Familiar', 'Practiced', 'Strong', 'Mastered'];
const LEVEL_COLORS = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-purple-100 text-purple-700 border-purple-200',
];

// Review modes
const MODES = {
  type: 'Type from memory',
  reveal: 'See & judge',
  fill_blank: 'Fill in the blank',
};

function fillBlank(text) {
  const words = text.split(' ');
  if (words.length < 4) return { blanked: text, answer: text };
  // Blank out ~30% of significant words
  const blanked = words.map((w, i) => (i > 1 && i % 3 === 0 && w.length > 3) ? '___' : w).join(' ');
  return { blanked, answer: text };
}

function ProgressStats({ items }) {
  const total = items.length;
  const mastered = items.filter(i => i.level >= 5).length;
  const strong = items.filter(i => i.level === 4).length;
  const due = items.filter(isDue).length;
  const accuracy = total === 0 ? 0 : Math.round(
    items.reduce((s, i) => s + (i.review_count > 0 ? (i.correct_count / i.review_count) : 0), 0) / Math.max(1, items.filter(i => i.review_count > 0).length) * 100
  );

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        { label: 'Total', value: total, color: 'text-gray-700' },
        { label: 'Due', value: due, color: due > 0 ? 'text-red-600' : 'text-gray-400' },
        { label: 'Mastered', value: mastered, color: 'text-purple-600' },
        { label: 'Accuracy', value: `${accuracy}%`, color: 'text-green-600' },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-lg border border-gray-200 py-2">
          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          <p className="text-[10px] text-gray-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function VerseMemorizationTool({ userId }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState('review'); // review | list | add | stats
  const [reviewMode, setReviewMode] = useState('reveal');
  const [quizQueue, setQuizQueue] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [newVerse, setNewVerse] = useState({ reference: '', verse_text: '' });
  const [showHint, setShowHint] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ['memorization-items', userId],
    queryFn: () => base44.entities.MemorizationItem.filter({ user_id: userId }, 'next_review_date', 100).catch(() => []),
    enabled: !!userId,
  });

  const dueItems = items.filter(isDue);

  // Build quiz queue when switching to review tab
  useEffect(() => {
    if (tab === 'review') {
      setQuizQueue([...dueItems].sort(() => Math.random() - 0.5));
      setQuizIdx(0);
      setRevealed(false);
      setUserInput('');
      setShowHint(false);
    }
  }, [tab, dueItems.length]);

  const quizItem = quizQueue[quizIdx];
  const { blanked } = quizItem ? fillBlank(quizItem.verse_text) : { blanked: '' };

  const addItem = useMutation({
    mutationFn: () => base44.entities.MemorizationItem.create({
      user_id: userId,
      reference: newVerse.reference.trim(),
      verse_text: newVerse.verse_text.trim(),
      level: 0, review_count: 0, correct_count: 0,
      next_review_date: new Date().toISOString(),
    }),
    onSuccess: () => {
      toast.success('Added to memorization list!');
      setNewVerse({ reference: '', verse_text: '' });
      queryClient.invalidateQueries(['memorization-items', userId]);
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id) => base44.entities.MemorizationItem.delete(id),
    onSuccess: () => { toast.success('Removed'); queryClient.invalidateQueries(['memorization-items', userId]); },
  });

  const reviewItem = useMutation({
    mutationFn: ({ item, correct }) => {
      const { newLevel, nextDate } = getNextReviewDate(item.level || 0, correct);
      return base44.entities.MemorizationItem.update(item.id, {
        level: newLevel, next_review_date: nextDate,
        review_count: (item.review_count || 0) + 1,
        correct_count: (item.correct_count || 0) + (correct ? 1 : 0),
        last_reviewed: new Date().toISOString(),
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['memorization-items', userId]);
      setRevealed(false); setUserInput(''); setShowHint(false);
      if (quizIdx < quizQueue.length - 1) {
        setQuizIdx(i => i + 1);
      } else {
        toast.success('Review session complete! 🏆');
        setTab('stats');
      }
    },
  });

  const handleJudge = (correct) => reviewItem.mutate({ item: quizItem, correct });

  const handleCheck = () => {
    if (reviewMode === 'type') {
      setRevealed(true);
    } else {
      setRevealed(true);
    }
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardContent className="pt-4 pb-4">
        {/* Toggle Header */}
        <button className="w-full flex items-center justify-between" onClick={() => setExpanded(p => !p)}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-600 rounded-lg"><Brain className="w-4 h-4 text-white" /></div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Verse Memorization</p>
              <p className="text-xs text-gray-500">{items.length} verses · {dueItems.length} due for review</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dueItems.length > 0 && <Badge className="bg-red-500 text-white text-xs border-0">{dueItems.length} due</Badge>}
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-green-200 pb-2 flex-wrap">
              {[
                ['review', `Review (${dueItems.length})`],
                ['list', `All (${items.length})`],
                ['add', 'Add Verse'],
                ['stats', 'Stats'],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === key ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-green-100'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── REVIEW TAB ── */}
            {tab === 'review' && (
              <div>
                {dueItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-10 h-10 text-green-400 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">All caught up! 🎉</p>
                    <p className="text-xs text-gray-400 mt-1">Check back tomorrow for more reviews</p>
                  </div>
                ) : quizItem ? (
                  <div className="space-y-3">
                    {/* Mode selector */}
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.entries(MODES).map(([key, label]) => (
                        <button key={key} onClick={() => { setReviewMode(key); setRevealed(false); setUserInput(''); }}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${reviewMode === key ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{quizIdx + 1} / {quizQueue.length}</span>
                      <Badge className={`text-[10px] border ${LEVEL_COLORS[quizItem.level || 0]}`}>
                        {LEVEL_LABELS[quizItem.level || 0]}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div className="h-1 rounded-full bg-green-500 transition-all" style={{ width: `${((quizIdx) / quizQueue.length) * 100}%` }} />
                    </div>

                    {/* Card */}
                    <div className="bg-white border border-green-200 rounded-xl p-4 space-y-3">
                      <p className="text-center font-bold text-indigo-700 text-lg">{quizItem.reference}</p>

                      {/* Show hint */}
                      {!revealed && (
                        <button className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                          onClick={() => setShowHint(p => !p)}>
                          {showHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showHint ? 'Hide hint' : 'First word hint'}
                        </button>
                      )}
                      {showHint && !revealed && (
                        <p className="text-xs text-center text-gray-400 italic">"{quizItem.verse_text.split(' ').slice(0, 3).join(' ')}..."</p>
                      )}

                      {/* Input area based on mode */}
                      {!revealed && reviewMode === 'type' && (
                        <textarea className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-400"
                          placeholder="Type the verse from memory..."
                          value={userInput} onChange={e => setUserInput(e.target.value)} />
                      )}
                      {!revealed && reviewMode === 'fill_blank' && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed text-gray-700 border border-gray-200">
                          {blanked}
                        </div>
                      )}
                      {!revealed && reviewMode === 'reveal' && (
                        <p className="text-center text-sm text-gray-400 italic">Recall the verse, then reveal it</p>
                      )}

                      {/* Correct verse (revealed) */}
                      {revealed && (
                        <div className="space-y-2">
                          {userInput && reviewMode === 'type' && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-[11px] text-gray-500 mb-1 font-medium">Your answer:</p>
                              <p className="text-sm text-gray-800">{userInput}</p>
                            </div>
                          )}
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-[11px] text-green-700 mb-1 font-medium">Correct verse:</p>
                            <p className="text-sm text-gray-900 leading-relaxed">{quizItem.verse_text}</p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!revealed ? (
                        <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleCheck}>
                          {reviewMode === 'reveal' ? 'Reveal Verse' : 'Check Answer'}
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 gap-1.5"
                            onClick={() => handleJudge(true)} disabled={reviewItem.isPending}>
                            <Check className="w-3.5 h-3.5" /> Got it!
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50 gap-1.5"
                            onClick={() => handleJudge(false)} disabled={reviewItem.isPending}>
                            <X className="w-3.5 h-3.5" /> Review again
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ── ADD TAB ── */}
            {tab === 'add' && (
              <div className="space-y-2">
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Reference (e.g. Psalm 23:1)" value={newVerse.reference}
                  onChange={e => setNewVerse(p => ({ ...p, reference: e.target.value }))} />
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Full verse text..." value={newVerse.verse_text}
                  onChange={e => setNewVerse(p => ({ ...p, verse_text: e.target.value }))} />
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 gap-1.5"
                  onClick={() => addItem.mutate()}
                  disabled={!newVerse.reference.trim() || !newVerse.verse_text.trim() || addItem.isPending}>
                  <Plus className="w-3.5 h-3.5" /> Add to Memorization List
                </Button>
              </div>
            )}

            {/* ── LIST TAB ── */}
            {tab === 'list' && (
              items.length === 0 ? (
                <div className="text-center py-6">
                  <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No verses yet</p>
                  <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700" onClick={() => setTab('add')}>Add First Verse</Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="bg-white rounded-lg border border-green-100 p-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-indigo-700">{item.reference}</p>
                          <Badge className={`text-[10px] h-4 px-1.5 border ${LEVEL_COLORS[item.level || 0]}`}>
                            {LEVEL_LABELS[item.level || 0]}
                          </Badge>
                          {isDue(item) && <span className="text-[10px] text-red-500 font-semibold">Due now</span>}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.verse_text}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {item.correct_count || 0}/{item.review_count || 0} correct
                          {item.next_review_date && !isDue(item) && ` · next ${formatDistanceToNow(new Date(item.next_review_date), { addSuffix: true })}`}
                        </p>
                      </div>
                      <button onClick={() => { if (confirm('Remove this verse?')) deleteItem.mutate(item.id); }}
                        className="text-gray-300 hover:text-red-400 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── STATS TAB ── */}
            {tab === 'stats' && (
              <div className="space-y-3">
                <ProgressStats items={items} />
                <div className="bg-white rounded-xl border border-green-200 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Mastery Breakdown</p>
                  {LEVEL_LABELS.map((label, lvl) => {
                    const count = items.filter(i => (i.level || 0) === lvl).length;
                    const pct = items.length > 0 ? Math.round((count / items.length) * 100) : 0;
                    return (
                      <div key={lvl} className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] text-gray-500 w-16">{label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${['bg-red-400','bg-orange-400','bg-yellow-400','bg-blue-400','bg-green-500','bg-purple-500'][lvl]}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}