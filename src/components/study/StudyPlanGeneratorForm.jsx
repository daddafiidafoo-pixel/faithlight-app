import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { useI18n } from '../I18nProvider';

/**
 * StudyPlanGeneratorForm
 * 
 * Form for generating customized study plans with caching.
 * - Duration, difficulty, minutes/day
 * - Optional: topic, goal
 * - Generates plan via backend function
 */
export default function StudyPlanGeneratorForm({
  onPlanGenerated, // (planJson, cacheId) => void
  loading = false,
}) {
  const { lang, t } = useI18n();
  const [duration, setDuration] = useState('7');
  const [durationCustom, setDurationCustom] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [minutesPerDay, setMinutesPerDay] = useState('10');
  const [minutesCustom, setMinutesCustom] = useState('');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('Growth');
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const finalDuration = duration === 'custom' ? parseInt(durationCustom) || 7 : parseInt(duration);
  const finalMinutes = minutesPerDay === 'custom' ? parseInt(minutesCustom) || 10 : parseInt(minutesPerDay);

  const handleGenerate = async () => {
    if (!finalDuration || !finalMinutes) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await base44.functions.invoke('generateStudyPlan', {
        language_code: lang,
        duration_days: finalDuration,
        difficulty,
        minutes_per_day: finalMinutes,
        topic_or_book: topic || 'Bible Study',
        goal,
      });

      if (response.data && response.data.plan_json) {
        onPlanGenerated(response.data.plan_json, response.data.cache_id);
      } else {
        setError(response.data?.error || 'Failed to generate plan.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t('study.generate.title', 'Generate Study Plan')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t('study.duration', 'Plan Duration')}
          </label>
          <div className="flex gap-2">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {duration === 'custom' && (
              <Input
                type="number"
                min="1"
                max="365"
                value={durationCustom}
                onChange={(e) => setDurationCustom(e.target.value)}
                placeholder="Days"
                className="w-20"
              />
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t('study.difficulty', 'Difficulty')}
          </label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{t('study.beginner', 'Beginner')}</SelectItem>
              <SelectItem value="intermediate">{t('study.intermediate', 'Intermediate')}</SelectItem>
              <SelectItem value="advanced">{t('study.advanced', 'Advanced')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minutes per day */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t('study.minutesPerDay', 'Minutes per Day')}
          </label>
          <div className="flex gap-2">
            <Select value={minutesPerDay} onValueChange={setMinutesPerDay}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="10">10 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="20">20 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {minutesPerDay === 'custom' && (
              <Input
                type="number"
                min="1"
                max="240"
                value={minutesCustom}
                onChange={(e) => setMinutesCustom(e.target.value)}
                placeholder="Minutes"
                className="w-20"
              />
            )}
          </div>
        </div>

        {/* Topic (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t('study.topic', 'Topic or Book (optional)')}
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('study.topicPlaceholder', 'e.g., Prayer, John, Faith')}
            className="text-sm"
          />
        </div>

        {/* Goal (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t('study.goal', 'Goal (optional)')}
          </label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Growth">Growth</SelectItem>
              <SelectItem value="Prayer">Prayer</SelectItem>
              <SelectItem value="Doctrine">Doctrine</SelectItem>
              <SelectItem value="Faith">Faith</SelectItem>
              <SelectItem value="Leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || loading}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('common.loading', 'Generating...')}
            </>
          ) : (
            t('study.generate', 'Generate Plan')
          )}
        </Button>
      </CardContent>
    </Card>
  );
}