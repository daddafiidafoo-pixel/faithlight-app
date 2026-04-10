import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bold, Italic, List, Save, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RichNotesEditor({ sessionId }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const editorRef = useRef(null);
  const saveTimer = useRef(null);

  // Load existing note on mount
  useEffect(() => {
    if (!sessionId) return;
    base44.auth.me().then(async (user) => {
      if (!user?.id) { setLoaded(true); return; }
      try {
        const notes = await base44.entities.SessionNote.filter(
          { sessionId, userId: user.id },
          null, 1
        );
        const existing = notes?.[0];
        if (existing?.noteText) {
          if (editorRef.current) {
            editorRef.current.innerHTML = existing.noteText;
          }
        }
      } catch {}
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [sessionId]);

  const execCmd = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const handleSave = async () => {
    if (!sessionId || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    if (!html || html === '<br>') return;
    setSaving(true);
    setSaved(false);
    try {
      await base44.functions.invoke('churchmode_saveNote', { sessionId, noteText: html });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Silent fail
    }
    setSaving(false);
  };

  const handleInput = () => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(handleSave, 1800);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-indigo-100">My Sermon Notes</p>
        <div className="flex items-center gap-2">
          {/* Format buttons */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            <button
              onMouseDown={e => { e.preventDefault(); execCmd('bold'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={e => { e.preventDefault(); execCmd('italic'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors"
              title="Bullet list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save status */}
          {saving && <span className="text-xs text-indigo-300 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
          {saved && <span className="text-xs text-green-300 flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
        </div>
      </div>

      {/* Rich text area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        className="min-h-[160px] bg-white/10 border border-white/20 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-indigo-400 leading-relaxed [&_b]:font-bold [&_i]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_li]:my-0.5"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder="Write your sermon notes here... Supports bold, italic, and lists. Notes are saved automatically."
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(165,180,252,0.6);
          pointer-events: none;
        }
      `}</style>

      <Button
        size="sm"
        onMouseDown={e => { e.preventDefault(); handleSave(); }}
        disabled={saving}
        className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs gap-2"
      >
        <Save className="w-3.5 h-3.5" /> Save Notes
      </Button>
    </div>
  );
}