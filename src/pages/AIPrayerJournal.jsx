import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, ChevronLeft, Trash2, Plus, Tag, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import TextToSpeechButton from '@/components/audio/TextToSpeechButton';

const MOODS = [
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'struggling', label: 'Struggling', emoji: '😔' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌅' },
  { id: 'peaceful', label: 'Peaceful', emoji: '☮️' },
  { id: 'anxious', label: 'Anxious', emoji: '😟' },
  { id: 'joyful', label: 'Joyful', emoji: '😊' },
  { id: 'confused', label: 'Confused', emoji: '🤔' },
  { id: 'grieving', label: 'Grieving', emoji: '💙' },
];

const STORAGE_KEY = 'fl_prayer_journal';

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

// ── Entry Card ──────────────────────────────────────────
function EntryCard({ entry, onDelete, onOpen }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => onOpen(entry)} className="w-full text-left p-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{MOODS.find(m => m.id === entry.mood)?.emoji || '🙏'}</span>
            <span className="text-sm font-semibold text-gray-800 capitalize">{entry.mood}</span>
          </div>
          <span className="text-xs text-gray-400">{timeAgo(entry.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{entry.reflection}</p>
        {entry.scriptures?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.scriptures.slice(0, 2).map((s, i) => (
              <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                {s.reference}
              </span>
            ))}
            {entry.scriptures.length > 2 && (
              <span className="text-xs text-gray-400">+{entry.scriptures.length - 2} more</span>
            )}
          </div>
        )}
      </button>
      <div className="px-4 pb-3 flex justify-end">
        <button onClick={() => onDelete(entry.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── Entry Detail Modal ───────────────────────────────────
function EntryDetail({ entry, onClose }) {
  const mood = MOODS.find(m => m.id === entry.mood);
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
          <span className="text-lg">{mood?.emoji}</span>
          <div>
            <p className="font-bold text-gray-900 capitalize">{entry.mood}</p>
            <p className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">My Reflection</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{entry.reflection}</p>
            <TextToSpeechButton text={entry.reflection} language="en" size="sm" showLabel={true} />
          </div>
          {entry.scriptures?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Sparkles size={11} /> AI Suggested Scriptures
              </p>
              <div className="space-y-3">
                {entry.scriptures.map((s, i) => (
                  <div key={i} className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-indigo-700 mb-1">{s.reference}</p>
                    <p className="text-sm text-gray-700 italic mb-1">"{s.text}"</p>
                    {s.explanation && <p className="text-xs text-gray-500">{s.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {entry.prayerPoints?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prayer Points</p>
              <ul className="space-y-1">
                {entry.prayerPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-400 mt-0.5">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── New Entry Form ───────────────────────────────────────
function NewEntryForm({ onSaved, onCancel }) {
  const [mood, setMood] = useState('');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!mood || !reflection.trim()) { toast.error('Choose a mood and write your reflection'); return; }
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compassionate biblical counselor. A person is feeling "${mood}" and wrote this prayer/reflection:

"${reflection}"

Based on their mood and the specific content of their reflection, suggest 3 Bible verses that would speak directly to their situation. Be specific and pastoral.

Return JSON with this schema:
{
  "scriptures": [
    {
      "reference": "Book Chapter:Verse",
      "text": "full verse text (NIV or ESV)",
      "explanation": "1-2 sentences explaining why this verse applies to their specific situation"
    }
  ],
  "prayerPoints": ["short prayer focus 1", "short prayer focus 2", "short prayer focus 3"]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            scriptures: { type: 'array', items: { type: 'object' } },
            prayerPoints: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      const entry = {
        id: `pj_${Date.now()}`,
        mood,
        reflection: reflection.trim(),
        scriptures: result.scriptures || [],
        prayerPoints: result.prayerPoints || [],
        createdAt: new Date().toISOString(),
      };

      const entries = loadEntries();
      entries.unshift(entry);
      saveEntries(entries);
      onSaved(entry);
    } catch {
      // Save without AI if it fails
      const entry = {
        id: `pj_${Date.now()}`,
        mood,
        reflection: reflection.trim(),
        scriptures: [],
        prayerPoints: [],
        createdAt: new Date().toISOString(),
      };
      const entries = loadEntries();
      entries.unshift(entry);
      saveEntries(entries);
      onSaved(entry);
      toast.error('AI suggestions unavailable, entry saved without them');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">How are you feeling?</p>
        <div className="grid grid-cols-4 gap-2">
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                mood === m.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-indigo-50'
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Your prayer / reflection</p>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Share what's on your heart. The more specific you are, the more relevant the scripture suggestions will be…"
          className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm resize-none h-28"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finding scriptures…
            </>
          ) : (
            <><Sparkles size={14} /> Save & Get Scriptures</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────
export default function AIPrayerJournal() {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'new' | 'detail'
  const [selected, setSelected] = useState(null);
  const [moodFilter, setMoodFilter] = useState('all');

  useEffect(() => { setEntries(loadEntries()); }, []);

  const handleSaved = (entry) => {
    setEntries(loadEntries());
    setSelected(entry);
    setView('detail');
    toast.success('Journal entry saved 🙏');
  };

  const handleDelete = (id) => {
    const updated = loadEntries().filter(e => e.id !== id);
    saveEntries(updated);
    setEntries(updated);
    toast.success('Entry deleted');
  };

  const filtered = moodFilter === 'all' ? entries : entries.filter(e => e.mood === moodFilter);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prayer Journal</h1>
            <p className="text-sm text-gray-500">AI suggests scripture for your prayers</p>
          </div>
          {view === 'list' && (
            <button
              onClick={() => setView('new')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl font-semibold text-sm"
            >
              <Plus size={15} /> New Entry
            </button>
          )}
        </div>

        {/* New entry form */}
        {view === 'new' && (
          <NewEntryForm
            onSaved={handleSaved}
            onCancel={() => setView('list')}
          />
        )}

        {/* Detail modal */}
        {view === 'detail' && selected && (
          <EntryDetail entry={selected} onClose={() => setView('list')} />
        )}

        {/* List */}
        {view === 'list' && (
          <>
            {/* Mood filter */}
            {entries.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                <button
                  onClick={() => setMoodFilter('all')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${moodFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  All
                </button>
                {MOODS.filter(m => entries.some(e => e.mood === m.id)).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMoodFilter(m.id)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${moodFilter === m.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No journal entries yet</p>
                <p className="text-gray-300 text-sm mt-1">Write your first prayer to get started</p>
                <button
                  onClick={() => setView('new')}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
                >
                  Write First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onOpen={e => { setSelected(e); setView('detail'); }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}