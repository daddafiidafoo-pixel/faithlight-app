import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { X, BookOpen, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOODS = [
  { value: 'grateful', emoji: '🙏', label: 'Grateful' },
  { value: 'hopeful', emoji: '✨', label: 'Hopeful' },
  { value: 'peaceful', emoji: '🕊️', label: 'Peaceful' },
  { value: 'joyful', emoji: '😊', label: 'Joyful' },
  { value: 'curious', emoji: '🤔', label: 'Curious' },
  { value: 'struggling', emoji: '💙', label: 'Struggling' },
  { value: 'convicted', emoji: '🔥', label: 'Convicted' },
];

export default function VerseJournalModal({ verseReference, verseText, onClose, onSaved, groups = [] }) {
  const { user } = useAuth();
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState('peaceful');
  const [isPrivate, setIsPrivate] = useState(true);
  const [attachedGroupId, setAttachedGroupId] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!reflection.trim()) return;
    setSaving(true);
    try {
      const entry = await base44.entities.VerseJournalEntry.create({
        userEmail: user.email,
        verseReference,
        verseText,
        reflection: reflection.trim(),
        mood,
        isPrivate,
        attachedToGroupId: attachedGroupId || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      onSaved?.(entry);
      onClose();
    } catch (err) {
      console.error('Error saving journal entry:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Journal Entry</p>
              <p className="text-xs text-slate-500">{verseReference}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Verse preview */}
          {verseText && (
            <div className="bg-purple-50 border-l-4 border-purple-400 px-4 py-3 rounded-r-lg">
              <p className="text-sm italic text-slate-700 leading-relaxed">"{verseText}"</p>
            </div>
          )}

          {/* Mood selector */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">How does this make you feel?</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    mood === m.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Your Reflection</label>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="What is God speaking to you through this verse? What stands out to you?"
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. faith, trust, morning devotion"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Privacy / Share to group */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Private entry</span>
              </div>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-11 h-6 rounded-full transition-colors ${isPrivate ? 'bg-purple-600' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {!isPrivate && groups.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1 mb-2">
                  <Users className="w-4 h-4" /> Share with Study Group
                </label>
                <select
                  value={attachedGroupId}
                  onChange={e => setAttachedGroupId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Don't attach to group</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={!reflection.trim() || saving} className="flex-1">
            {saving ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </div>
    </div>
  );
}