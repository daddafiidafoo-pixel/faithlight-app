import React, { useState } from 'react';
import { Sparkles, X, Loader2, BookOpen, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const EXAMPLE_GOALS = [
  'Read through Psalms in 30 days',
  'Learn about forgiveness',
  'Study the life of Jesus in 14 days',
  'Understand faith and trust',
  'Go through the Sermon on the Mount',
  'Study Paul\'s letters in 3 weeks',
];

export default function AIStudyPlannerModal({ onClose, onPlanCreated }) {
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const generatePlan = async () => {
    if (!goal.trim()) { toast.error('Please enter a goal'); return; }
    setGenerating(true);
    setPreview(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Bible study planner. Generate a ${days}-day reading plan for this goal: "${goal}".

Return a JSON object with this exact structure:
{
  "title": "Plan title",
  "description": "1-2 sentence description",
  "theme": "Core theme/topic",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "readings": ["Book Chapter:VerseStart-VerseEnd", "Book Chapter"],
      "focus": "What to focus on today (1 sentence)"
    }
  ]
}

Rules:
- Exactly ${days} day entries
- Use real Bible book names and valid chapter/verse references
- Keep readings achievable (1-3 per day)
- Make the plan coherent and progressive
- readings array items should be strings like "John 3", "Psalm 23", "Romans 8:1-17"`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            theme: { type: 'string' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  title: { type: 'string' },
                  readings: { type: 'array', items: { type: 'string' } },
                  focus: { type: 'string' },
                }
              }
            }
          }
        }
      });
      setPreview(res);
    } catch (e) {
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const savePlan = () => {
    if (!preview) return;
    const planData = {
      id: `plan_${Date.now()}`,
      ...preview,
      goal,
      totalDays: days,
      currentDay: 1,
      completedDays: [],
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('fl_study_plans') || '[]');
    existing.unshift(planData);
    localStorage.setItem('fl_study_plans', JSON.stringify(existing));
    toast.success('Study plan saved!');
    onPlanCreated?.(planData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="font-bold text-gray-900">AI Study Planner</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Goal Input */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Your Study Goal</label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Learn about forgiveness, Read through Psalms in 30 days..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-20"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {EXAMPLE_GOALS.map(eg => (
                <button
                  key={eg}
                  onClick={() => setGoal(eg)}
                  className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full hover:bg-indigo-100"
                >
                  {eg}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Duration: {days} days</label>
            <input
              type="range" min={7} max={90} step={7}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>7 days</span><span>30 days</span><span>60 days</span><span>90 days</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePlan}
            disabled={generating || !goal.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating your plan…</> : <><Sparkles size={16} /> Generate Plan</>}
          </button>

          {/* Preview */}
          {preview && (
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">{preview.title}</h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">{preview.description}</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {preview.days?.slice(0, 7).map(d => (
                  <div key={d.day} className="bg-white rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">Day {d.day}</span>
                      <span className="text-xs font-semibold text-gray-800">{d.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {d.readings?.map((r, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <BookOpen size={10} />{r}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 italic">{d.focus}</p>
                  </div>
                ))}
                {preview.days?.length > 7 && (
                  <p className="text-xs text-center text-gray-400">+ {preview.days.length - 7} more days after saving…</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {preview && (
          <div className="p-5 border-t border-gray-100">
            <button
              onClick={savePlan}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold"
            >
              Save This Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}