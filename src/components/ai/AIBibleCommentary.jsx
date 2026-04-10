import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Share2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AIBibleCommentary({ passage, translation = 'WEB', language = 'en', tier = 'free' }) {
  const [commentary, setCommentary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOm = language === 'om';

  const generateCommentary = async () => {
    if (tier === 'free') {
      toast.error(isOm ? 'Fooyyessi Premium' : 'Upgrade to Premium');
      return;
    }

    setLoading(true);
    const prompt = `Generate a detailed Bible commentary for ${passage} (${translation}).

Include:
1. **Historical Context** — When written, who wrote it, why
2. **Key Themes** — Main theological ideas
3. **Verse-by-Verse** — Brief explanation of key phrases
4. **Theological Insights** — Doctrinal significance
5. **Cross-References** — Related passages
6. **Practical Application** — How to apply today
7. **Scholarly Notes** — References to commentaries where helpful

Keep scholarly but accessible. End with: ⚠️ *AI-generated — verify with Scripture.*`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setCommentary(typeof response === 'string' ? response : JSON.stringify(response));
    } catch (err) {
      toast.error(isOm ? 'Dogoggora dhabudhaa' : 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const copyCommentary = async () => {
    if (!commentary) return;
    await navigator.clipboard.writeText(commentary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(isOm ? 'Garagalche' : 'Copied');
  };

  if (tier === 'free') {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 text-sm">{isOm ? 'AI Seensa Kitaaba' : 'AI Bible Commentary'}</h3>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          {isOm ? 'Haala, seera, fi gargaarsa isaa Kitaabaa keessa.' : 'Historical context, theological insights, and scholarly references.'}
        </p>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7">
          {isOm ? 'Fooyyessi' : 'Unlock Premium'}
        </Button>
      </div>
    );
  }

  if (!commentary) {
    return (
      <Button onClick={generateCommentary} disabled={loading} variant="outline" size="sm" className="gap-2 text-xs">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
        {isOm ? 'Seensa' : 'Show Commentary'}
      </Button>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          {passage}
        </h3>
        <button onClick={copyCommentary} className="text-xs text-gray-400 hover:text-blue-600">
          {copied ? 'Copied' : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <ReactMarkdown className="text-xs prose prose-sm prose-slate [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {commentary}
      </ReactMarkdown>
    </div>
  );
}