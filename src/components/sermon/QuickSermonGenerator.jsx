import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function QuickSermonGenerator({ user, isOpen, onClose, onSermonCreated }) {
  const [passage, setPassage] = useState('');
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('expository');
  const [audience, setAudience] = useState('adults');
  const [generating, setGenerating] = useState(false);
  const [generatedSermon, setGeneratedSermon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [seriesPart, setSeriesPart] = useState(1);

  const generateSermon = async () => {
    if (!passage && !theme) {
      toast.error('Please enter a passage or theme');
      return;
    }

    setGenerating(true);
    try {
      const profileContext = user?.comprehensive_profile ? `
User Profile Context:
- Ministry Goals: ${user.comprehensive_profile.ministry_goals?.join(', ') || 'General ministry'}
- Preferred Depth: ${user.comprehensive_profile.preferred_content_depth || 'medium'}
- Teaching Style: ${user.comprehensive_profile.sermon_prep_focus?.join(', ') || 'General'}` : '';

      const prompt = `Generate a complete sermon for:
Passage/Theme: ${passage || theme}
Style: ${style}
Target Audience: ${audience}
${profileContext}

Create a comprehensive sermon with:

**SERMON TITLE**
[Compelling, memorable title]

**MAIN SCRIPTURE**
${passage || '[Relevant passage]'}

**SERMON OUTLINE**

**Introduction** (2-3 minutes)
[Engaging hook, context, and thesis]

**Main Point 1: [Title]**
- Key Idea: [Explanation]
- Scripture Support: [Verses]
- Illustration: [Story or example]
- Application: [How to apply]

**Main Point 2: [Title]**
- Key Idea: [Explanation]
- Scripture Support: [Verses]
- Illustration: [Story or example]
- Application: [How to apply]

**Main Point 3: [Title]**
- Key Idea: [Explanation]
- Scripture Support: [Verses]
- Illustration: [Story or example]
- Application: [How to apply]

**Conclusion** (2 minutes)
[Summary, call to action, closing prayer]

**Discussion Questions**
1. [Personal reflection]
2. [Application question]
3. [Group discussion]

Make it ${style}, appropriate for ${audience}, and ready to preach (25-30 minutes).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setGeneratedSermon({
        content: response,
        passage: passage || theme,
        style,
        audience
      });
      toast.success('Sermon generated!');
    } catch (error) {
      toast.error('Failed to generate sermon');
    } finally {
      setGenerating(false);
    }
  };

  const saveToLibrary = async () => {
    if (!generatedSermon) return;

    setSaving(true);
    try {
      const title = generatedSermon.content.split('\n').find(line => line.includes('TITLE') || line.includes('Title'))?.replace(/[*#]/g, '').replace(/TITLE|Title/i, '').trim() || `Sermon on ${generatedSermon.passage}`;
      
      await base44.entities.SharedSermon.create({
        user_id: user.id,
        author_name: user.full_name || user.email,
        title: title,
        topic: generatedSermon.passage,
        content: generatedSermon.content,
        summary: `AI-generated ${generatedSermon.style} sermon`,
        passage_references: passage || '',
        audience: generatedSermon.audience,
        length_minutes: 30,
        style: generatedSermon.style,
        language: 'en',
        sermon_series: seriesName || null,
        series_part: seriesName ? seriesPart : null,
        tags: seriesName 
          ? ['AI-generated', generatedSermon.style, generatedSermon.audience, seriesName]
          : ['AI-generated', generatedSermon.style, generatedSermon.audience]
      });

      toast.success('Sermon saved to library!');
      if (onSermonCreated) onSermonCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to save sermon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Quick AI Sermon Generator
          </DialogTitle>
        </DialogHeader>

        {!generatedSermon ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Bible Passage</label>
              <Input
                placeholder="e.g., John 3:16-21, Romans 8, Psalm 23"
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">OR Theme/Topic</label>
              <Input
                placeholder="e.g., Grace, Faith, Prayer, God's Love"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expository">Expository</SelectItem>
                    <SelectItem value="topical">Topical</SelectItem>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="evangelistic">Evangelistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Audience</label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youth">Youth</SelectItem>
                    <SelectItem value="adults">Adults</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Series Options (Optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Series Name</label>
                  <Input
                    placeholder="e.g., Gospel of John"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Part Number</label>
                  <Input
                    type="number"
                    min="1"
                    value={seriesPart}
                    onChange={(e) => setSeriesPart(parseInt(e.target.value))}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={generateSermon}
              disabled={generating || (!passage && !theme)}
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Sermon...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Complete Sermon
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="pt-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{generatedSermon.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={saveToLibrary}
                disabled={saving}
                className="flex-1 gap-2 bg-indigo-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save to Library
                  </>
                )}
              </Button>
              <Button onClick={() => setGeneratedSermon(null)} variant="outline">
                Generate New
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}