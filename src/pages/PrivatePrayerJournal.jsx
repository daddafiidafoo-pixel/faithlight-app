import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart, Trash2, Star, Loader2, Plus, Pencil, X, Check,
  ChevronDown, Tag, BookOpen, Filter
} from 'lucide-react';

const CATEGORIES = [
  { key: 'personal',      label: 'Personal',      color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'family',        label: 'Family',         color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'health',        label: 'Health',         color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'work',          label: 'Work',           color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'guidance',      label: 'Guidance',       color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { key: 'thanksgiving',  label: 'Thanksgiving',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'intercession',  label: 'Intercession',   color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { key: 'other',         label: 'Other',          color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const MOODS = [
  { key: 'grateful',   emoji: '🙏', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { key: 'hopeful',    emoji: '🌟', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { key: 'struggling', emoji: '😔', color: 'bg-red-100 text-red-700 border-red-300' },
  { key: 'peaceful',   emoji: '☮️', color: 'bg-green-100 text-green-700 border-green-300' },
  { key: 'seeking',    emoji: '🔍', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { key: 'joyful',     emoji: '😊', color: 'bg-pink-100 text-pink-700 border-pink-300' },
];

const categoryFor = key => CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
const moodFor = key => MOODS.find(m => m.key === key);

function EntryForm({ initial, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [mood, setMood] = useState(initial?.mood || 'peaceful');
  const [category, setCategory] = useState(initial?.category || 'personal');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState(initial?.tags || []);

  const addTag = () => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTag('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <input
        type="text"
        placeholder="Title or topic…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <textarea
        placeholder="Write your prayer or reflection…"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={5}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
      />

      {/* Mood */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m.key}
              onClick={() => setMood(m.key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all min-h-[36px] ${
                mood === m.key ? m.color : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {m.emoji} {m.key}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all min-h-[36px] ${
                category === c.key ? c.color : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tags</p>
        <div className="flex gap-2 items-center flex-wrap">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
              #{t}
              <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tag}
            onChange={e => setTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="Add tag…"
            className="px-3 py-1 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 min-h-[32px]"
          />
          {tag && (
            <button onClick={addTag} className="text-xs text-indigo-600 font-semibold">+ Add</button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave({ title, content, mood, category, tags })}
          disabled={!title.trim() || !content.trim() || saving}
          className="flex-1 min-h-[44px] bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save</>}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function PrivatePrayerJournal() {
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null); // entry being edited
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMood, setFilterMood] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['prayerJournal'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return base44.entities.PrayerJournalEntry.filter({ userEmail: user.email }, '-created_date', 100);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      if (!user) throw new Error('Not authenticated');
      return base44.entities.PrayerJournalEntry.create({ ...data, userEmail: user.email, language: 'en' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerJournal'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PrayerJournalEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerJournal'] });
      setEditEntry(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PrayerJournalEntry.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prayerJournal'] }),
  });

  const toggleFavMutation = useMutation({
    mutationFn: ({ id, val }) => base44.entities.PrayerJournalEntry.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prayerJournal'] }),
  });

  const filtered = entries.filter(e => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterMood !== 'all' && e.mood !== filterMood) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Prayer Journal
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Private — only visible to you</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors ${
                showFilters ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowForm(true); setEditEntry(null); }}
              className="min-h-[44px] px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> New
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border min-h-[36px] transition-all ${
                    filterCategory === 'all' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >All</button>
                {CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => setFilterCategory(c.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border min-h-[36px] transition-all ${
                      filterCategory === c.key ? c.color : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >{c.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mood</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterMood('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border min-h-[36px] ${
                    filterMood === 'all' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >All</button>
                {MOODS.map(m => (
                  <button key={m.key} onClick={() => setFilterMood(m.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border min-h-[36px] ${
                      filterMood === m.key ? m.color : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >{m.emoji} {m.key}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* New entry form */}
        {showForm && !editEntry && (
          <EntryForm
            onSave={(data) => saveMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            saving={saveMutation.isPending}
          />
        )}

        {/* Stats strip */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total', value: entries.length },
              { label: 'Favorites', value: entries.filter(e => e.isFavorite).length },
              { label: 'This week', value: entries.filter(e => {
                const d = new Date(e.created_date);
                const now = new Date();
                const weekAgo = new Date(now - 7 * 86400000);
                return d >= weekAgo;
              }).length },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm">
                <p className="text-xl font-bold text-purple-600">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Entries */}
        {isLoading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{entries.length === 0 ? 'No entries yet' : 'No entries match your filters'}</p>
            <p className="text-slate-400 text-sm mt-1">Start your first prayer reflection</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => (
              <div key={entry.id}>
                {editEntry?.id === entry.id ? (
                  <EntryForm
                    initial={editEntry}
                    onSave={(data) => updateMutation.mutate({ id: entry.id, data })}
                    onCancel={() => setEditEntry(null)}
                    saving={updateMutation.isPending}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{entry.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {entry.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${categoryFor(entry.category).color}`}>
                              {categoryFor(entry.category).label}
                            </span>
                          )}
                          {entry.mood && (() => { const m = moodFor(entry.mood); return m ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${m.color}`}>
                              {m.emoji} {entry.mood}
                            </span>
                          ) : null; })()}
                          <span className="text-xs text-slate-400">
                            {new Date(entry.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleFavMutation.mutate({ id: entry.id, val: !entry.isFavorite })}
                          className={`p-2 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                            entry.isFavorite ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Star size={15} />
                        </button>
                        <button
                          onClick={() => setEditEntry(entry)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(entry.id)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{entry.content}</p>

                    {entry.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.tags.map(t => (
                          <span key={t} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">#{t}</span>
                        ))}
                      </div>
                    )}

                    {entry.linked_prayer_request_id && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl w-fit">
                        <Heart size={11} /> Linked to prayer request
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}