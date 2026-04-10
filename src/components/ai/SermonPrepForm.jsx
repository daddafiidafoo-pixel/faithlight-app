import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Save, RefreshCw, Loader2, FileText, BookOpen, MessageCircle, Lightbulb, Zap, Copy, Tag, Layers } from 'lucide-react';
import { toast } from 'sonner';
import UpsellModal from '../premium/UpsellModal';
import { useUpsellEngine } from '../hooks/useUpsellEngine';

const SYSTEM_PROMPT = `You are FaithLight AI, a Bible study and sermon preparation assistant.

Rules:
- Always be Bible-centered and respectful.
- Provide Bible references in the format (Book Chapter:Verse).
- Do NOT invent exact Bible wording; if quoting, keep it short and accurate.
- Structure responses with clear headings and bullet points in markdown.
- Keep responses practical and immediately usable for pastors and teachers.
- End with: "*Please verify all references and wording with your Bible translation.*"`;

const EXTRA_SECTIONS = [
  { key: 'verses', label: 'More Verses', icon: BookOpen, instruction: 'Add 5 more supporting Bible verses for this topic, grouped by subtopic.' },
  { key: 'illustrations', label: 'Illustrations', icon: Lightbulb, instruction: 'Suggest 3 real-world illustrations or stories that could illustrate this sermon topic. Keep them relatable.' },
  { key: 'discussion', label: 'Discussion Questions', icon: MessageCircle, instruction: 'Create 5 small group discussion questions based on this sermon topic.' },
];

