import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';

const FOCUS_AREAS = [
  { id: 'general', label: 'General Bible Study', icon: '📖' },
  { id: 'topical', label: 'Topical Study', icon: '🎯' },
  { id: 'book', label: 'Book Study', icon: '📚' },
  { id: 'challenges', label: 'Life Challenges', icon: '💪' },
  { id: 'theology', label: 'Theological Deep Dive', icon: '🔍' },
  { id: 'spiritual_growth', label: 'Spiritual Growth', icon: '🌱' },
];

export default function StudyPathGenerator({ onPlanGenerated }) {
  const [topic, setTopic] = useState('');
  const [focusArea, setFocusArea] = useState('general');
  const [duration, setDuration] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or focus area');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('generateStudyPath', {
        topic: topic.trim(),
        duration_days: duration,
        focus_area: focusArea
      });

      if (response.data?.success && response.data?.study_plan) {
        onPlanGenerated(response.data.study_plan);
      } else {
        setError('Failed to generate study plan. Please try again.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('An error occurred while generating your study plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <CardTitle>AI Study Path Generator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Focus Area Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            What would you like to study?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FOCUS_AREAS.map((area) => (
              <button
                key={area.id}
                onClick={() => setFocusArea(area.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  focusArea === area.id
                    ? 'border-indigo-600 bg-indigo-100 text-indigo-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                }`}
              >
                <div className="text-lg mb-1">{area.icon}</div>
                <div className="text-xs font-medium">{area.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Specific Topic or Challenge
          </label>
          <Input
            placeholder={
              focusArea === 'challenges'
                ? 'e.g., Finding peace in anxiety, managing finances biblically...'
                : focusArea === 'book'
                ? 'e.g., Gospel of John, Book of Psalms...'
                : 'e.g., Faith, Love, Forgiveness, Spiritual Gifts...'
            }
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-white"
            disabled={isLoading}
          />
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Study Plan Duration
          </label>
          <div className="flex gap-2 flex-wrap">
            {[3, 5, 7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDuration(days)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                  duration === days
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                }`}
                disabled={isLoading}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating your personalized study plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Study Plan
            </>
          )}
        </Button>

        {/* Info Text */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-semibold text-blue-900 mb-1">✨ What you'll get:</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>✓ Daily Scripture readings with commentary</li>
            <li>✓ Thoughtful reflection questions</li>
            <li>✓ Practical, actionable insights for daily life</li>
            <li>✓ Structured progression over multiple days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}