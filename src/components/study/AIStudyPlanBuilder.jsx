import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, BookOpen, Calendar } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

export default function AIStudyPlanBuilder() {
  const { t } = useI18n();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(7);
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setPlan(null);

    try {
      const response = await base44.functions.invoke('generateAIStudyPlan', {
        topic,
        duration: parseInt(duration),
        spiritual_goals: goals.split(',').map(g => g.trim()).filter(Boolean)
      });

      if (response.data?.success) {
        setPlan(response.data.plan);
        setProgress(0);
      } else {
        alert('Failed to generate plan: ' + (response.data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Plan generation failed:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (dayCompleted) => {
    if (!plan?.id) return;

    try {
      await base44.entities.BibleStudyPlan.update(plan.id, {
        days_completed: dayCompleted,
        status: dayCompleted >= plan.duration ? 'completed' : 'active'
      });

      setProgress(dayCompleted);
    } catch (error) {
      console.error('Progress update failed:', error);
    }
  };

  if (plan) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-2xl font-bold text-blue-900">{plan.title}</h2>
          <p className="text-blue-700 mt-1">{plan.description}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {duration} days
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {plan.title}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>Progress</span>
            <span>{progress} / {plan.duration} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(progress / plan.duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Daily structure */}
        <div className="space-y-3">
          {plan.days?.map((day) => (
            <div key={day.day} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    Day {day.day}: {day.theme}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{day.daily_focus}</p>
                  <div className="mt-2 space-y-1">
                    {day.passages?.map((p, idx) => (
                      <div key={idx} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        {p.book} {p.chapter}:{p.verse_start}-{p.verse_end}
                      </div>
                    ))}
                  </div>
                  {day.reflection_question && (
                    <p className="text-sm text-blue-600 mt-2 italic">
                      💭 {day.reflection_question}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => updateProgress(day.day)}
                  variant={progress >= day.day ? 'default' : 'outline'}
                  size="sm"
                >
                  {progress >= day.day ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    'Mark done'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setPlan(null)}
          variant="outline"
          className="w-full mt-6"
        >
          Back to Generator
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bible Study Plan Generator</h1>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Topic / Theme</label>
          <Input
            placeholder="e.g., Faith, Prayer, Forgiveness, Leadership..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duration</label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={duration === 7 ? 'default' : 'outline'}
              onClick={() => setDuration(7)}
              className="flex-1"
            >
              7 Days
            </Button>
            <Button
              type="button"
              variant={duration === 30 ? 'default' : 'outline'}
              onClick={() => setDuration(30)}
              className="flex-1"
            >
              30 Days
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Spiritual Goals (optional)</label>
          <Input
            placeholder="e.g., Deepen faith, Build prayer habit, Learn discipleship"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            type="text"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple goals with commas</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Generate Study Plan
        </Button>
      </form>
    </div>
  );
}