export default function SermonPrepForm({ user, plan }) {
  const engine = useUpsellEngine(user, plan);
  const [form, setForm] = useState({ topic: '', audience: 'mixed', duration: '30', style: 'sermon' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showTitleGenerator, setShowTitleGenerator] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [themes, setThemes] = useState(null);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [seriesIdeas, setSeriesIdeas] = useState(null);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const buildPrompt = (extra = '') => {
    const base = `User request: Generate a structured ${form.style} preparation on the topic: "${form.topic}".
- Audience: ${form.audience}
- Duration: ${form.duration} minutes
- Style: ${form.style}

Please provide:
1. **Big Idea** (one sentence)
2. **Key Verses** (6–10 references)
3. **3–4 Subtopics** with supporting verses
4. **Full Outline** (Introduction → Main Points → Application → Closing Prayer)
5. **3 Discussion Questions**
6. **Short Closing Prayer**`;
    return extra ? `${base}\n\nAdditional request: ${extra}` : base;
  };

  const generate = async () => {
    if (!form.topic.trim()) { toast.error('Please enter a topic.'); return; }
    // Sermon gate — checks plan, fires upsell if needed
    const allowed = await engine.checkSermon();
    if (!allowed) return;
    await engine.logSermon();

    setLoading(true);
    setResult('');
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\n${buildPrompt()}`,
      });
      setResult(typeof response === 'string' ? response : JSON.stringify(response));
    } catch { toast.error('Failed to generate. Please try again.'); }
    setLoading(false);
  };

  const addSection = async (section) => {
    if (!result) { toast.error('Generate an outline first.'); return; }
    setLoadingExtra(section.key);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nContext: A sermon on "${form.topic}" for ${form.audience} audience.\n\n${section.instruction}`,
      });
      const extra = typeof response === 'string' ? response : JSON.stringify(response);
      setResult(prev => `${prev}\n\n---\n\n${extra}`);
    } catch { toast.error('Failed to add section.'); }
    setLoadingExtra(null);
  };

  const extractThemes = async () => {
    if (!form.topic.trim()) { toast.error('Please enter a topic first.'); return; }
    setLoadingThemes(true);
    setActivePanel('themes');
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nFor the sermon topic: "${form.topic}", identify and extract 5-7 key theological themes. For each theme:
- Give it a short name (2-4 words)
- Write a 1-2 sentence explanation
- List 2-3 key Bible verses that directly address this theme
- Rate its centrality to the topic (Primary / Secondary / Supporting)

Format as a structured list in markdown.`,
      });
      setThemes(typeof response === 'string' ? response : JSON.stringify(response));
    } catch { toast.error('Failed to extract themes.'); }
    setLoadingThemes(false);
  };

  const generateSeries = async () => {
    if (!form.topic.trim()) { toast.error('Please enter a topic first.'); return; }
    setLoadingSeries(true);
    setActivePanel('series');
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nBased on the topic: "${form.topic}", generate 3 distinct sermon series ideas. For each series:
- **Series Title**: A compelling name for the series
- **Series Overview**: 2-3 sentences explaining the arc and purpose
- **Target Audience**: Who this series is best suited for
- **Sermon Titles** (4-5 sermons with a clear progression):
  1. Sermon 1 title — brief note on focus
  2. Sermon 2 title — brief note on focus
  3. Sermon 3 title — brief note on focus
  4. Sermon 4 title — brief note on focus
  5. (Optional) Sermon 5 title — brief note on focus
- **Key Scripture Arc**: The primary passage or book threading the series

Format clearly in markdown with each series separated by a horizontal rule.`,
      });
      setSeriesIdeas(typeof response === 'string' ? response : JSON.stringify(response));
    } catch { toast.error('Failed to generate series ideas.'); }
    setLoadingSeries(false);
  };

  const generateTitle = async () => {
    if (!result) { toast.error('Generate an outline first.'); return; }
    setLoadingTitle(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nBased on this sermon outline on "${form.topic}" for ${form.audience}, suggest 5 compelling, clear sermon titles that capture the key message. Each title should be 4-8 words.\n\nOutline:\n${result.substring(0, 500)}...`,
      });
      setGeneratedTitle(typeof response === 'string' ? response : JSON.stringify(response));
      setShowTitleGenerator(true);
    } catch { toast.error('Failed to generate titles.'); }
    setLoadingTitle(false);
  };

  const saveToDrafts = async (shareToCommmunity = false) => {
    if (!user) { toast.error('Sign in to save drafts.'); return; }
    if (!result) return;
    setSaving(true);
    try {
      await base44.entities.SermonNote.create({
        user_id: user.id,
        title: `${form.topic} — ${form.style.charAt(0).toUpperCase() + form.style.slice(1)} (${form.duration} min)`,
        topic: form.topic,
        description: `A ${form.duration}-minute ${form.style} on "${form.topic}" for ${form.audience} audience.`,
        full_content: result,
        content_plain: result.replace(/[#*_`]/g, ''),
        outline: result,
        language: 'en',
        style: form.style,
        audience: form.audience === 'mixed' ? 'adults' : form.audience,
        length_minutes: parseInt(form.duration),
        is_shared: shareToCommmunity,
      });
      toast.success(shareToCommmunity ? 'Saved & shared to Community Showcase!' : 'Saved to your sermon drafts!');
    } catch { toast.error('Failed to save draft.'); }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <UpsellModal open={engine.upsellOpen} onClose={engine.closeUpsell} reason={engine.upsellReason} />
      {/* Title Generator Modal */}
      <Dialog open={showTitleGenerator} onOpenChange={setShowTitleGenerator}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Sermon Titles</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Choose a title or refine your favorite:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <ReactMarkdown className="prose prose-sm max-w-none">
                {generatedTitle}
              </ReactMarkdown>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Or create a custom title:</p>
              <div className="flex gap-2">
                <Input
                  value={currentTitle}
                  onChange={e => setCurrentTitle(e.target.value)}
                  placeholder="Enter your custom title..."
                  className="text-sm"
                />
                <Button size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700">
                  <Copy className="w-3 h-3" /> Use
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" /> Sermon Prep Generator
        </h2>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Topic *</label>
          <Input
            placeholder={`e.g. "God's Love", "Faith in Trials", "The Holy Spirit"`}
            value={form.topic}
            onChange={e => set('topic', e.target.value)}
            className="text-base"
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Audience</label>
            <Select value={form.audience} onValueChange={v => set('audience', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">General Church</SelectItem>
                <SelectItem value="youth">Youth</SelectItem>
                <SelectItem value="new_believers">New Believers</SelectItem>
                <SelectItem value="leaders">Leaders / Pastors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Duration</label>
            <Select value={form.duration} onValueChange={v => set('duration', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Style</label>
            <Select value={form.style} onValueChange={v => set('style', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sermon">Sermon</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
                <SelectItem value="bible_study">Bible Study</SelectItem>
                <SelectItem value="devotional">Devotional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Actions (before generating) */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={generate} disabled={loading || !form.topic.trim()} className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 h-11 text-base">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate Outline'}
          </Button>
          <Button
            variant="outline"
            onClick={extractThemes}
            disabled={loadingThemes || !form.topic.trim()}
            className="gap-1.5 h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
          >
            {loadingThemes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
            Themes
          </Button>
          <Button
            variant="outline"
            onClick={generateSeries}
            disabled={loadingSeries || !form.topic.trim()}
            className="gap-1.5 h-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            {loadingSeries ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            Series Ideas
          </Button>
        </div>
      </div>

      {/* Themes Panel */}
      {(loadingThemes || themes) && activePanel === 'themes' && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-violet-100 border-b border-violet-200">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-600" />
              <span className="font-semibold text-violet-900 text-sm">Key Themes</span>
              {form.topic && <Badge variant="outline" className="text-xs border-violet-300 text-violet-700">{form.topic}</Badge>}
            </div>
            <button onClick={() => { setActivePanel(null); setThemes(null); }} className="text-violet-400 hover:text-violet-700 text-xs">✕</button>
          </div>
          <div className="px-5 py-4">
            {loadingThemes ? (
              <div className="flex items-center gap-3 text-violet-500 py-6 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Extracting key themes…</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-violet">
                <ReactMarkdown>{themes}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Series Ideas Panel */}
      {(loadingSeries || seriesIdeas) && activePanel === 'series' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-emerald-100 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-900 text-sm">Sermon Series Ideas</span>
              {form.topic && <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">{form.topic}</Badge>}
            </div>
            <button onClick={() => { setActivePanel(null); setSeriesIdeas(null); }} className="text-emerald-400 hover:text-emerald-700 text-xs">✕</button>
          </div>
          <div className="px-5 py-4">
            {loadingSeries ? (
              <div className="flex items-center gap-3 text-emerald-600 py-6 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Generating sermon series ideas…</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-emerald">
                <ReactMarkdown>{seriesIdeas}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outline Result */}
      {(loading || result) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-gray-800 text-sm">Sermon Outline</span>
              {form.topic && <Badge variant="outline" className="text-xs">{form.topic}</Badge>}
            </div>
            {result && (
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setResult('')} className="gap-1 text-xs">
                  <RefreshCw className="w-3 h-3" /> Clear
                </Button>
                <Button size="sm" onClick={() => saveToDrafts(false)} disabled={saving} className="gap-1 text-xs bg-green-600 hover:bg-green-700">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save Draft
                </Button>
                <Button size="sm" onClick={() => saveToDrafts(true)} disabled={saving} variant="outline" className="gap-1 text-xs border-purple-300 text-purple-700 hover:bg-purple-50">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Share to Community
                </Button>
              </div>
            )}
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="flex items-center gap-3 text-gray-400 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-sm">Searching Scripture and crafting your sermon prep…</span>
              </div>
            ) : (
              <div className="prose prose-sm prose-indigo max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Add-on buttons */}
          {result && !loading && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">Add to outline:</p>
                <div className="flex flex-wrap gap-2">
                  {EXTRA_SECTIONS.map(s => (
                    <Button
                      key={s.key}
                      variant="outline"
                      size="sm"
                      onClick={() => addSection(s)}
                      disabled={loadingExtra === s.key}
                      className="gap-1.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      {loadingExtra === s.key
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <s.icon className="w-3 h-3" />}
                      {s.label}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateTitle}
                    disabled={loadingTitle}
                    className="gap-1.5 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    {loadingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    Generate Titles
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}