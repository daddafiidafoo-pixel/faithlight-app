import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SermonNoteEditor({ currentTime = 0, onSave, onClose, initialNote = null }) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [verses, setVerses] = useState(initialNote?.verse_references || []);
  const [verseInput, setVerseInput] = useState('');
  const [tags, setTags] = useState(initialNote?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddVerse = () => {
    if (verseInput.trim() && !verses.includes(verseInput.trim())) {
      setVerses([...verses, verseInput.trim()]);
      setVerseInput('');
    }
  };

  const handleRemoveVerse = (idx) => {
    setVerses(verses.filter((_, i) => i !== idx));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        verse_references: verses,
        tags: tags,
        timestamp: currentTime
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Add Sermon Note</h2>
            <p className="text-xs text-slate-500">{Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Key point or section title"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Notes</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Transcribe key points from the sermon..."
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          {/* Bible Verses */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Bible Verses</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={verseInput}
                onChange={e => setVerseInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddVerse()}
                placeholder="e.g., John 3:16"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <Button onClick={handleAddVerse} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {verses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {verses.map((verse, idx) => (
                  <div key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                    {verse}
                    <button onClick={() => handleRemoveVerse(idx)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <Button onClick={handleAddTag} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <div key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                    {tag}
                    <button onClick={() => handleRemoveTag(idx)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 p-5 flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !content.trim() || isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-2" /> Save Note
          </Button>
        </div>
      </div>
    </div>
  );
}