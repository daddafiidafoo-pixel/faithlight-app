import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles, Wand2, Tags, RefreshCw, Copy, Check,
  ChevronDown, ChevronUp, Loader2, Lightbulb, FileText, Hash
} from 'lucide-react';
import { toast } from 'sonner';

const CONTENT_TYPES = [
  { value: 'devotional', label: 'Devotional' },
  { value: 'sermon', label: 'Sermon Outline' },
  { value: 'study_plan', label: 'Study Plan' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'forum_post', label: 'Forum Post' },
  { value: 'testimony', label: 'Testimony' },
];

const MODES = [
  { id: 'draft', label: 'Draft', icon: Wand2, color: 'indigo' },
  { id: 'titles', label: 'Titles', icon: Lightbulb, color: 'amber' },
  { id: 'improve', label: 'Improve', icon: RefreshCw, color: 'purple' },
  { id: 'metadata', label: 'Metadata', icon: Hash, color: 'emerald' },
];

export default function AIContentAssistant({ onInsert, initialContent = '' }) {
  const [mode, setMode] = useState('draft');
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('devotional');
  const [existingContent, setExistingContent] = useState(initialContent);
  const [result, setResult] = useState('');
  const [titles, setTitles] = useState([]);
  const [tags, setTags] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  /* ── Draft mode ── */
  const handleDraft = async () => {
    if (!topic.trim()) return toast.error('Please enter a topic or keywords');
    setLoading(true); setResult('');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a FaithLight AI content assistant helping believers create spiritual content.
Draft a ${contentType} based on the following topic/keywords: "${topic}".
Make it biblically grounded, warm, practical, and well-structured.
Include a relevant scripture reference. Keep it concise (150–250 words).`,
    });
    setResult(res);
    setLoading(false);
  };

  /* ── Titles & Taglines mode ── */
  const handleTitles = async () => {
    const text = topic || existingContent;
    if (!text.trim()) return toast.error('Please enter a topic or existing content');
    setLoading(true); setTitles([]);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate title and tagline suggestions for a biblical ${contentType} about: "${text}".
Return JSON with: titles (array of 5 compelling title strings) and taglines (array of 4 short tagline strings, max 12 words each).
Titles should be engaging, faith-based, and relevant. Taglines should be memorable one-liners.`,
      response_json_schema: {
        type: 'object',
        properties: {
          titles: { type: 'array', items: { type: 'string' } },
          taglines: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    setTitles(res || { titles: [], taglines: [] });
    setLoading(false);
  };

  /* ── Improve mode ── */
  const handleImprove = async () => {
    if (!existingContent.trim()) return toast.error('Please enter content to improve');
    setLoading(true); setResult('');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a FaithLight AI writing coach. Improve the following spiritual content.
Make it clearer, more engaging, and better structured. Fix any theological vagueness.
Suggest 2–3 rephrasing options for the opening line.
Content: """${existingContent}"""
Return improved version followed by "---" then the rephrasing options.`,
    });
    setResult(res);
    setLoading(false);
  };

  /* ── Metadata mode ── */
  const handleMetadata = async () => {
    const text = existingContent || topic;
    if (!text.trim()) return toast.error('Please enter content or topic first');
    setLoading(true); setMetadata(null); setTags([]);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the following spiritual content and generate comprehensive metadata for publishing.
Content: """${text}"""
Return JSON with:
- tags: array of 6-8 relevant keyword tags (short, lowercase)
- keywords: array of 5-6 SEO keywords/phrases
- category: one of [Devotional, Teaching, Testimony, Question, Announcement]
- target_audience: short string (e.g. "New believers, families")
- bible_references: array of scripture references mentioned or relevant
- reading_time_minutes: estimated number`,
      response_json_schema: {
        type: 'object',
        properties: {
          tags: { type: 'array', items: { type: 'string' } },
          keywords: { type: 'array', items: { type: 'string' } },
          category: { type: 'string' },
          target_audience: { type: 'string' },
          bible_references: { type: 'array', items: { type: 'string' } },
          reading_time_minutes: { type: 'number' },
        },
      },
    });
    setMetadata(res);
    setTags(res?.tags || []);
    setLoading(false);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className="border-indigo-200 shadow-md">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI Content Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">Beta</Badge>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Mode Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setMode(id)}
                className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                  mode === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Common inputs */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Content Type</label>
              <select value={contentType} onChange={e => setContentType(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Topic / Keywords</label>
              <Input placeholder="e.g. faith in trials, forgiveness, John 3:16..."
                value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && mode === 'draft' && handleDraft()}
                className="text-sm" />
            </div>
            {(mode === 'improve' || mode === 'metadata') && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Existing Content</label>
                <Textarea placeholder="Paste your content here..."
                  value={existingContent} onChange={e => setExistingContent(e.target.value)}
                  rows={4} className="text-sm resize-none" />
              </div>
            )}
          </div>

          {/* Action Button */}
          {mode === 'draft' && (
            <Button onClick={handleDraft} disabled={loading} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {loading ? 'Drafting...' : 'Generate Draft'}
            </Button>
          )}
          {mode === 'titles' && (
            <Button onClick={handleTitles} disabled={loading} className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Suggest Titles & Taglines'}
            </Button>
          )}
          {mode === 'improve' && (
            <Button onClick={handleImprove} disabled={loading} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Improving...' : 'Suggest Improvements'}
            </Button>
          )}
          {mode === 'metadata' && (
            <Button onClick={handleMetadata} disabled={loading} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Generate Metadata & Keywords'}
            </Button>
          )}

          {/* Draft / Improve Result */}
          {result && (mode === 'draft' || mode === 'improve') && (
            <div className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed pr-8">{result}</p>
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => copyText(result)} className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {onInsert && (
                <Button size="sm" variant="outline" onClick={() => { onInsert(result); toast.success('Inserted into editor'); }}
                  className="mt-2 text-xs h-7 gap-1.5">
                  <FileText className="w-3 h-3" /> Insert into Editor
                </Button>
              )}
            </div>
          )}

          {/* Titles Result */}
          {titles?.titles?.length > 0 && mode === 'titles' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" /> Title Suggestions
                </p>
                <div className="space-y-1.5">
                  {titles.titles.map((title, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100 group">
                      <span className="text-sm text-gray-800 flex-1">{title}</span>
                      <button onClick={() => copyText(title)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-amber-600">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {titles.taglines?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">✨ Taglines</p>
                  <div className="space-y-1.5">
                    {titles.taglines.map((tl, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100 group">
                        <span className="text-sm text-gray-700 italic flex-1">"{tl}"</span>
                        <button onClick={() => copyText(tl)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata Result */}
          {metadata && mode === 'metadata' && (
            <div className="space-y-3 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              {metadata.category && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Category:</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">{metadata.category}</Badge>
                </div>
              )}
              {metadata.target_audience && (
                <div>
                  <span className="text-xs font-semibold text-gray-600">Audience: </span>
                  <span className="text-xs text-gray-700">{metadata.target_audience}</span>
                </div>
              )}
              {metadata.reading_time_minutes && (
                <div>
                  <span className="text-xs font-semibold text-gray-600">Reading time: </span>
                  <span className="text-xs text-gray-700">~{metadata.reading_time_minutes} min</span>
                </div>
              )}
              {tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">Tags:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <button key={tag} onClick={() => { copyText(tag); onInsert && onInsert(tag); }}
                        className="text-xs px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors">
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {metadata.keywords?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">Keywords:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.keywords.map(kw => (
                      <span key={kw} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {metadata.bible_references?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">Scripture References:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.bible_references.map(ref => (
                      <span key={ref} className="text-xs px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full">📖 {ref}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}