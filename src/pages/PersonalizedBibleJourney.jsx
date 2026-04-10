import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ChevronRight, Save, X } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const SPIRITUAL_GOALS = [
  { id: 'anxiety', label: 'Overcome Anxiety' },
  { id: 'faith', label: 'Deepen My Faith' },
  { id: 'forgiveness', label: 'Learn Forgiveness' },
  { id: 'grief', label: 'Process Grief' },
  { id: 'strength', label: 'Find Strength' },
  { id: 'purpose', label: 'Discover Purpose' },
  { id: 'prayer', label: 'Develop Prayer Life' },
  { id: 'love', label: 'Understanding God\'s Love' },
];

const DAILY_COMMITMENTS = [
  { minutes: 10, label: '10 minutes' },
  { minutes: 15, label: '15 minutes' },
  { minutes: 20, label: '20 minutes' },
  { minutes: 30, label: '30 minutes' },
];

export default function PersonalizedBibleJourney() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select', 'generating', 'preview', 'saved'
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateJourney = async () => {
    if (!selectedGoal) return;

    setStep('generating');
    setLoading(true);

    try {
      const goalLabel = SPIRITUAL_GOALS.find(g => g.id === selectedGoal)?.label || selectedGoal;
      
      const response = await base44.functions.invoke('generatePersonalizedBibleJourney', {
        goal: goalLabel,
        daysCount: selectedDays,
        dailyMinutes: selectedMinutes,
        userLanguage: lang,
      });

      setJourney(response.data.journey);
      setStep('preview');
    } catch (err) {
      console.error('Error generating journey:', err);
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {t('journey.title', 'Personalized Bible Journey')}
              </h1>
            </div>
            <p className="text-gray-600">
              {t('journey.desc', 'Create a custom 7-14 day Scripture journey tailored to your spiritual goals')}
            </p>
          </div>

          <Card className="shadow-lg border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>1. {t('journey.selectGoal', 'Choose Your Spiritual Goal')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPIRITUAL_GOALS.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedGoal === goal.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{goal.label}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-purple-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>2. {t('journey.selectDuration', 'How Many Days?')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="7"
                  max="14"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-purple-600 min-w-fit">{selectedDays} days</span>
              </div>
              <p className="text-sm text-gray-600">
                {t('journey.durationDesc', 'Longer journeys allow deeper exploration of your topic')}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-purple-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>3. {t('journey.selectCommitment', 'Daily Time Commitment')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DAILY_COMMITMENTS.map(commitment => (
                  <button
                    key={commitment.minutes}
                    onClick={() => setSelectedMinutes(commitment.minutes)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedMinutes === commitment.minutes
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{commitment.label}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerateJourney}
            disabled={!selectedGoal || loading}
            className="w-full mt-8 bg-purple-600 hover:bg-purple-700 py-6 text-base gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('journey.generating', 'Creating Your Journey...')}
              </>
            ) : (
              <>
                {t('journey.generate', 'Generate My Journey')}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
        <Card className="shadow-xl max-w-md w-full border-purple-200">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">
              {t('journey.creating', 'Creating Your Personal Journey...')}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('journey.creatingDesc', 'We\'re generating daily Scripture, reflections, and prayers tailored to you.')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'preview' && journey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{journey.title}</h1>
              <p className="text-gray-600 mt-1">
                {selectedMinutes} {t('journey.minutesPerDay', 'minutes per day')}
              </p>
            </div>
            <button
              onClick={() => setStep('select')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <Card className="shadow-lg border-purple-200 mb-6">
            <CardContent className="pt-6 pb-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                  {journey.content}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => setStep('select')}
              variant="outline"
              className="flex-1"
            >
              {t('common.back', 'Back')}
            </Button>
            <Button
              onClick={() => setStep('saved')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
            >
              <Save className="w-4 h-4" />
              {t('journey.saveJourney', 'Save Journey')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'saved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
        <Card className="shadow-xl max-w-md w-full border-purple-200">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="flex justify-center">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('journey.saved', 'Journey Saved!')}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('journey.savedDesc', 'Your personalized Bible journey is ready. Start reading and reflecting today.')}
              </p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {t('common.backHome', 'Back to Home')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}