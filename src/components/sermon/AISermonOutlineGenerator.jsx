import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AISermonOutlineGenerator({ onOutlineGenerated }) {
  const [scripture, setScripture] = useState('');
  const [theme, setTheme] = useState('');
  const [sermonType, setSermonType] = useState('expository');
  const [audience, setAudience] = useState('mixed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState(null);

  const generateOutline = async () => {
    if (!scripture.trim()) {
      toast.error('Please enter a scripture passage');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a comprehensive sermon outline based on the following:

Scripture Passage: ${scripture}
Theme: ${theme || 'Main theme from the passage'}
Sermon Type: ${sermonType}
Target Audience: ${audience}

Please provide:
1. Sermon Title (creative and engaging)
2. Main Idea/Big Idea (one clear sentence)
3. Introduction (hook and context)
4. 3-4 Main Points with:
   - Clear headings
   - Supporting scriptures
   - Key explanations
   - Transition sentences
5. Conclusion (summary and call to action)
6. Practical Application Points

Format the outline in a clear, structured way that a pastor can easily follow.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setOutline(result);
      if (onOutlineGenerated) {
        onOutlineGenerated(result);
      }
      toast.success('Sermon outline generated!');
    } catch (error) {
      console.error('Failed to generate outline:', error);
      toast.error('Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullSermon = async () => {
    if (!outline) {
      toast.error('Generate an outline first');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Based on this sermon outline, generate a complete sermon manuscript with:
- Full introduction with engaging hook
- Detailed explanation of each main point with smooth transitions
- Rich biblical exposition and cross-references
- Compelling conclusion with clear call to action
- Sermon should be 20-25 minutes when spoken (approximately 2500-3000 words)

Outline:
${outline}

Write in a conversational, pastoral tone that connects with the audience.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      if (onOutlineGenerated) {
        onOutlineGenerated(result);
      }
      toast.success('Full sermon generated!');
    } catch (error) {
      console.error('Failed to generate sermon:', error);
      toast.error('Failed to generate full sermon');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (outline) {
      navigator.clipboard.writeText(outline);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          AI Sermon Outline Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Scripture Passage</Label>
          <Input
            placeholder="e.g., John 3:16-21"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
          />
        </div>

        <div>
          <Label>Theme (Optional)</Label>
          <Input
            placeholder="e.g., God's Love, Salvation, Grace"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Sermon Type</Label>
            <Select value={sermonType} onValueChange={setSermonType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expository">Expository</SelectItem>
                <SelectItem value="topical">Topical</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
                <SelectItem value="evangelistic">Evangelistic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youth">Youth</SelectItem>
                <SelectItem value="adults">Adults</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="seniors">Seniors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generateOutline}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Outline'
            )}
          </Button>

          {outline && (
            <Button 
              onClick={generateFullSermon}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              Generate Full Sermon
            </Button>
          )}
        </div>

        {outline && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Generated Outline</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            <Textarea
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}