import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, Search, Folder, FileText, Trash2, Edit3, X, Save, Tag, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NOTE_COLORS = {
  yellow: { bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
  blue:   { bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  green:  { bg: '#F0FDF4', border: '#BBF7D0', dot: '#22C55E' },
  pink:   { bg: '#FDF2F8', border: '#FBCFE8', dot: '#EC4899' },
  purple: { bg: '#F5F3FF', border: '#DDD6FE', dot: '#8B5CF6' },
};

function NoteModal({ note, folders, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [folder, setFolder] = useState(note?.folder || 'General');
  const [color, setColor] = useState(note?.color || 'yellow');
  const [newFolder, setNewFolder] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await onSave({ title, content, folder: newFolder.trim() || folder, color });
    setSaving(false);
  };

  const allFolders = [...new Set(['General', ...folders])];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full max-w-lg flex flex-col" style={{ borderRadius: '24px 24px 0 0', maxHeight: '90vh', sm: { borderRadius: '24px' } }}>
        <div className="px-5 pt-4 pb-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{note ? 'Edit Note' : 'New Study Note'}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Verse ref display */}
          {note?.verse_reference && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{note.verse_reference}</span>
            </div>
          )}
          {/* Title */}
          <input
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium outline-none focus:border-violet-400"
            placeholder="Note title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          {/* Content */}
          <textarea
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-violet-400 resize-none"
            placeholder="Write your thoughts, insights, reflections..."
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          {/* Folder */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Folder</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allFolders.map(f => (
                <button key={f} onClick={() => { setFolder(f); setNewFolder(''); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{ backgroundColor: folder === f && !newFolder ? '#EDE9FE' : '#F3F4F6', color: folder === f && !newFolder ? '#7C3AED' : '#6B7280' }}>
                  {f}
                </button>
              ))}
            </div>
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400"
              placeholder="Or create new folder..."
              value={newFolder}
              onChange={e => setNewFolder(e.target.value)}
            />
          </div>
          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Color</label>
            <div className="flex gap-3">
              {Object.entries(NOTE_COLORS).map(([c, style]) => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: style.dot, borderColor: color === c ? '#1F2937' : 'transparent' }} />
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 pb-6 pt-3 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-sm">Cancel</button>
          <button onClick={handleSave} disabled={!content.trim() || saving}
            className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: content.trim() ? '#7C3AED' : '#C4B5FD' }}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudyNotes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Pre-fill from URL params (coming from Bible reader)
  const urlParams = new URLSearchParams(window.location.search);
  const preVerse = urlParams.get('verse_reference') ? {
    verse_reference: urlParams.get('verse_reference'),
    verse_text: urlParams.get('verse_text') || '',
    book_id: urlParams.get('book_id') || '',
    book_name: urlParams.get('book_name') || '',
    chapter: parseInt(urlParams.get('chapter')) || undefined,
    verse_number: parseInt(urlParams.get('verse')) || undefined,
  } : null;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    base44.entities.StudyNote.filter({ user_email: user.email }, '-updated_date', 200)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const folders = [...new Set(notes.map(n => n.folder || 'General'))].filter(Boolean);

  const filtered = notes.filter(n => {
    const matchFolder = activeFolder === 'All' || (n.folder || 'General') === activeFolder;
    const q = search.toLowerCase();
    const matchSearch = !q || (n.title || '').toLowerCase().includes(q)
      || (n.content || '').toLowerCase().includes(q)
      || (n.verse_reference || '').toLowerCase().includes(q);
    return matchFolder && matchSearch;
  });

  const handleSave = async (data) => {
    if (!user?.email) return;
    const payload = { user_email: user.email, ...data };
    if (editNote) {
      // Merge pre-filled verse data if editing a new note from URL
      const updated = await base44.entities.StudyNote.update(editNote.id, payload);
      setNotes(prev => prev.map(n => n.id === editNote.id ? { ...n, ...payload } : n));
    } else {
      const noteData = preVerse ? { ...payload, ...preVerse } : payload;
      const created = await base44.entities.StudyNote.create(noteData);
      setNotes(prev => [created, ...prev]);
    }
    setShowModal(false);
    setEditNote(null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await base44.entities.StudyNote.delete(id).catch(() => {});
    setNotes(prev => prev.filter(n => n.id !== id));
    setDeleting(null);
  };

  const openEdit = (note) => { setEditNote(note); setShowModal(true); };
  const openNew = () => { setEditNote(preVerse ? { ...preVerse } : null); setShowModal(true); };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <FileText className="w-14 h-14 text-violet-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Study Notes</h2>
        <p className="text-slate-500 mb-6">Sign in to save and sync your personal Bible notes.</p>
        <button onClick={() => base44.auth.redirectToLogin('/StudyNotes')}
          className="px-6 py-3 rounded-2xl bg-violet-600 text-white font-semibold text-sm">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 flex-1">Study Notes</h1>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#7C3AED' }}>
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm outline-none focus:border-violet-400"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-400" />
          </button>}
        </div>

        {/* Folders */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', ...folders].map(f => (
            <button key={f} onClick={() => setActiveFolder(f)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
              style={{
                backgroundColor: activeFolder === f ? '#EDE9FE' : '#F3F4F6',
                color: activeFolder === f ? '#7C3AED' : '#6B7280'
              }}>
              <Folder className="w-3.5 h-3.5" /> {f}
              <span className="ml-0.5 opacity-60">
                ({f === 'All' ? notes.length : notes.filter(n => (n.folder || 'General') === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Notes', value: notes.length, color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Folders', value: folders.length || 1, color: '#0284C7', bg: '#EFF6FF' },
            { label: 'Linked Verses', value: notes.filter(n => n.verse_reference).length, color: '#16A34A', bg: '#F0FDF4' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: s.bg }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Notes list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText className="w-12 h-12 text-slate-200 mb-3" />
            <p className="font-semibold text-slate-900">No notes yet</p>
            <p className="text-sm text-slate-500 mt-1">Tap "+ New" or highlight a verse in the Bible reader to add notes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(note => {
              const cs = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
              return (
                <div key={note.id} className="rounded-2xl p-4 border"
                  style={{ backgroundColor: cs.bg, borderColor: cs.border }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {note.verse_reference && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: cs.dot }} />
                          <span className="text-xs font-bold" style={{ color: cs.dot }}>{note.verse_reference}</span>
                        </div>
                      )}
                      {note.title && <p className="font-semibold text-slate-900 text-sm mb-1">{note.title}</p>}
                      <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Folder className="w-3 h-3" />{note.folder || 'General'}
                        </span>
                        {(note.tags || []).map(tag => (
                          <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/70 text-slate-600">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                        <span className="text-xs text-slate-400 ml-auto">
                          {new Date(note.updated_date || note.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => openEdit(note)}
                        className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center text-slate-500 hover:text-slate-800">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(note.id)} disabled={deleting === note.id}
                        className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <NoteModal
          note={editNote}
          folders={folders}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditNote(null); }}
        />
      )}
    </div>
  );
}