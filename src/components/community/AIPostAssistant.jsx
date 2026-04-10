import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Teaching', 'Devotional', 'Testimony', 'Question', 'Announcement'];

export default function AIPostAssistant({ onApplyDraft }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('uplifting');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) { toast.error('Enter a verse or topic'); return; }
    setLoading(true);
    setDraft(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping a user write a biblical education post for a faith community app.

Topic or Bible verse: "${prompt}"
Desired tone: ${tone}

Generate a community post with:
1. A compelling, uplifting title (max 10 words)
2. A body of 3–5 sentences that is educational, biblically grounded, and encouraging. Reference the scripture clearly.
3. Suggest the best category from: ${CATEGORIES.join(', ')}
4. A brief reason why you chose that category (1 sentence)

The content must be appropriate for all ages, respectful, non-political, and focused on biblical education.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            body: { type: 'string' },
            category: { type: 'string' },
            category_reason: { type: 'string' },
          },
        },
      });
      setDraft(result);
    } catch { toast.error('AI generation failed. Please try again.'); }
    setLoading(false);
  };

  const applyDraft = () => {
    if (!draft) return;
    onApplyDraft({ title: draft.title, body: draft.body, category: draft.category });
    toast.success('Draft applied! Review and edit before submitting.');
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> AI Writing Assistant
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-indigo-600">Enter a Bible verse or topic and the AI will draft a post for you to review and edit.</p>

          <Input
            placeholder="e.g. John 3:16, faith during trials, the Sermon on the Mount"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="bg-white text-sm"
          />

          <div className="flex gap-2">
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-white text-xs flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="uplifting">Uplifting & Encouraging</SelectItem>
                <SelectItem value="educational">Educational & Analytical</SelectItem>
                <SelectItem value="devotional">Devotional & Prayerful</SelectItem>
                <SelectItem value="simple">Simple & Accessible</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generate} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {loading ? 'Generating…' : 'Generate'}
            </Button>
          </div>

          {draft && (
            <div className="bg-white rounded-lg border border-indigo-200 p-3 space-y-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Suggested Title</p>
                <p className="text-sm font-semibold text-gray-800">{draft.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Suggested Body</p>
                <p className="text-sm text-gray-700 leading-relaxed">{draft.body}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Category</p>
                  <p className="text-xs text-indigo-700 font-medium">{draft.category} — <span className="text-gray-500 font-normal">{draft.category_reason}</span></p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={generate} variant="outline" size="sm" className="gap-1.5 text-xs">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </Button>
                <Button onClick={applyDraft} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5">
                  <Sparkles className="w-3 h-3" /> Use This Draft
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}