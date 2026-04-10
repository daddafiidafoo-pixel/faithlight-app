import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SeriesCreator({ user, isOpen, onClose, onSeriesCreated }) {
  const [seriesName, setSeriesName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [totalSermons, setTotalSermons] = useState(4);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const queryClient = useQueryClient();

  const createSeriesMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SermonSeries.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sermon-series']);
      toast.success('Series created!');
      if (onSeriesCreated) onSeriesCreated();
      resetForm();
      onClose();
    }
  });

  const resetForm = () => {
    setSeriesName('');
    setDescription('');
    setTheme('');
    setTotalSermons(4);
    setTags([]);
    setGeneratedPlan(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const generateSeriesPlan = async () => {
    if (!theme && !seriesName) {
      toast.error('Enter a series name or theme first');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Generate a complete sermon series plan for:
Series Theme: ${theme || seriesName}
Number of Sermons: ${totalSermons}

Create a structured plan with:

**Series Overview:**
- Suggested series name (if not "${seriesName}")
- Compelling description (2-3 sentences)
- Overall theme/focus

**Sermon Outline (${totalSermons} sermons):**

For each sermon, provide:
1. Sermon Title
2. Main Scripture Passage
3. Key Points (3 main ideas)
4. Suggested Length (in minutes)

Format as clean markdown with clear sections.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedPlan(response);
      toast.success('Series plan generated!');
    } catch (error) {
      toast.error('Failed to generate series plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateSeries = () => {
    if (!seriesName.trim()) {
      toast.error('Series name is required');
      return;
    }

    createSeriesMutation.mutate({
      creator_id: user.id,
      creator_name: user.full_name || user.email,
      series_name: seriesName,
      description: description || `A ${totalSermons}-part sermon series`,
      theme: theme || seriesName,
      total_sermons: totalSermons,
      completed_sermons: 0,
      status: 'planning',
      tags: tags.length > 0 ? tags : [theme || 'sermon']
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Create Sermon Series
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Series Name *</label>
            <Input
              placeholder="e.g., The Gospel of John, Fruit of the Spirit"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Theme/Focus</label>
            <Input
              placeholder="e.g., Grace, Prayer, Christian Living"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <Textarea
              placeholder="Brief description of the series..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Total Sermons Planned</label>
            <Input
              type="number"
              min="2"
              max="52"
              value={totalSermons}
              onChange={(e) => setTotalSermons(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button onClick={addTag} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={generateSeriesPlan}
              disabled={generating}
              variant="outline"
              className="w-full gap-2 bg-purple-50 border-purple-200"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Series Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Generate Series Plan
                </>
              )}
            </Button>
          </div>

          {generatedPlan && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI-Generated Series Plan
                </h3>
                <div className="prose prose-sm max-w-none text-sm">
                  <pre className="whitespace-pre-wrap font-sans">{generatedPlan}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCreateSeries}
              disabled={createSeriesMutation.isPending}
              className="flex-1 bg-indigo-600"
            >
              {createSeriesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Series'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}