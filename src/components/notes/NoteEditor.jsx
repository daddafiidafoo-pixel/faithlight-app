import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, X, Plus, BookOpen, Tag, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const COLORS = [
  { value: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-400', label: '🟡' },
  { value: 'blue',   bg: 'bg-blue-100',   border: 'border-blue-400',   label: '🔵' },
  { value: 'green',  bg: 'bg-green-100',  border: 'border-green-400',  label: '🟢' },
  { value: 'purple', bg: 'bg-purple-100', border: 'border-purple-400', label: '🟣' },
  { value: 'pink',   bg: 'bg-pink-100',   border: 'border-pink-400',   label: '🩷' },
  { value: 'gray',   bg: 'bg-gray-100',   border: 'border-gray-400',   label: '⚪' },
];

const SUGGESTED_TAGS = ['faith', 'prayer', 'grace', 'salvation', 'love', 'hope', 'forgiveness', 'worship', 'discipleship', 'leadership'];

export default function NoteEditor({ user, note, onSaved, onCancel }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [passageRef, setPassageRef] = useState(note?.passage_ref || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState(note?.color || 'yellow');
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false);
  const [saving, setSaving] = useState(false);

  const addTag = (tag) => {
    const t = (tag || tagInput).trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Please enter a title.'); return; }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        user_name: user.full_name,
        title: title.trim(),
        content,
        passage_ref: passageRef.trim() || null,
        tags,
        color,
        is_pinned: isPinned,
      };

      let saved;
      if (note?.id) {
        saved = await base44.entities.StudyNote.update(note.id, payload);
        toast.success('Note updated!');
      } else {
        saved = await base44.entities.StudyNote.create(payload);
        toast.success('Note saved!');
      }
      onSaved?.(saved);
    } catch (e) {
      toast.error('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const colorConfig = COLORS.find(c => c.value === color) || COLORS[0];

  return (
    <div className={`rounded-2xl border-2 ${colorConfig.border} ${colorConfig.bg} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-600">{note?.id ? 'Edit Note' : 'New Note'}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPinned(v => !v)}
            className={`p-1.5 rounded-lg transition-colors ${isPinned ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:text-amber-500'}`}
            title="Pin note"
          >
            <Pin className="w-4 h-4" />
          </button>
          {onCancel && (
            <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <Input
        placeholder="Note title…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="text-base font-semibold bg-white/80 border-white/60 focus:bg-white"
      />

      {/* Passage ref */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <Input
          placeholder="Scripture reference (e.g. Romans 8:28)"
          value={passageRef}
          onChange={e => setPassageRef(e.target.value)}
          className="text-sm bg-white/80 border-white/60 focus:bg-white"
        />
      </div>

      {/* Content */}
      <Textarea
        placeholder="Write your thoughts, insights, reflections…"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="min-h-[160px] text-sm bg-white/80 border-white/60 focus:bg-white resize-none leading-relaxed"
      />

      {/* Tags */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex gap-1.5 flex-1 flex-wrap">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 text-xs bg-white/80 border border-gray-300 text-gray-700 rounded-full px-2.5 py-0.5 font-medium">
                {t}
                <button onClick={() => removeTag(t)} className="hover:text-red-500 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag…"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            className="text-xs bg-white/80 border-white/60 h-8"
          />
          <Button size="sm" variant="outline" onClick={() => addTag()} className="h-8 px-2 bg-white/80">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 6).map(t => (
            <button
              key={t}
              onClick={() => addTag(t)}
              className="text-xs text-gray-500 hover:text-indigo-600 bg-white/60 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-full px-2 py-0.5 transition-colors"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Color:</span>
        {COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${c.bg} ${c.border} ${color === c.value ? 'scale-125 shadow-md' : 'opacity-60 hover:opacity-100'}`}
            title={c.value}
          />
        ))}
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving || !title.trim()}
        className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white"
      >
        {saving ? (
          <><span className="animate-spin">⟳</span> Saving…</>
        ) : (
          <><Save className="w-4 h-4" /> {note?.id ? 'Update Note' : 'Save Note'}</>
        )}
      </Button>
    </div>
  );
}