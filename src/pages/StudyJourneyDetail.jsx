import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../components/I18nProvider';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.22, delay: i * 0.06 } }),
};

export default function StudyJourneyDetail() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const journeyId = searchParams.get('id');

  const [journey, setJourney] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJourney();
  }, [journeyId]);

  const loadJourney = async () => {
    if (!journeyId) return;
    try {
      const j = await base44.entities.StudyJourneys.read(journeyId);
      setJourney(j);
      setCurrentDay(j.completedDays ? j.completedDays + 1 : 1);
      setCompletedDays(new Set(Array.from({ length: j.completedDays }, (_, i) => i + 1)));
    } catch (err) {
      console.error('Failed to load journey:', err);
    } finally {
      setLoading(false);
    }
  };

  const markDayComplete = async () => {
    if (!journey || completedDays.has(currentDay)) return;

    const newCompleted = new Set(completedDays);
    newCompleted.add(currentDay);

    try {
      await base44.entities.StudyJourneys.update(journey.id, {
        completedDays: newCompleted.size,
      });
      setCompletedDays(newCompleted);
      if (currentDay < journey.duration) {
        setCurrentDay(currentDay + 1);
      }
    } catch (err) {
      console.error('Failed to mark day complete:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading journey...</p>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Journey not found</p>
      </div>
    );
  }

  const day = journey.days.find((d) => d.dayNumber === currentDay);
  const progress = (completedDays.size / journey.duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {journey.spiritualGoal}
          </h1>
          <p className="text-gray-600">
            Day {currentDay} of {journey.duration}
          </p>

          {/* Progress Bar */}
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-indigo-600">
                {completedDays.size} / {journey.duration} days
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Daily Content */}
        {day && (
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            {/* Verse Reference */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">{day.reference}</h2>
              </div>
              <p className="text-gray-700 text-lg italic leading-relaxed">
                {day.verseText}
              </p>
            </div>

            {/* Insight */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
              <h3 className="font-semibold text-gray-900 mb-2">Today's Insight</h3>
              <p className="text-gray-700 leading-relaxed">{day.insight}</p>
            </div>

            {/* Reflection Question */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
              <h3 className="font-semibold text-gray-900 mb-2">Reflection</h3>
              <p className="text-gray-700 leading-relaxed">{day.reflectionQuestion}</p>
            </div>

            {/* Prayer Prompt */}
            <div className="mb-8 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600">
              <h3 className="font-semibold text-gray-900 mb-2">Prayer Prompt</h3>
              <p className="text-gray-700 leading-relaxed">{day.prayerPrompt}</p>
            </div>

            {/* Mark Complete Button */}
            {!completedDays.has(currentDay) ? (
              <Button
                onClick={markDayComplete}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 gap-2"
              >
                <CheckCircle2 size={20} />
                Mark Day {currentDay} Complete
              </Button>
            ) : (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">Day {currentDay} Complete!</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex gap-4 justify-between"
        >
          <Button
            variant="outline"
            onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
            disabled={currentDay === 1}
            className="gap-2"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>

          <div className="text-center text-sm text-gray-600">
            {completedDays.size === journey.duration ? (
              <p className="font-semibold text-green-600">
                🎉 Journey Complete! Keep growing in faith.
              </p>
            ) : (
              <p>{journey.duration - completedDays.size} days remaining</p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentDay(Math.min(journey.duration, currentDay + 1))}
            disabled={currentDay === journey.duration}
            className="gap-2"
          >
            Next
            <ChevronRight size={18} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}