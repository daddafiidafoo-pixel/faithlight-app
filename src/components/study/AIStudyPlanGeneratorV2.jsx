import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import { base44 } from '@/api/base44Client';

const GOAL_OPTIONS = [
  { id: 'complete_bible', label: 'Complete Bible Reading', days: 365 },
  { id: 'new_testament', label: 'New Testament Focus', days: 90 },
  { id: 'gospels', label: 'The Four Gospels', days: 30 },
  { id: 'wisdom', label: 'Wisdom & Proverbs', days: 42 },
  { id: 'devotional', label: 'Daily Devotional', days: 30 },
  { id: 'character', label: 'Biblical Characters', days: 60 },
];

const CHALLENGE_OPTIONS = [
  'anxiety',
  'grief',
  'faith',
  'leadership',
  'forgiveness',
  'identity',
  'purpose',
];

export default function AIStudyPlanGeneratorV2({ onPlanGenerated }) {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [customTopic, setCustomTopic] = useState('');
  const [planDays, setPlanDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `
        Create a structured Bible reading plan with the following specifications:
        
        Goal: ${selectedGoal ? GOAL_OPTIONS.find(g => g.id === selectedGoal)?.label : 'Custom'}
        Duration: ${planDays} days
        ${selectedChallenge ? `Life Challenge: ${selectedChallenge}` : ''}
        ${customTopic ? `Custom Topic: ${customTopic}` : ''}
        
        Return a JSON object with this structure:
        {
          "title": "Plan Title",
          "description": "Plan Description",
          "total_days": ${planDays},
          "passages": [
            {
              "day": 1,
              "passages": ["Genesis 1:1-31", "Psalm 1:1-6"],
              "title": "Creation & God's Word",
              "reflection": "Reflection question or thought for the day"
            }
          ],
          "theme": "${selectedChallenge || 'Spiritual Growth'}"
        }
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            total_days: { type: 'number' },
            passages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  passages: { type: 'array', items: { type: 'string' } },
                  title: { type: 'string' },
                  reflection: { type: 'string' },
                },
              },
            },
            theme: { type: 'string' },
          },
        },
      });

      setGeneratedPlan(response);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    try {
      const planData = {
        title: generatedPlan.title,
        description: generatedPlan.description,
        total_days: generatedPlan.total_days,
        passages: generatedPlan.passages,
        category: 'devotional',
        difficulty: 'intermediate',
        language_code: 'en',
      };

      await base44.entities.ReadingPlan.create(planData);
      onPlanGenerated?.(planData);
      setStep(4);
    } catch (err) {
      setError('Failed to save plan');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step 1: Goal Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              {t('study.selectGoal', 'Select Your Reading Goal')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedGoal === goal.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {goal.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {goal.days} days
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('study.customDays', 'Custom Duration (days)')}
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={planDays}
                onChange={(e) => setPlanDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white"
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedGoal}
              className="w-full"
            >
              {t('actions.next', 'Next')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Topic/Challenge Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('study.focusArea', 'Select Focus Area (Optional)')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                {t('study.lifeChallenge', 'Life Challenge or Topic')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CHALLENGE_OPTIONS.map((challenge) => (
                  <button
                    key={challenge}
                    onClick={() => setSelectedChallenge(selectedChallenge === challenge ? null : challenge)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedChallenge === challenge
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200'
                    }`}
                  >
                    {challenge}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('study.customTopic', 'Custom Topic (Optional)')}
              </label>
              <input
                type="text"
                placeholder="e.g., 'God's faithfulness in adversity'"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                {t('actions.back', 'Back')}
              </Button>
              <Button
                onClick={generatePlan}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {t('actions.generating', 'Generating...')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('actions.generatePlan', 'Generate Plan')}
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Plan Preview */}
      {step === 3 && generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedPlan.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {generatedPlan.description}
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">
                  {generatedPlan.total_days}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Days</p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {generatedPlan.passages?.length || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Readings</p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Badge variant="outline">{generatedPlan.theme}</Badge>
              </div>
            </div>

            {/* Sample Days */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('study.sampleDays', 'Sample Days')}
              </p>
              {generatedPlan.passages?.slice(0, 5).map((day) => (
                <div key={day.day} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    Day {day.day}: {day.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {day.passages.join(', ')}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                {t('actions.back', 'Back')}
              </Button>
              <Button onClick={savePlan} className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('actions.savePlan', 'Save Plan')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card className="border-2 border-green-400 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('study.planCreated', 'Plan Created Successfully!')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your personalized study plan is ready. Start reading today!
              </p>
              <Button className="w-full">
                {t('study.viewPlan', 'View Your Plan')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}