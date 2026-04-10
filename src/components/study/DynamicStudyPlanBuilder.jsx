import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader, Sparkles, AlertCircle } from 'lucide-react';
import { useI18n } from '../I18nProvider';

export default function DynamicStudyPlanBuilder() {
  const { lang } = useI18n();
  const [step, setStep] = useState('config'); // config, generating, preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const [config, setConfig] = useState({
    duration_days: 30,
    daily_minutes: 45,
    difficulty: 'intermediate',
    focus_areas: [],
  });

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const focusOptions = [
    { label: lang === 'om' ? 'Seera' : 'Law', value: 'law' },
    { label: lang === 'om' ? 'Waaqeffannaa' : 'Gospels', value: 'gospels' },
    { label: lang === 'om' ? 'Kabala' : 'Epistles', value: 'epistles' },
    { label: lang === 'om' ? 'Falmiin' : 'Prophecy', value: 'prophecy' },
    { label: lang === 'om' ? 'Haadha' : 'History', value: 'history' },
  ];

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    setStep('generating');

    try {
      const response = await base44.functions.invoke('generateOromoStudyPlan', config);
      setGeneratedPlan(response.data);
      setStep('preview');
    } catch (err) {
      setError(err.message);
      setStep('config');
    } finally {
      setLoading(false);
    }
  };

  const toggleFocus = (value) => {
    setConfig((prev) => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(value)
        ? prev.focus_areas.filter((f) => f !== value)
        : [...prev.focus_areas, value],
    }));
  };

  // Configuration Step
  if (step === 'config') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--faith-light-accent)]" />
            {lang === 'om'
              ? 'Barnoota AI Jidha'
              : 'AI-Powered Study Plan'}
          </CardTitle>
          <CardDescription>
            {lang === 'om'
              ? 'Barnoota kee ijaaraa'
              : 'Create a personalized study plan'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'om' ? 'Guyyaa' : 'Duration (days)'}
            </label>
            <Input
              type="number"
              min="7"
              max="365"
              value={config.duration_days}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  duration_days: parseInt(e.target.value),
                }))
              }
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'om'
                ? 'Guyyaa 7 hanga 365 filadhaa'
                : 'Choose between 7 and 365 days'}
            </p>
          </div>

          {/* Daily Minutes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'om' ? 'Minits Guyyaa' : 'Daily study time (minutes)'}
            </label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((min) => (
                <Button
                  key={min}
                  variant={config.daily_minutes === min ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      daily_minutes: min,
                    }))
                  }
                >
                  {min}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'om' ? 'Sadarkaa' : 'Difficulty Level'}
            </label>
            <div className="flex gap-2">
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  variant={
                    config.difficulty === diff ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      difficulty: diff,
                    }))
                  }
                  className="capitalize"
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'om' ? 'Xumura' : 'Focus Areas'} (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {focusOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    config.focus_areas.includes(option.value)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => toggleFocus(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            onClick={generatePlan}
            disabled={loading}
            size="lg"
            className="w-full gap-2 bg-[var(--faith-light-primary)]"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {lang === 'om' ? 'Ijaaraa jira...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {lang === 'om' ? 'Ijaaraa' : 'Generate Plan'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Preview Step
  if (step === 'preview' && generatedPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{generatedPlan.title}</CardTitle>
          <CardDescription>{generatedPlan.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Plan Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-[var(--faith-light-primary)]">
                {generatedPlan.duration_days}
              </p>
              <p className="text-xs text-gray-600">
                {lang === 'om' ? 'Guyyaa' : 'Days'}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-green-600">
                {generatedPlan.daily_minutes}
              </p>
              <p className="text-xs text-gray-600">
                {lang === 'om' ? 'Minits' : 'Minutes'}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-blue-600">
                {generatedPlan.plan_items?.length || 0}
              </p>
              <p className="text-xs text-gray-600">
                {lang === 'om' ? 'Adag' : 'Items'}
              </p>
            </div>
          </div>

          {/* Sample Items */}
          {generatedPlan.plan_items && generatedPlan.plan_items.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {lang === 'om' ? 'Haala Jalqabaa' : 'Sample Schedule'}
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {generatedPlan.plan_items.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="text-sm p-2 bg-gray-50 rounded flex justify-between"
                  >
                    <span className="font-medium">
                      Day {item.day}: {item.book} {item.chapter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('config')}
              className="flex-1"
            >
              {lang === 'om' ? 'Deebi\'i' : 'Back'}
            </Button>
            <Button
              onClick={() => {
                // Save and redirect
                window.location.href = `/study-plans?plan_id=${generatedPlan.id}`;
              }}
              className="flex-1 bg-[var(--faith-light-primary)]"
            >
              {lang === 'om' ? 'Jalqaba' : 'Start Study'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}