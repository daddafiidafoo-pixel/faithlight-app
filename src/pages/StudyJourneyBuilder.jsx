import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.22, delay: i * 0.06 } }),
};

const SPIRITUAL_GOALS = [
  'Overcoming Anxiety',
  'Building Faith',
  'Finding Peace',
  'Deepening Prayer Life',
  'Understanding Grace',
  'Healing from Grief',
  'Strengthening Relationships',
  'Growing in Patience',
];

export default function StudyJourneyBuilder() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [duration, setDuration] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch {
        // handle silently
      }
    };
    checkAuth();
  }, []);

  const handleGenerate = async () => {
    if (!selectedGoal || !duration || !user?.id) {
      setError('Please select a goal and duration');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call AI to generate study plan
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized ${duration}-day Bible study journey for someone with the spiritual goal: "${selectedGoal}".

For each day (${duration} total), provide:
1. A specific Bible verse reference
2. 1-2 sentences of the verse text (paraphrased)
3. A reflection question to deepen understanding
4. A brief AI insight about the verse (2-3 sentences)
5. A prayer prompt related to the day's focus

Format as JSON with structure:
{
  "days": [
    {
      "dayNumber": 1,
      "reference": "John 3:16",
      "verseText": "...",
      "reflectionQuestion": "...",
      "insight": "...",
      "prayerPrompt": "..."
    }
  ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  dayNumber: { type: 'number' },
                  reference: { type: 'string' },
                  verseText: { type: 'string' },
                  reflectionQuestion: { type: 'string' },
                  insight: { type: 'string' },
                  prayerPrompt: { type: 'string' },
                },
              },
            },
          },
        },
      });

      // Save journey to database
      const journey = await base44.entities.StudyJourneys.create({
        userId: user.id,
        spiritualGoal: selectedGoal,
        duration,
        language: 'en',
        days: response.days || [],
        startDate: new Date().toISOString(),
        completedDays: 0,
        isActive: true,
      });

      // Navigate to journey detail
      navigate(`/StudyJourneyDetail?id=${journey.id}`);
    } catch (err) {
      setError('Failed to generate journey. Please try again.');
      console.error('Journey generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-4">
            <Sparkles size={40} className="text-indigo-600" />
            Study Journey
          </h1>
          <p className="text-gray-600 text-lg">
            Create a personalized Bible study plan for your spiritual growth
          </p>
        </motion.div>

        {!user ? (
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg p-8 shadow-lg text-center"
          >
            <p className="text-gray-600 mb-4">
              Sign in to create your personalized study journey
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Goal Selection */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                What's your spiritual goal?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SPIRITUAL_GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedGoal === goal
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                        : 'bg-white border-gray-200 text-gray-900 hover:border-indigo-300'
                    }`}
                  >
                    <p className="font-medium">{goal}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Duration Selection */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                How many days? ({duration} days)
              </label>
              <input
                type="range"
                min="7"
                max="14"
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>7 days (Quick)</span>
                <span>14 days (Deep)</span>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Generate Button */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedGoal}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Generating Your Journey...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate My Journey
                  </>
                )}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}