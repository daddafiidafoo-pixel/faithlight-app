import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader, BookOpen, Check, AlertCircle } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const TOPICS = [
  'Anxiety',
  'Gratitude',
  'Forgiveness',
  'Faith in Crisis',
  'Building Confidence',
  'Loving Others',
  'Finding Purpose',
  'Overcoming Fear',
  'Peace & Contentment',
  'Healing & Hope',
];

export default function CustomStudyPlanBuilder() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    const topic = customTopic.trim() || selectedTopic;
    if (!topic) {
      setError('Please select or enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('generateStudyPlan', {
        topic,
        language: lang,
      });

      setGeneratedPlan(response);
    } catch (err) {
      console.error('Plan generation error:', err);
      setError(err.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan?.plan_id) return;
    
    try {
      const user = await base44.auth.me();
      if (user?.notification_frequency) {
        await base44.auth.updateMe({
          active_study_plan_id: generatedPlan.plan_id,
        });
      }
      navigate(createPageUrl('SpiritualGrowthDashboard'));
    } catch (err) {
      console.error('Error saving plan:', err);
    }
  };

  if (generatedPlan) {
    return (
      <div className="max-w-3xl mx-auto p-6 pb-20 space-y-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Study Plan Generated!</h1>
          </div>
          <p className="text-gray-700">
            Your personalized 7-day study plan on "<strong>{generatedPlan.days?.[0]?.reference ? 'Custom Plan' : selectedTopic}</strong>" is ready.
          </p>
        </div>

        {/* Plan Preview */}
        <div className="space-y-4">
          {generatedPlan.days?.map((day, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Day {day.dayNumber}</h3>
                  <p className="text-lg text-indigo-700 font-medium">{day.reference}</p>
                </div>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {day.dayNumber}/7
                </span>
              </div>
              <p className="text-gray-700 mb-3"><strong>Reflection:</strong> {day.reflection_question}</p>
              <p className="text-gray-600 text-sm"><strong>Insight:</strong> {day.key_insight}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleSavePlan}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Check className="w-4 h-4" />
            Activate Study Plan
          </Button>
          <Button
            onClick={() => setGeneratedPlan(null)}
            variant="outline"
            className="gap-2"
          >
            Create Different Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-20 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Custom Study Plan Builder
        </h1>
        <p className="text-gray-600 mt-2">Create a personalized 7-day study plan on any spiritual topic</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Topic Selection */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a Topic</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopic('');
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  selectedTopic === topic
                    ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-indigo-400'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Topic */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Or Enter Your Own Topic</h3>
          <Textarea
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              setSelectedTopic('');
            }}
            placeholder="E.g., 'Learning to pray effectively', 'Understanding God's grace'..."
            className="w-full"
            rows={2}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={loading || (!selectedTopic && !customTopic.trim())}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 h-auto text-lg font-semibold gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Your Plan...
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" />
              Generate 7-Day Plan
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Your plan will include daily Bible passages, reflection questions, and spiritual insights tailored to your topic.
        </p>
      </div>
    </div>
  );
}