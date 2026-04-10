import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Tag, Bold, Italic, List, Quote, Mic } from 'lucide-react';
import VoicePrayerRecorder from './VoicePrayerRecorder';

const CATEGORIES = ['personal', 'family', 'health', 'guidance', 'gratitude', 'church', 'world', 'other'];

// Minimal rich-text toolbar that wraps a contenteditable div
function RichTextToolbar({ onCommand }) {
  const tools = [
    { icon: Bold, cmd: 'bold', title: 'Bold' },
    { icon: Italic, cmd: 'italic', title: 'Italic' },
    { icon: List, cmd: 'insertUnorderedList', title: 'List' },
    { icon: Quote, cmd: 'formatBlock', arg: 'blockquote', title: 'Quote' },
  ];
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      {tools.map(({ icon: Icon, cmd, arg, title }) => (
        <button
          key={cmd}
          type="button"
          title={title}
          onMouseDown={e => { e.preventDefault(); onCommand(cmd, arg); }}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

export default function RichPrayerEditor({ prayer, onSave, onClose }) {
  const [form, setForm] = useState({
    title: prayer?.title || '',
    content: prayer?.content || '',
    category: prayer?.category || 'personal',
    tags: prayer?.tags || [],
    status: prayer?.status || 'active',
    scripture_ref: prayer?.scripture_ref || '',
    audio_url: prayer?.audio_url || '',
    reminder_frequency: prayer?.reminder_frequency || 'none',
    reminder_topic: prayer?.reminder_topic || '',
  });
  const [tagInput, setTagInput] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const editorRef = React.useRef(null);

  const execCmd = (cmd, arg) => {
    document.execCommand(cmd, false, arg || null);
    editorRef.current?.focus();
  };

  const handleEditorInput = () => {
    setForm(f => ({ ...f, content: editorRef.current?.innerHTML || '' }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            🙏 {prayer ? 'Edit Prayer' : 'Write a Prayer'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Prayer Title *</label>
            <Input
              placeholder="e.g. Healing for my father"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="font-medium"
            />
          </div>

          {/* Scripture reference */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Scripture Reference (optional)</label>
            <Input
              placeholder="e.g. Philippians 4:6-7"
              value={form.scripture_ref}
              onChange={e => setForm(f => ({ ...f, scripture_ref: e.target.value }))}
              className="text-sm"
            />
          </div>

          {/* Voice recording toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowVoice(v => !v)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${showVoice ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600'}`}
            >
              <Mic className="w-3.5 h-3.5" />
              {showVoice ? 'Hide Voice Recorder' : '🎙️ Record Voice Prayer'}
            </button>
            {showVoice && (
              <div className="mt-2">
                <VoicePrayerRecorder
                  onTranscription={(text) => {
                    if (text && editorRef.current) {
                      editorRef.current.innerHTML += (editorRef.current.innerHTML ? '<br/>' : '') + text;
                      setForm(f => ({ ...f, content: editorRef.current.innerHTML }));
                    }
                  }}
                  onAudioUrl={(url) => setForm(f => ({ ...f, audio_url: url || '' }))}
                />
              </div>
            )}
          </div>

          {/* Rich text editor */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Your Prayer *</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-400">
              <RichTextToolbar onCommand={execCmd} />
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                className="min-h-[140px] px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none"
                dangerouslySetInnerHTML={{ __html: form.content }}
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Use the toolbar to format your prayer with bold, italic, lists, or quotes.</p>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${form.category === c ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Status (edit only) */}
          {prayer && (
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Status</label>
              <div className="flex gap-2">
                {[
                  { value: 'active', label: '⏳ Active' },
                  { value: 'ongoing', label: '🔄 Ongoing' },
                  { value: 'answered', label: '✅ Answered' },
                ].map(s => (
                  <button key={s.value} type="button" onClick={() => setForm(f => ({ ...f, status: s.value }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${form.status === s.value ? 'bg-indigo-700 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Reminder */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">🔔 Recurring Reminder</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { value: 'none', label: 'None' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, reminder_frequency: opt.value }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${form.reminder_frequency === opt.value ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            {form.reminder_frequency !== 'none' && (
              <Input
                placeholder="Reminder topic (e.g. Pray for Mom's healing)"
                value={form.reminder_topic}
                onChange={e => setForm(f => ({ ...f, reminder_topic: e.target.value }))}
                className="text-sm mt-1"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 text-sm"
              />
              <Button onClick={addTag} variant="outline" size="sm"><Tag className="w-3.5 h-3.5" /></Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                    {tag}
                    <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!form.title || !form.content}
            className="flex-1 bg-indigo-700 hover:bg-indigo-800"
          >
            {prayer ? 'Save Changes' : '🙏 Save Prayer'}
          </Button>
        </div>
      </div>
    </div>
  );
}