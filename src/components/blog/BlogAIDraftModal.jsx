import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, X } from 'lucide-react';

function safeJsonParse(text) {
  const t = String(text || '').trim();
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  return JSON.parse(t);
}

const INTERNAL_LINKS = [
  { label: 'AI Explanation', path: '/AIExplain', description: 'Explain passages verse-by-verse' },
  { label: 'Study Plans', path: '/BibleStudyPlans', description: 'Follow structured Bible study plans' },
  { label: 'Community', path: '/Community', description: 'Discuss and ask questions' },
  { label: 'Offline Library', path: '/OfflineLibrary', description: 'Download lessons and content' },
  { label: 'Ask AI', path: '/AskAI', description: 'Ask Bible questions with AI' },
];

export default function BlogAIDraftModal({ open, onClose, onApply }) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [audience, setAudience] = useState('general Christian readers');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function generate() {
    if (!topic.trim()) { setError('Enter a topic first.'); return; }
    setError('');
    setBusy(true);
    try {
      const prompt = `You are an SEO-focused Christian content assistant.

Write a blog post draft based on:
TOPIC: ${topic}
KEYWORDS: ${keywords}
AUDIENCE: ${audience}

SEO REQUIREMENTS:
- Compelling title
- Meta description <= 155 chars
- 5-10 lowercase tags
- Use H2/H3 headings in markdown
- Short intro, clear structure, conclusion, call-to-action
- Suggest 2-3 internal links from the provided options only

INTERNAL LINK OPTIONS (use these paths ONLY):
${JSON.stringify(INTERNAL_LINKS)}

Return ONLY valid JSON:
{
  "title": string,
  "slug": string,
  "metaDescription": string,
  "category": string,
  "tags": [string],
  "bodyMarkdown": string,
  "internalLinks": [{"label": string, "path": string, "reason": string}]
}`;

      const raw = await base44.integrations.Core.InvokeLLM({ prompt });
      const json = safeJsonParse(raw);

      const safeLinks = (json.internalLinks || []).filter(x =>
        typeof x?.path === 'string' && INTERNAL_LINKS.some(l => l.path === x.path)
      );

      onApply?.({
        title: json.title || '',
        slug: json.slug || '',
        meta_description: json.metaDescription || '',
        category: json.category || '',
        tags: Array.isArray(json.tags) ? json.tags : [],
        body: json.bodyMarkdown || '',
        internal_links: safeLinks,
      });
      onClose?.();
    } catch (e) {
      setError('AI draft failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl" onClick={e => e.stopPropagation()}>
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> AI Blog Draft Generator
                </CardTitle>
                <CardDescription>Generate an SEO-ready draft with tags and internal link suggestions.</CardDescription>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Topic *</label>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Why Mark 16:15 matters today" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Keywords</label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. evangelism, great commission, discipleship" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Target Audience</label>
              <Input value={audience} onChange={e => setAudience(e.target.value)} />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
              <Button onClick={generate} disabled={busy} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Draft</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}