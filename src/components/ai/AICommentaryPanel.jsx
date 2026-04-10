import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, BookOpen, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useGlobalLanguage } from '../GlobalLanguageContext';
import { getLanguageSystemPrompt } from '../../functions/getLanguageSystemPrompt';

export default function AICommentaryPanel({ book, chapter, verse, text, translation }) {
  const { aiLanguage } = useGlobalLanguage();
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCommentary = async () => {
    setLoading(true);
    const languageInstruction = getLanguageSystemPrompt(aiLanguage);
    const prompt = `${languageInstruction}

You are a biblical commentary assistant drawing from trusted resources like Matthew Henry's Commentary, Barnes' Notes, and modern evangelical scholarship.

Generate a scholarly yet accessible commentary for:

**${book} ${chapter}:${verse}** (${translation})
Text: "${text}"

Provide:
1. **Historical & Cultural Context** (1-2 sentences about the time, setting, and original audience)
2. **Theological Significance** (2-3 key insights about God's character, redemptive themes, or biblical doctrine)
3. **Word Study** (highlight 1-2 key Greek/Hebrew terms if relevant, with meanings)
4. **Cross-References** (2-3 related passages that illuminate this text)
5. **Practical Application** (how this passage challenges or encourages modern believers)
6. **Key Commentary Insights** (brief reference to major biblical commentaries' interpretations)

Keep the commentary:
- Concise but substantive (150-250 words)
- Scholarly but accessible (church-friendly language)
- Doctrinally sound and pastorally sensitive
- Grounded in historical-grammatical interpretation

End with: ⚠️ *AI-generated commentary. Verify interpretations with your Bible, consult scholarly commentaries, and discuss with your pastor.*`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setCommentary(typeof response === 'string' ? response : JSON.stringify(response));
    setLoading(false);
  };

  const copyCommentary = async () => {
    await navigator.clipboard.writeText(commentary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">AI Commentary</h3>
        </div>
        {commentary && (
          <button
            onClick={copyCommentary}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>

      {!commentary && !loading && (
        <Button onClick={generateCommentary} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
          <BookOpen className="w-4 h-4" /> Generate Commentary
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span className="text-sm text-gray-500">Generating commentary…</span>
        </div>
      )}

      {commentary && (
        <div className="space-y-3">
          <ReactMarkdown
            className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-1 leading-relaxed text-gray-700">{children}</p>,
              ol: ({ children }) => <ol className="my-1 ml-4 list-decimal text-gray-700">{children}</ol>,
              li: ({ children }) => <li className="my-0.5 text-gray-700">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            }}
          >
            {commentary}
          </ReactMarkdown>
          <div className="text-xs text-amber-600 flex items-start gap-2 pt-2 border-t border-gray-100">
            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>AI commentary may contain errors. Verify with reliable biblical sources.</span>
          </div>
        </div>
      )}
    </div>
  );
}