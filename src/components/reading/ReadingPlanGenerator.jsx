import React, { useState } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const THEMES = [
  { id: 'hope', label: 'Hope', emoji: '🌅' },
  { id: 'anxiety', label: 'Anxiety Relief', emoji: '🕊️' },
  { id: 'peace', label: 'Peace', emoji: '☮️' },
  { id: 'faith', label: 'Faith', emoji: '✨' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { id: 'healing', label: 'Healing', emoji: '💚' },
];

export default function ReadingPlanGenerator({ onPlanCreated }) {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (!selectedTheme) {
      toast.error('Please select a theme');
      return;
    }

    try {
      setLoading(true);
      const response = await base44.functions.invoke('generateThemeReadingPlan', {
        theme: selectedTheme,
      });

      if (response.data?.plan) {
        toast.success('Reading plan created!');
        if (onPlanCreated) {
          onPlanCreated(response.data.plan);
        }
      }
    } catch (err) {
      console.error('Failed to generate plan:', err);
      toast.error('Could not generate reading plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Create a Reading Plan</h3>
      <p className="text-sm text-gray-600 mb-6">
        Choose a theme and we'll create a personalized 7-day Bible reading journey for you.
      </p>

      {/* Theme selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`min-h-[44px] min-w-[44px] px-3 py-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 ${
              selectedTheme === theme.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-indigo-200'
            }`}
            aria-pressed={selectedTheme === theme.id}
          >
            <span className="text-2xl">{theme.emoji}</span>
            <span className="text-sm font-medium">{theme.label}</span>
          </button>
        ))}
      </div>

      {/* Action button */}
      <button
        onClick={handleGeneratePlan}
        disabled={!selectedTheme || loading}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating Plan...
          </>
        ) : (
          <>
            Create My Plan
            <ChevronRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}