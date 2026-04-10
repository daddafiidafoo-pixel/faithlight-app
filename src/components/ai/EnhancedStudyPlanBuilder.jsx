import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedStudyPlanBuilder() {
  const { lang } = useI18n();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('7');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [dailyMinutes, setDailyMinutes] = useState([30]);
  const [learningStyle, setLearningStyle] = useState('visual');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [title, setTitle] = useState('');

  const difficulties = {
    beginner: lang === 'om' ? 'Jalqabaa' : 'Beginner',
    intermediate: lang === 'om' ? 'Giddugale' : 'Intermediate',
    advanced: lang === 'om' ? 'Olaanaa' : 'Advanced',
  };

  const learningStyles = {
    visual: lang === 'om' ? 'Argu' : 'Visual',
    auditory: lang === 'om' ? 'Walaloo' : 'Auditory',
    reading: lang === 'om' ? 'Dubbisuu' : 'Reading/Writing',
    kinesthetic: lang === 'om' ? 'Hojii' : 'Kinesthetic/Practice',
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error(lang === 'om' ? 'Mata jechaa barbaada' : 'Topic required');
      return;
    }

    setLoading(true);
    try {
      const prompt = `
        Generate a comprehensive Bible study plan with these specifications:
        - Topic: ${topic}
        - Duration: ${duration} days
        - Difficulty Level: ${difficulties[difficulty]}
        - Daily Study Time: ${dailyMinutes[0]} minutes
        - Learning Style: ${learningStyles[learningStyle]}
        - Language: ${lang === 'om' ? 'Oromo' : 'English'}
        
        The plan should include:
        1. Daily readings with specific Bible passages
        2. Reflection questions (${dailyMinutes[0]} minutes worth)
        3. Key verses to memorize
        4. Application activities
        5. Weekly review/discussion points
        6. Difficulty-appropriate commentary suggestions
        
        Format as a clear day-by-day breakdown.
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      setGeneratedPlan(result);
      toast.success(lang === 'om' ? 'Karoora lebam' : 'Study plan generated');
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Generation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !generatedPlan) {
      toast.error(lang === 'om' ? 'Mata jechaa fi qabiyyeesa barbaada' : 'Title and content required');
      return;
    }

    try {
      const user = await base44.auth.me();

      await base44.entities.SavedAIOutput.create({
        user_id: user.id,
        output_type: 'study_plan',
        title,
        content: generatedPlan,
        metadata: {
          topic,
          duration,
          difficulty,
          dailyMinutes: dailyMinutes[0],
          learningStyle,
        },
        is_template: false,
      });

      toast.success(lang === 'om' ? 'Akka seeya galame' : 'Saved to library');
      setTitle('');
      setGeneratedPlan(null);
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[var(--faith-light-primary-dark)]">
          {lang === 'om' ? 'Ijaarsa Karoora AI Pro' : 'AI Study Plan Builder Pro'}
        </h2>
        <p className="text-gray-600 mt-2">
          {lang === 'om'
            ? 'Karoora barumsa keessan ta\'uun ilaalchifte'
            : 'Create personalized study plans tailored to your needs'}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'om' ? 'Filannoo' : 'Settings'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Mata Jechaa' : 'Study Topic'}
              </label>
              <Input
                placeholder={lang === 'om' ? 'e.g., Waanti kaa keessa' : 'e.g., Book of Romans'}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? `Guyyaa (${duration})` : `Duration (${duration} days)`}
              </label>
              <Slider
                value={[parseInt(duration)]}
                onValueChange={(val) => setDuration(val[0].toString())}
                min={3}
                max={90}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>3 {lang === 'om' ? 'guyyaa' : 'days'}</span>
                <span>90 {lang === 'om' ? 'guyyaa' : 'days'}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Sadarkaa Raskoo' : 'Difficulty Level'}
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(difficulties).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om'
                  ? `Yeroo Guyyaa (${dailyMinutes[0]} daqiqa)`
                  : `Daily Study Time (${dailyMinutes[0]} minutes)`}
              </label>
              <Slider
                value={dailyMinutes}
                onValueChange={setDailyMinutes}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>10 {lang === 'om' ? 'daqiqa' : 'min'}</span>
                <span>120 {lang === 'om' ? 'daqiqa' : 'min'}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                {lang === 'om' ? 'Karaa Barumsa' : 'Learning Style'}
              </label>
              <Select value={learningStyle} onValueChange={setLearningStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(learningStyles).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
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
            <CardTitle>{lang === 'om' ? 'Karoora' : 'Study Plan'}</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedPlan ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    {lang === 'om' ? 'Mata Jechaa Akka Seeya' : 'Save As'}
                  </label>
                  <Input
                    placeholder={lang === 'om' ? 'Mata jechaa galmee' : 'Plan title'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 font-serif">
                    {generatedPlan}
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
                <p>{lang === 'om' ? 'Karooran asii mul\'ata' : 'Your study plan will appear here'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}