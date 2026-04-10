import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen, Sparkles, ChevronLeft, Library } from 'lucide-react';
import ExplanationThreadView from '../components/ai/ExplanationThreadView';
import { toast } from 'sonner';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'om', label: 'Afaan Oromoo' },
  { value: 'am', label: 'Amharic' },
];

export default function BibleExplain() {
  const params = new URLSearchParams(window.location.search);
  const preRef = params.get('ref') || '';
  const preText = params.get('text') || '';

  const [user, setUser] = useState(null);
  const [reference, setReference] = useState(preRef);
  const [passageText, setPassageText] = useState(preText);
  const [language, setLanguage] = useState('en');
  const [thread, setThread] = useState(null);
  const [starting, setStarting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoadingUser(false); }).catch(() => setLoadingUser(false));
  }, []);

  const handleStart = async () => {
    if (!reference.trim()) { toast.error('Please enter a passage reference.'); return; }
    if (!user) { base44.auth.redirectToLogin(); return; }
    setStarting(true);

    // Create the thread
    const newThread = await base44.entities.AIExplanationThread.create({
      user_id: user.id,
      reference: reference.trim(),
      passage_text: passageText.trim(),
      language,
      title: reference.trim(),
      saved: false,
    });

    // Generate initial explanation
    let initialContent = '';
    try {
      initialContent = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a biblical study assistant. Provide a clear, scholarly explanation of the following passage.

REFERENCE: ${reference.trim()}
PASSAGE TEXT: ${passageText.trim() || '(user will reference their Bible)'}
LANGUAGE: ${language}

IMPORTANT RULES:
- Base your explanation ONLY on the passage text provided.
- Do NOT invent scripture text.
- Cover: context, key words/phrases, theological significance, and practical application.
- Use clear headings (##) for each section.
- Be accessible to a general Christian audience.`,
      });
    } catch {
      initialContent = 'I was unable to generate an explanation at this time. Please try asking a specific question below.';
    }

    // Save initial AI message
    await base44.entities.AIExplanationMessage.create({
      thread_id: newThread.id,
      role: 'assistant',
      content: initialContent,
    });

    setThread(newThread);
    setStarting(false);
  };

  if (loadingUser) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" /> AI Bible Explainer
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Ask AI to explain any passage — then ask follow-up questions.</p>
          </div>
          {user && (
            <Link to={createPageUrl('MyAIExplanations')}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Library className="w-3.5 h-3.5" /> My Saved
              </Button>
            </Link>
          )}
        </div>

        {!thread ? (
          /* Setup form */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passage Reference</label>
              <Input
                placeholder="e.g. John 3:16-17, Romans 8:1-4"
                value={reference}
                onChange={e => setReference(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paste Verse Text <span className="text-gray-400 font-normal">(optional but recommended)</span></label>
              <Textarea
                placeholder="Paste the verse(s) text here so the AI can explain them accurately…"
                value={passageText}
                onChange={e => setPassageText(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleStart}
              disabled={starting || !reference.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              {starting ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Explanation…</> : <><Sparkles className="w-4 h-4" /> Explain This Passage</>}
            </Button>
            {!user && (
              <p className="text-xs text-center text-gray-400">You'll be asked to sign in to save and continue threads.</p>
            )}
          </div>
        ) : (
          /* Thread view */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <button
              onClick={() => setThread(null)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 mb-5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> New Explanation
            </button>
            <ExplanationThreadView
              thread={thread}
              onSavedChange={(saved) => setThread(t => ({ ...t, saved }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}