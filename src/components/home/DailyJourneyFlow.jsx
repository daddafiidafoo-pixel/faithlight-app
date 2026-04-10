import React, { useState } from 'react';
import { BookOpen, Heart, Flame, CheckCircle2, Circle } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function DailyJourneyFlow({ user, isAuthenticated, verse }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      id: 'read',
      icon: BookOpen,
      label: t('journey.steps.read', 'Read the Verse'),
      action: null, // auto-unlocked
    },
    {
      id: 'reflect',
      icon: Heart,
      label: t('journey.steps.reflect', 'Reflect'),
      action: () => navigate(createPageUrl('MyJournal')),
    },
    {
      id: 'pray',
      icon: Flame,
      label: t('journey.steps.pray', 'Pray'),
      action: () => navigate(createPageUrl('PrayerWall')),
    },
    {
      id: 'quiz',
      icon: CheckCircle2,
      label: t('journey.steps.quiz', 'Test Your Understanding'),
      action: () => navigate(createPageUrl('DailyBibleQuiz')),
    },
  ];

  const handleStepClick = (step) => {
    if (!isAuthenticated) {
      // Unlock step for unauthenticated users
      if (!completedSteps.includes(step.id)) {
        setCompletedSteps([...completedSteps, step.id]);
      }
      if (step.action) step.action();
    } else {
      // For authenticated users, just navigate/mark complete
      if (step.action) {
        step.action();
      } else {
        setCompletedSteps([...completedSteps, step.id]);
      }
    }
  };

  const progressPercent = (completedSteps.length / steps.length) * 100;

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">✨</span>
        <h3 className="font-bold text-gray-900">{t('journey.title', "Today's Spiritual Journey")}</h3>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600 font-medium">{t('journey.progress', 'Progress')}</span>
          <span className="text-gray-500">{completedSteps.length}/{steps.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isUnlocked = idx === 0 || completedSteps.includes(steps[idx - 1].id);

          return (
            <button
              key={step.id}
              onClick={() => isUnlocked && handleStepClick(step)}
              disabled={!isUnlocked}
              className="w-full p-3 rounded-2xl border transition-all flex items-center gap-3"
              style={{
                backgroundColor: isCompleted ? '#dbeafe' : isUnlocked ? '#ffffff' : '#f3f4f6',
                borderColor: isCompleted ? '#3b82f6' : isUnlocked ? '#e5e7eb' : '#d1d5db',
                opacity: isUnlocked ? 1 : 0.6,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span
                className="text-sm font-semibold flex-1 text-left"
                style={{ color: isCompleted ? '#1e40af' : '#374151' }}
              >
                {step.label}
              </span>
              {isUnlocked && <span className="text-lg">→</span>}
            </button>
          );
        })}
      </div>

      {/* Completion celebration */}
      {completedSteps.length === steps.length && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 text-center">
          <p className="text-sm font-bold text-green-800">
            🎉 {t('journey.complete', "Well done! You've grown in faith today.")}
          </p>
        </div>
      )}
    </div>
  );
}