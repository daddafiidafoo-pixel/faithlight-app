import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2, Tags, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AI Blog/Post Tools Panel
 * Props:
 *   currentContent: string — current post HTML or plain text
 *   currentTitle: string — current title
 *   onInsertContent: (content: string) => void — called when user wants to use generated content
 *   onInsertTags: (tags: string[]) => void — called when user wants to use generated tags
 */
export default function AIBlogTools({ currentContent, currentTitle, onInsertContent, onInsertTags }) {
  // Write from scratch
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('inspirational');
  const [length, setLength] = useState('medium');
  const [writeResult, setWriteResult] = useState('');
  const [writeLoading, setWriteLoading] = useState(false);

  // Edit / improve
  const [editInstruction, setEditInstruction] = useState('');
  const [editResult, setEditResult] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Tags & metadata
  const [generatedTags, setGeneratedTags] = useState([]);
  const [generatedMeta, setGeneratedMeta] = useState({ description: '', keywords: '' });
  const [tagsLoading, setTagsLoading] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success('Copied to clipboard');
  };

  const lengthMap = { short: '300-500 words', medium: '600-900 words', long: '1000-1500 words' };

  // ── 1. Write from scratch ──────────────────────────────────────────────────
  const handleWrite = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setWriteLoading(true);
    setWriteResult('');
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a ${tone} blog post / sermon reflection about: "${topic}".
Length: ${lengthMap[length]}.
Style: well-structured with a title, intro, 2-3 body sections, and a closing prayer or call to action.
Use scripture references where relevant (quote them).
Write in plain text (no markdown symbols, no HTML).
Start directly with the title on the first line.`,
      });
      setWriteResult(typeof res === 'string' ? res : res?.text || '');
    } catch {
      toast.error('AI generation failed — please try again');
    }
    setWriteLoading(false);
  };

  // ── 2. Edit / improve existing ────────────────────────────────────────────
  const handleEdit = async () => {
    const source = currentContent?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!source) { toast.error('No content to edit — write something first'); return; }
    if (!editInstruction.trim()) { toast.error('Describe how to improve the post'); return; }
    setEditLoading(true);
    setEditResult('');
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a writing editor. Improve the following blog post / sermon according to this instruction: "${editInstruction}".

ORIGINAL CONTENT:
${source}

Rules:
- Keep the core message and scripture references intact
- Output ONLY the improved text, no commentary
- Write in plain text (no markdown, no HTML)`,
      });
      setEditResult(typeof res === 'string' ? res : res?.text || '');
    } catch {
      toast.error('AI editing failed — please try again');
    }
    setEditLoading(false);
  };

  // ── 3. Generate tags & metadata ───────────────────────────────────────────
  const handleGenerateTags = async () => {
    const source = (currentTitle || '') + ' ' + (currentContent?.replace(/<[^>]*>/g, ' ') || '');
    if (source.trim().length < 20) { toast.error('Add some content first'); return; }
    setTagsLoading(true);
    setGeneratedTags([]);
    setGeneratedMeta({ description: '', keywords: '' });
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this blog post / sermon and generate SEO metadata.

CONTENT:
${source.slice(0, 2000)}

Return JSON with:
{
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "description": "One sentence meta description (max 155 chars)",
  "keywords": "comma separated keywords for SEO"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            tags: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            keywords: { type: 'string' },
          },
        },
      });
      setGeneratedTags(res?.tags || []);
      setGeneratedMeta({ description: res?.description || '', keywords: res?.keywords || '' });
    } catch {
      toast.error('Tag generation failed — please try again');
    }
    setTagsLoading(false);
  };

  return (
    <Card className="border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-indigo-800">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          AI Writing Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid grid-cols-3 w-full rounded-none border-b bg-transparent h-9">
            <TabsTrigger value="write" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">Write</TabsTrigger>
            <TabsTrigger value="edit" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">Edit</TabsTrigger>
            <TabsTrigger value="tags" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">Tags</TabsTrigger>
          </TabsList>

          {/* ── WRITE ── */}
          <TabsContent value="write" className="p-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Topic / Theme</Label>
              <Input
                placeholder="e.g. God's grace in suffering"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="text-sm h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="devotional">Devotional</SelectItem>
                    <SelectItem value="evangelistic">Evangelistic</SelectItem>
                    <SelectItem value="pastoral">Pastoral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (~400w)</SelectItem>
                    <SelectItem value="medium">Medium (~700w)</SelectItem>
                    <SelectItem value="long">Long (~1200w)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleWrite} disabled={writeLoading} size="sm" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
              {writeLoading ? <><Loader2 className="w-3 h-3 animate-spin" />Writing…</> : <><Wand2 className="w-3 h-3" />Generate Post</>}
            </Button>

            {writeResult && (
              <div className="mt-2 space-y-2">
                <Textarea value={writeResult} readOnly rows={8} className="text-xs resize-none bg-white" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => copyToClipboard(writeResult)}>
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                  </Button>
                  {onInsertContent && (
                    <Button size="sm" className="flex-1 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => { onInsertContent(writeResult); toast.success('Content inserted into editor'); }}>
                      <Sparkles className="w-3 h-3" /> Use This
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── EDIT ── */}
          <TabsContent value="edit" className="p-4 space-y-3">
            <p className="text-xs text-gray-500">Improves your current draft based on your instruction.</p>
            <div className="space-y-1">
              <Label className="text-xs">Improvement instruction</Label>
              <Textarea
                placeholder="e.g. Make it more concise and add a hopeful conclusion"
                value={editInstruction}
                onChange={e => setEditInstruction(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <Button onClick={handleEdit} disabled={editLoading} size="sm" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
              {editLoading ? <><Loader2 className="w-3 h-3 animate-spin" />Improving…</> : <><Wand2 className="w-3 h-3" />Improve Draft</>}
            </Button>

            {editResult && (
              <div className="mt-2 space-y-2">
                <Textarea value={editResult} readOnly rows={8} className="text-xs resize-none bg-white" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => copyToClipboard(editResult)}>
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                  </Button>
                  {onInsertContent && (
                    <Button size="sm" className="flex-1 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => { onInsertContent(editResult); toast.success('Improved content inserted'); }}>
                      <Sparkles className="w-3 h-3" /> Replace
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── TAGS ── */}
          <TabsContent value="tags" className="p-4 space-y-3">
            <p className="text-xs text-gray-500">Auto-generates tags and SEO metadata from your current content.</p>
            <Button onClick={handleGenerateTags} disabled={tagsLoading} size="sm" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
              {tagsLoading ? <><Loader2 className="w-3 h-3 animate-spin" />Analyzing…</> : <><Tags className="w-3 h-3" />Generate Tags & Meta</>}
            </Button>

            {generatedTags.length > 0 && (
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-xs mb-1 block">Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {generatedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-indigo-100" onClick={() => copyToClipboard(tag)}>{tag}</Badge>
                    ))}
                  </div>
                  {onInsertTags && (
                    <Button size="sm" variant="outline" className="mt-2 w-full text-xs gap-1" onClick={() => { onInsertTags(generatedTags); toast.success('Tags applied'); }}>
                      <Check className="w-3 h-3" /> Apply All Tags
                    </Button>
                  )}
                </div>
                {generatedMeta.description && (
                  <div className="space-y-1">
                    <Label className="text-xs">Meta Description</Label>
                    <div className="text-xs text-gray-700 bg-gray-50 rounded p-2 border">{generatedMeta.description}</div>
                  </div>
                )}
                {generatedMeta.keywords && (
                  <div className="space-y-1">
                    <Label className="text-xs">Keywords</Label>
                    <div className="text-xs text-gray-700 bg-gray-50 rounded p-2 border">{generatedMeta.keywords}</div>
                  </div>
                )}
                <Button size="sm" variant="ghost" className="w-full text-xs gap-1 text-gray-500" onClick={handleGenerateTags}>
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}