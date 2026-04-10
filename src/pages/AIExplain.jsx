import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';
import { buildExplanationPrompt, safeJsonParse } from '@/components/lib/ai/explanationPrompts';
import { createExplanationThread, ensureGuardrailsOrThrow, loadThreadWithVerseNotes } from '@/components/lib/ai/explanationStore';
import AIExplanationThreadView from '@/components/ai/AIExplanationThreadView';
import AIModelSelector from '@/components/ai/AIModelSelector';

const DEPTH_HINTS = {
  fast: 'Keep responses concise and brief — 1-2 sentences per verse.',
  balanced: 'Provide clear, moderately detailed explanations per verse.',
  deep: 'Provide thorough, in-depth theological explanations for each verse.',
};

export default function AIExplain() {
  const [me, setMe] = useState(null);
  const [reference, setReference] = useState('John 3:16-17');
  const [translationName, setTranslationName] = useState('WEB');
  const [passageText, setPassageText] = useState('');
  const [verseKeysInput, setVerseKeysInput] = useState('John 3:16, John 3:17');
  const [modelKey, setModelKey] = useState('balanced');
  const [busy, setBusy] = useState(false);
  const [threadBundle, setThreadBundle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  async function generate() {
    if (!me?.id) {
      base44.auth.redirectToLogin();
      return;
    }
    if (!passageText.trim()) { setError('Please paste the passage text first.'); return; }
    setError('');
    setBusy(true);
    try {
      const verseKeys = verseKeysInput.split(',').map(x => x.trim()).filter(Boolean);
      const depthHint = DEPTH_HINTS[modelKey] || DEPTH_HINTS.balanced;
      const basePrompt = buildExplanationPrompt({ reference, translationName, passageText, verseKeys });
      const prompt = `${basePrompt}\n\nDEPTH INSTRUCTION: ${depthHint}`;
      const raw = await base44.integrations.Core.InvokeLLM({ prompt });
      const json = safeJsonParse(raw);
      ensureGuardrailsOrThrow(json, 'thread');

      const thread = await createExplanationThread({ me, reference, translationId: null, passageText, verseKeys, aiJson: json, model_key: modelKey });
      const bundle = await loadThreadWithVerseNotes(thread.id);
      setThreadBundle({ ...bundle, translationName });
    } catch (e) {
      setError('Could not generate a safe explanation. Please try again.');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Bible Explanation</h1>
          <p className="text-sm text-gray-500">Verse-by-verse breakdown with follow-up Q&A</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enter Passage</CardTitle>
          <CardDescription>Paste the exact passage text for an AI-generated verse-by-verse breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Reference</label>
              <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. John 3:16-17" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Translation</label>
              <Input value={translationName} onChange={e => setTranslationName(e.target.value)} placeholder="e.g. WEB, NIV" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Verse keys (comma-separated)</label>
            <Input value={verseKeysInput} onChange={e => setVerseKeysInput(e.target.value)} placeholder="John 3:16, John 3:17" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Passage text (exact)</label>
            <Textarea
              value={passageText}
              onChange={e => setPassageText(e.target.value)}
              rows={8}
              placeholder="Paste the passage text here…"
              className="resize-none"
            />
          </div>

          <AIModelSelector me={me} value={modelKey} onChange={setModelKey} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={generate} disabled={busy} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Explain verse-by-verse</>}
          </Button>
        </CardContent>
      </Card>

      {threadBundle?.thread && (
        <AIExplanationThreadView
          me={me}
          thread={threadBundle.thread}
          verseNotes={threadBundle.notes}
          translationName={threadBundle.translationName}
        />
      )}

      {!threadBundle && !busy && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a passage above and generate an explanation.</p>
        </div>
      )}
    </div>
  );
}