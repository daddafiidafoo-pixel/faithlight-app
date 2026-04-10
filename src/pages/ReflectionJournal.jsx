import React, { useState, useEffect } from 'react';
import { PenLine, Trash2, Edit2, Save, X, Calendar, BookOpen, Search, ChevronDown, ChevronUp, Smile } from 'lucide-react';

const STORAGE_KEY = 'fl_reflection_journal';

const MOODS = ['🙏', '😊', '💙', '✨', '😔', '🔥', '🕊️', '🌟'];

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function persist(entries) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }

function EntryModal({ entry, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(entry || { scripture: '', reflection: '', prayer: '', mood: '🙏', date: today });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.reflection.trim()) return;
    onSave({ ...form, id: entry?.id || Date.now().toString(), date: form.date || today });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-800">{entry ? 'Edit Reflection' : 'New Reflection'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Scripture Reference</label>
            <input value={form.scripture} onChange={e => set('scripture', e.target.value)}
              placeholder="e.g. John 3:16 or Psalm 23"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Reflection *</label>
            <textarea value={form.reflection} onChange={e => set('reflection', e.target.value)} required
              rows={5} placeholder="What did today's scripture speak to you about?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Prayer</label>
            <textarea value={form.prayer} onChange={e => set('prayer', e.target.value)}
              rows={3} placeholder="Write a personal prayer..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Mood</label>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button key={m} type="button" onClick={() => set('mood', m)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.mood === m ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
              <Save size={14} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EntryCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{entry.mood}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={11} />{dateStr}</span>
            {entry.scripture && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <BookOpen size={10} />{entry.scripture}
              </span>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onEdit(entry)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 size={13} /></button>
            <button onClick={() => onDelete(entry.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
        </div>
        <p className={`text-sm text-gray-700 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>{entry.reflection}</p>
        {entry.reflection.length > 150 && (
          <button onClick={() => setExpanded(e => !e)} className="text-xs text-indigo-500 font-medium mt-1 flex items-center gap-0.5">
            {expanded ? <><ChevronUp size={11} />Less</> : <><ChevronDown size={11} />More</>}
          </button>
        )}
        {entry.prayer && expanded && (
          <div className="mt-3 p-3 bg-purple-50 rounded-xl border-l-4 border-purple-300">
            <p className="text-xs font-semibold text-purple-600 mb-1">🙏 Prayer</p>
            <p className="text-xs text-purple-700 italic">{entry.prayer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReflectionJournal() {
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { setEntries(load()); }, []);

  const handleSave = (entry) => {
    const updated = editEntry ? entries.map(e => e.id === entry.id ? entry : e) : [entry, ...entries];
    setEntries(updated); persist(updated); setShowModal(false); setEditEntry(null);
  };
  const handleDelete = (id) => {
    if (!confirm('Delete this reflection?')) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated); persist(updated);
  };

  const filtered = entries.filter(e =>
    !search || e.reflection.toLowerCase().includes(search.toLowerCase()) ||
    (e.scripture || '').toLowerCase().includes(search.toLowerCase())
  );

  const streakDays = (() => {
    const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    let cur = new Date(); cur.setHours(0,0,0,0);
    for (const d of dates) {
      const ed = new Date(d + 'T12:00:00'); ed.setHours(0,0,0,0);
      const diff = (cur - ed) / 86400000;
      if (diff <= 1) { streak++; cur = ed; } else break;
    }
    return streak;
  })();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F8FC' }}>
      <div className="px-4 pt-6 pb-5" style={{ background: 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)' }}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white">Reflection Journal</h1>
              <p className="text-indigo-200 text-sm">{streakDays > 0 ? `🔥 ${streakDays}-day streak` : 'Begin your spiritual journey'}</p>
            </div>
            <button onClick={() => { setEditEntry(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <PenLine size={15} /> Write
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reflections..."
              className="w-full bg-white/20 placeholder-indigo-300 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-white/30" />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: entries.length, color: '#6366F1' },
            { label: 'Streak', value: `${streakDays}d`, color: '#F59E0B' },
            { label: 'This Month', value: entries.filter(e => e.date?.startsWith(new Date().toISOString().slice(0,7))).length, color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm border text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#EEF2FF' }}>
              <PenLine size={28} style={{ color: '#6366F1' }} />
            </div>
            <p className="font-semibold text-gray-700 mb-1">{entries.length === 0 ? 'Your journal is empty' : 'No matches'}</p>
            <p className="text-sm text-gray-400">Write your first scripture reflection</p>
            {entries.length === 0 && (
              <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>Start Writing</button>
            )}
          </div>
        ) : filtered.map(e => (
          <EntryCard key={e.id} entry={e} onEdit={en => { setEditEntry(en); setShowModal(true); }} onDelete={handleDelete} />
        ))}
      </div>

      {showModal && <EntryModal entry={editEntry} onSave={handleSave} onClose={() => { setShowModal(false); setEditEntry(null); }} />}
    </div>
  );
}