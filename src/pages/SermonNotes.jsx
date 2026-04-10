import React, { useState, useEffect } from 'react';
import { Plus, X, BookOpen, Download, Tag, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SERMON_NOTES_KEY = 'fl_sermon_notes';

function getNotes() {
  return JSON.parse(localStorage.getItem(SERMON_NOTES_KEY) || '[]');
}
function saveNotes(notes) {
  localStorage.setItem(SERMON_NOTES_KEY, JSON.stringify(notes));
}

function NoteCard({ note, onDelete, onExport }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{note.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{new Date(note.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setExpanded(e => !e)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-indigo-600 rounded-lg">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onExport(note)} title="Export to Prayer Journal" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-green-600 rounded-lg">
            <Send size={15} />
          </button>
          <button onClick={() => onDelete(note.id)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {note.scripture && (
        <div className="mt-2 flex items-center gap-1.5">
          <Tag size={11} className="text-indigo-400" />
          <span className="text-xs text-indigo-600 font-medium">{note.scripture}</span>
        </div>
      )}

      {expanded && (
        <div className="mt-3 border-t border-gray-50 pt-3">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {note.tags.map(t => (
                <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewNoteModal({ onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scripture, setScripture] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const save = () => {
    if (!title.trim() || !content.trim()) { toast.error('Please fill in title and content.'); return; }
    const note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      scripture: scripture.trim(),
      tags,
      createdAt: new Date().toISOString(),
    };
    const all = getNotes();
    saveNotes([note, ...all]);
    onSaved(note);
    onClose();
    toast.success('Note saved!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">New Sermon Note</h2>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Sermon title or topic..."
            className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            value={scripture}
            onChange={e => setScripture(e.target.value)}
            placeholder="Scripture reference (e.g., John 3:16)"
            className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Your notes and reflections..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm h-36 resize-none"
          />
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="Add tag (press Enter)"
              className="flex-1 min-h-[44px] border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
            <button onClick={addTag} className="min-h-[44px] px-4 bg-gray-100 rounded-xl text-sm font-medium">Add</button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                  {t}
                  <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-red-500"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 min-h-[44px] rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancel</button>
            <button onClick={save} className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SermonNotes() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setNotes(getNotes());
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const handleDelete = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    toast.success('Note deleted.');
  };

  const handleExport = async (note) => {
    if (!currentUser) { toast.error('Please sign in to export to your prayer journal.'); return; }
    try {
      await base44.entities.PrayerJournalEntry.create({
        userEmail: currentUser.email,
        verseReference: note.scripture || 'Sermon Note',
        noteContent: `[Sermon: ${note.title}]\n\n${note.content}`,
        mood: 'peaceful',
        tags: note.tags || [],
        isPrivate: true,
      });
      toast.success('Exported to Prayer Journal!');
    } catch {
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sermon Notes</h1>
            <p className="text-sm text-gray-500">Capture & reflect on God's Word</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700"
          >
            <Plus size={15} /> New Note
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No notes yet</p>
            <p className="text-gray-300 text-sm mt-1">Tap "New Note" to capture your first sermon reflection</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} onExport={handleExport} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewNoteModal
          onClose={() => setShowModal(false)}
          onSaved={note => setNotes(prev => [note, ...prev])}
        />
      )}
    </div>
  );
}