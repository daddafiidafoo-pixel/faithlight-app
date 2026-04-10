import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedSermonBuilder() {
  const { lang } = useI18n();
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [audience, setAudience] = useState('general');
  const [duration, setDuration] = useState('30');
  const [style, setStyle] = useState('expository');
  const [loading, setLoading] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState(null);
  const [title, setTitle] = useState('');

  const audiences = {
    general: lang === 'om' ? 'Diddaa Generikaala' : 'General Audience',
    youth: lang === 'om' ? 'Diddaa Jiddu' : 'Youth',
    families: lang === 'om' ? 'Maatiin' : 'Families',
    new_believers: lang === 'om' ? 'Amantaa Haaraa' : 'New Believers',
    advanced: lang === 'om' ? 'Diddaa Olaanaa' : 'Advanced Scholars',
  };

  const durations = [
    { value: '15', label: lang === 'om' ? '15 daqiqa' : '15 minutes' },
    { value: '20', label: lang === 'om' ? '20 daqiqa' : '20 minutes' },
    { value: '30', label: lang === 'om' ? '30 daqiqa' : '30 minutes' },
    { value: '45', label: lang === 'om' ? '45 daqiqa' : '45 minutes' },
    { value: '60', label: lang === 'om' ? '60 daqiqa' : '60 minutes' },
  ];

  const styles = {
    expository: lang === 'om' ? 'Ibsa Dirqaa' : 'Expository',
    topical: lang === 'om' ? 'Xumura Adda' : 'Topical',
    narrative: lang === 'om' ? 'Seenaa' : 'Narrative',
    devotional: lang === 'om' ? 'Jaalala Guddina' : 'Devotional',
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !scripture.trim()) {
      toast.error(lang === 'om' ? 'Mata jechaa fi Seenaa barbaada' : 'Topic and Scripture required');
      return;
    }

    setLoading(true);
    try {
      const prompt = `
        Generate a detailed sermon outline with the following parameters:
        - Topic: ${topic}
        - Primary Scripture: ${scripture}
        - Audience: ${audiences[audience]}
        - Duration: ${duration} minutes
        - Style: ${styles[style]}
        - Language: ${lang === 'om' ? 'Oromo' : 'English'}
        
        Include:
        1. Engaging introduction
        2. Main points (3-4 based on duration)
        3. Illustrations and examples
        4. Key takeaways
        5. Call to action
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      setGeneratedOutline(result);
      toast.success(lang === 'om' ? 'Hangiraa lebam' : 'Outline generated');
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Generation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !generatedOutline) {
      toast.error(lang === 'om' ? 'Mata jechaa fi qabiyyeesa barbaada' : 'Title and content required');
      return;
    }

    try {
      const user = await base44.auth.me();
      
      await base44.entities.SavedAIOutput.create({
        user_id: user.id,
        output_type: 'sermon',
        title,
        content: generatedOutline,
        metadata: {
          topic,
          scripture,
          audience,
          duration,
          style,
        },
        is_template: false,
      });

      toast.success(lang === 'om' ? 'Akka seeya galame' : 'Saved to library');
      setTitle('');
      setGeneratedOutline(null);
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[var(--faith-light-primary-dark)]">
          {lang === 'om' ? 'Ijaarsa Waaqeffannaa AI Pro' : 'AI Sermon Builder Pro'}
        </h2>
        <p className="text-gray-600 mt-2">
          {lang === 'om'
            ? 'Diddaa keessaniif waaqeffannaa addaa galmee'
            : 'Create tailored sermons for your specific audience'}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'om' ? 'Filannoo' : 'Settings'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Mata Jechaa' : 'Topic'}
              </label>
              <Input
                placeholder={lang === 'om' ? 'e.g., Loojii fi Ajajaa' : 'e.g., Love and Grace'}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Seenaa Dirqaa' : 'Scripture Reference'}
              </label>
              <Input
                placeholder={lang === 'om' ? 'e.g., Yoohaan 3:16' : 'e.g., John 3:16'}
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Diddaa' : 'Audience'}
              </label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(audiences).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Yeroo' : 'Duration'}
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Sagalee' : 'Style'}
              </label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(styles).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !topic.trim() || !scripture.trim()}
              className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)] gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {lang === 'om' ? 'Ijaarsa...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {lang === 'om' ? 'Ijaarsa' : 'Generate'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'om' ? 'Qabiyyeesa' : 'Generated Outline'}</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedOutline ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    {lang === 'om' ? 'Mata Jechaa Akka Seeya' : 'Save As'}
                  </label>
                  <Input
                    placeholder={lang === 'om' ? 'Mata jechaa galmee' : 'Sermon title'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 font-serif">
                    {generatedOutline}
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  variant="default"
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  {lang === 'om' ? 'Akka Seeya Kaasi' : 'Save to Library'}
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p>{lang === 'om' ? 'Hangiraan asii mul\'ata' : 'Generated outline will appear here'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}