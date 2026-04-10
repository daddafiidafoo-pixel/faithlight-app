import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Heart, Search, X, Save, Link, ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'fl_prayer_journal_entries';

const MOODS = [
  { value: 'grateful', label: '🙏 Grateful', color: '#10B981' },
  { value: 'hopeful', label: '✨ Hopeful', color: '#6C5CE7' },
  { value: 'struggling', label: '💙 Struggling', color: '#3B82F6' },
  { value: 'peaceful', label: '🕊️ Peaceful', color: '#0EA5E9' },
  { value: 'seeking', label: '🔍 Seeking', color: '#F59E0B' },
  { value: 'joyful', label: '🌟 Joyful', color: '#F43F5E' },
];

const CATEGORIES = ['personal', 'family', 'health', 'work', 'faith', 'gratitude', 'intercession', 'other'];

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function EntryForm({ entry, onSave, onCancel }) {
  const [form, setForm] = useState(entry || {
    title: '', content: '', mood: 'grateful', category: 'personal',
    linkedVerse: '', linkedVerseRef: '', tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    onSave({
      ...form,
      id: entry?.id || Date.now().toString(),
      date: entry?.date || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
    });
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-lg">{entry ? 'Edit Prayer' : 'New Prayer Entry'}</h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Title</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="e.g. Praying for healing..."
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button key={m.value} type="button"
                  onClick={() => set('mood', m.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
                  style={{
                    borderColor: form.mood === m.value ? m.color : '#E5E7EB',
                    backgroundColor: form.mood === m.value ? m.color + '20' : 'white',
                    color: form.mood === m.value ? m.color : '#6B7280',
                  }}
                >{m.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 capitalize"
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Prayer</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              placeholder="Write your prayer here..."
              rows={5}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 flex items-center gap-1">
              <Link size={11} /> Linked Verse (optional)
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 mb-2"
              placeholder="Reference e.g. John 3:16"
              value={form.linkedVerseRef}
              onChange={e => set('linkedVerseRef', e.target.value)}
            />
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              placeholder="Paste verse text here..."
              rows={2}
              value={form.linkedVerse}
              onChange={e => set('linkedVerse', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tags (comma separated)</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="e.g. healing, trust, family"
              value={typeof form.tags === 'string' ? form.tags : (form.tags || []).join(', ')}
              onChange={e => set('tags', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)' }}>
              <Save size={14} /> Save Prayer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EntryCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const mood = MOODS.find(m => m.value === entry.mood) || MOODS[0];
  const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: mood.color + '20', color: mood.color }}>{mood.label}</span>
              <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{entry.category}</span>
              <span className="text-xs text-gray-400">{date}</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm leading-snug">{entry.title}</h3>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onEdit(entry)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(entry.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        </div>

        <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>{entry.content}</p>

        {entry.content.length > 150 && (
          <button onClick={() => setExpanded(e => !e)} className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-0.5">
            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
          </button>
        )}

        {entry.linkedVerseRef && (
          <div className="mt-3 p-3 bg-purple-50 rounded-xl border-l-4 border-purple-400">
            <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1"><Link size={10} /> {entry.linkedVerseRef}</p>
            {entry.linkedVerse && <p className="text-xs text-purple-600 italic">{entry.linkedVerse}</p>}
          </div>
        )}

        {(entry.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {entry.tags.map(t => (
              <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrayerJournalFeature() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => { setEntries(loadEntries()); }, []);

  const handleSave = (entry) => {
    const updated = editEntry
      ? entries.map(e => e.id === entry.id ? entry : e)
      : [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setShowForm(false);
    setEditEntry(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this prayer entry?')) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase());
    const matchMood = filterMood === 'all' || e.mood === filterMood;
    const matchCat = filterCat === 'all' || e.category === filterCat;
    return matchSearch && matchMood && matchCat;
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #8B5CF6 100%)' }}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Prayer Journal</h1>
              <p className="text-purple-200 text-sm mt-0.5">{entries.length} prayer{entries.length !== 1 ? 's' : ''} recorded</p>
            </div>
            <button onClick={() => { setEditEntry(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Plus size={16} /> New Prayer
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
            <input
              className="w-full bg-white/20 placeholder-purple-300 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white/30"
              placeholder="Search prayers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <select value={filterMood} onChange={e => setFilterMood(e.target.value)}
            className="flex-shrink-0 border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs font-medium text-gray-600 focus:outline-none">
            <option value="all">All Moods</option>
            {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="flex-shrink-0 border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs font-medium text-gray-600 focus:outline-none capitalize">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        {/* Entries */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#EDE9FE' }}>
              <Heart size={28} style={{ color: '#6C5CE7' }} />
            </div>
            <p className="font-semibold text-gray-700 mb-1">{entries.length === 0 ? 'Start your prayer journey' : 'No prayers match'}</p>
            <p className="text-sm text-gray-400">{entries.length === 0 ? 'Write your first prayer and link a verse' : 'Try adjusting your filters'}</p>
            {entries.length === 0 && (
              <button onClick={() => setShowForm(true)}
                className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)' }}>
                Write First Prayer
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(e => (
              <EntryCard key={e.id} entry={e} onEdit={entry => { setEditEntry(entry); setShowForm(true); }} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {(showForm || editEntry) && (
        <EntryForm entry={editEntry} onSave={handleSave} onCancel={() => { setShowForm(false); setEditEntry(null); }} />
      )}
    </div>
  );
}