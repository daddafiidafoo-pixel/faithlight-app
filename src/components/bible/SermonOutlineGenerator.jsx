import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, Copy, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const SERMON_THEMES = ['Grace & Forgiveness', 'Faith & Trust', 'Hope & Perseverance', 'Love & Service', 'Prayer & Worship', 'Salvation', 'Holy Spirit', 'Community & Fellowship', 'Justice & Mercy', 'Stewardship'];

export default function SermonOutlineGenerator({ onInsertToChat }) {
  const [expanded, setExpanded] = useState(false);
  const [theme, setTheme] = useState('');
  const [passage, setPassage] = useState('');
  const [audience, setAudience] = useState('general congregation');
  const [style, setStyle] = useState('expository');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!theme && !passage) { toast.error('Enter a theme or passage'); return; }
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a detailed sermon outline for:
Theme: ${theme || 'Not specified'}
Scripture Passage: ${passage || 'Not specified'}
Audience: ${audience}
Sermon Style: ${style}

Include:
1. Sermon Title (compelling and memorable)
2. Central Message / Big Idea (one sentence)
3. Introduction (hook, problem statement, bridge to text)
4. 3 main points with sub-points and scripture references
5. Practical application for each point
6. Conclusion with call to action
7. Suggested illustrations or stories
8. Closing prayer prompt

Format with clear markdown headings.`,
      add_context_from_internet: true,
    });
    setResult(res);
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardContent className="pt-4 pb-4">
        <button className="w-full flex items-center justify-between" onClick={() => setExpanded(p => !p)}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-600 rounded-lg"><BookOpen className="w-4 h-4 text-white" /></div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Sermon Outline Generator</p>
              <p className="text-xs text-gray-500">AI-powered outlines from themes or scripture</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Theme</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="e.g. Grace & Forgiveness" value={theme} onChange={e => setTheme(e.target.value)} list="themes" />
                <datalist id="themes">{SERMON_THEMES.map(t => <option key={t} value={t} />)}</datalist>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Scripture Passage</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="e.g. John 3:16-21" value={passage} onChange={e => setPassage(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Audience</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" value={audience} onChange={e => setAudience(e.target.value)}>
                  <option>General congregation</option>
                  <option>Youth group</option>
                  <option>New believers</option>
                  <option>Small group</option>
                  <option>Men's group</option>
                  <option>Women's group</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Style</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" value={style} onChange={e => setStyle(e.target.value)}>
                  <option value="expository">Expository</option>
                  <option value="topical">Topical</option>
                  <option value="narrative">Narrative</option>
                  <option value="biographical">Biographical</option>
                </select>
              </div>
            </div>

            <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700" onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating outline...' : 'Generate Sermon Outline'}
            </Button>

            {result && (
              <div className="bg-white border border-purple-200 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <Badge className="bg-purple-100 text-purple-800">Sermon Outline</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={copy}><Copy className="w-3 h-3" />Copy</Button>
                    {onInsertToChat && (
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-indigo-600" onClick={() => onInsertToChat('📖 **Sermon Outline**\n\n' + result)}>
                        Insert to Chat
                      </Button>
                    )}
                  </div>
                </div>
                <ReactMarkdown className="prose prose-sm max-w-none text-sm">{result}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}