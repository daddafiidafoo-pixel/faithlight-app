import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import AIExplanationFeedback from './AIExplanationFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bookmark, BookmarkCheck, Share2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  toggleThreadSaved, updateThreadCategories, ensureShareId, setThreadShared,
  appendVerseQA, toggleVerseSaved
} from '@/components/lib/ai/explanationStore';
import { buildVerseFollowUpPrompt, safeJsonParse } from '@/components/lib/ai/explanationPrompts';

export default function AIExplanationThreadView({ me, thread: initialThread, verseNotes: initialNotes, translationName }) {
  const [thread, setThread] = useState(initialThread);
  const [notes, setNotes] = useState(initialNotes || []);
  const [cats, setCats] = useState(thread?.categories || []);
  const [newCat, setNewCat] = useState('');
  const [saving, setSaving] = useState(false);

  if (!thread) return null;

  async function onToggleSave() {
    setSaving(true);
    try {
      const next = !thread.saved;
      await toggleThreadSaved(thread.id, next);
      setThread(t => ({ ...t, saved: next }));
      toast.success(next ? 'Saved!' : 'Removed from saved.');
    } finally { setSaving(false); }
  }

  async function addCategory() {
    const c = newCat.trim();
    if (!c) return;
    const next = Array.from(new Set([...cats, c]));
    setCats(next);
    setNewCat('');
    await updateThreadCategories(thread.id, next);
  }

  async function removeCategory(c) {
    const next = cats.filter(x => x !== c);
    setCats(next);
    await updateThreadCategories(thread.id, next);
  }

  async function onShare() {
    setSaving(true);
    try {
      const shareId = await ensureShareId(thread);
      setThread(t => ({ ...t, share_id: shareId, is_shared: true }));
      const url = `${window.location.origin}/share/explanation/${shareId}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast.success('Share link copied to clipboard!');
    } catch { toast.error('Could not create share link.'); }
    finally { setSaving(false); }
  }

  async function onUnshare() {
    setSaving(true);
    try {
      await setThreadShared(thread.id, false);
      setThread(t => ({ ...t, is_shared: false }));
      toast.success('Sharing disabled.');
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{thread.reference}</CardTitle>
              {translationName && <CardDescription>Translation: {translationName}</CardDescription>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={onToggleSave} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : thread.saved ? <BookmarkCheck className="w-3 h-3 text-indigo-600" /> : <Bookmark className="w-3 h-3" />}
                {thread.saved ? 'Saved' : 'Save'}
              </Button>
              {thread.is_shared ? (
                <Button variant="outline" size="sm" onClick={onUnshare} disabled={saving}>Disable Share</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={onShare} disabled={saving} className="gap-1">
                  <Share2 className="w-3 h-3" /> Share
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {thread.summary && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Summary</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{thread.summary}</p>
            </div>
          )}
          {thread.context && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Context</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{thread.context}</p>
            </div>
          )}
          {thread.themes?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Themes</p>
              <div className="flex flex-wrap gap-1">
                {thread.themes.map((t, i) => <Badge key={i} variant="secondary">{t}</Badge>)}
              </div>
            </div>
          )}
          {thread.application?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Application</p>
              <ul className="text-sm text-gray-700 list-disc ml-4 space-y-1">
                {thread.application.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {cats.map(c => (
                <button key={c} onClick={() => removeCategory(c)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full border text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                  {c} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Add category…"
                onKeyDown={e => e.key === 'Enter' && addCategory()} className="flex-1" />
              <Button variant="outline" onClick={addCategory} type="button">Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verse-by-verse Breakdown</CardTitle>
          <CardDescription>Click any verse to expand, ask follow-up questions, and save notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No verse breakdown available.</p>
          ) : (
            notes.map(note => (
              <VersePanel
                key={note.id}
                me={me}
                thread={thread}
                note={note}
                translationName={translationName}
                onNoteUpdate={(updated) => setNotes(ns => ns.map(n => n.id === updated.id ? updated : n))}
              />
            ))
          )}
          <p className="text-xs text-gray-400 pt-2">Note: Explanations are AI-generated commentary based only on the displayed passage text.</p>
          <AIExplanationFeedback me={me} threadId={thread.id} modelKey="default" />
        </CardContent>
      </Card>
    </div>
  );
}

function VersePanel({ me, thread, note: initialNote, translationName, onNoteUpdate }) {
  const [note, setNote] = useState(initialNote);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const qaList = Array.isArray(note.qa) ? note.qa : [];

  async function ask() {
    const question = q.trim();
    if (!question) return;
    setBusy(true);
    try {
      const recentQA = qaList.slice(-3);
      const prompt = buildVerseFollowUpPrompt({
        reference: thread.reference,
        translationName,
        verseKey: note.verse_key,
        verseText: thread.passage_text,
        recentQA,
        userQuestion: question,
      });
      const raw = await base44.integrations.Core.InvokeLLM({ prompt });
      const json = safeJsonParse(raw);
      if (!json?.guardrails?.usedOnlyProvidedVerseText || !json?.guardrails?.didNotAddOtherScriptureReferences) {
        throw new Error('Guardrails failed');
      }
      const nextQA = await appendVerseQA({ noteId: note.id, existingQA: qaList, question, answer: json.answer || '' });
      const updated = { ...note, qa: nextQA };
      setNote(updated);
      onNoteUpdate?.(updated);
      setQ('');
    } catch {
      toast.error('Could not answer safely. Please try again.');
    } finally { setBusy(false); }
  }

  async function toggleSaved() {
    const next = !note.saved;
    await toggleVerseSaved(note.id, next);
    const updated = { ...note, saved: next };
    setNote(updated);
    onNoteUpdate?.(updated);
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-indigo-700 mb-1">{note.verse_key}</p>
          <p className="text-sm text-gray-700 line-clamp-2">{note.breakdown || '—'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={e => { e.stopPropagation(); toggleSaved(); }}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${note.saved ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            {note.saved ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="p-4 border-t border-gray-100 space-y-4 bg-gray-50">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.breakdown}</p>

          {qaList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow-up Q&A</p>
              {qaList.map((x, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-gray-800">Q: {x.q}</p>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">A: {x.a}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Textarea value={q} onChange={e => setQ(e.target.value)} placeholder="Ask a follow-up about this verse…"
              rows={2} className="resize-none bg-white"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!busy) ask(); } }} />
            <Button onClick={ask} disabled={busy || !q.trim()} size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1">
              {busy ? <><Loader2 className="w-3 h-3 animate-spin" /> Asking…</> : 'Ask'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}