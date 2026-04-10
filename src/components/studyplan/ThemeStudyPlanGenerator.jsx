import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const THEMES = [
  { id: 'anxiety', label: 'Anxiety & Peace', emoji: '🕊️', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'hope', label: 'Hope & Faith', emoji: '🌅', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'forgiveness', label: 'Forgiveness', emoji: '💛', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { id: 'strength', label: 'Strength & Courage', emoji: '⚡', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'love', label: 'Love & Relationships', emoji: '❤️', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: 'prayer', label: 'Prayer & Worship', emoji: '🙏', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'wisdom', label: 'Wisdom & Guidance', emoji: '🦉', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'grief', label: 'Grief & Comfort', emoji: '🌧️', color: 'bg-slate-50 border-slate-200 text-slate-700' },
];

const DURATIONS = [7, 14, 21, 30];

export default function ThemeStudyPlanGenerator({ onPlanGenerated }) {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const generate = async () => {
    if (!selectedTheme) return;
    setLoading(true);
    setGenerated(null);
    try {
      const theme = THEMES.find(t => t.id === selectedTheme);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a ${duration}-day Bible reading plan focused on the theme of "${theme.label}". 
Return a structured plan with exactly ${duration} days. Each day should have a specific Bible passage/chapter.
Be specific (e.g. "Psalm 46", "Matthew 6:25-34", "Philippians 4:6-7").`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  reading: { type: 'string' },
                  focus: { type: 'string' },
                }
              }
            }
          }
        }
      });

      const planId = `ai-${selectedTheme}-${Date.now()}`;
      const plan = {
        id: planId,
        title: result.title || `${theme.label} — ${duration}-Day Plan`,
        cover: theme.emoji,
        description: result.description,
        chapters: result.days.map(d => d.reading),
        focuses: result.days.map(d => d.focus),
        totalDays: duration,
        theme: selectedTheme,
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('ai_study_plans') || '[]');
      existing.push(plan);
      localStorage.setItem('ai_study_plans', JSON.stringify(existing));

      setGenerated(plan);
      if (onPlanGenerated) onPlanGenerated(plan);
    } catch (e) {
      console.error('[ThemeStudyPlanGenerator] Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const startPlan = () => {
    if (!generated) return;
    navigate(`${createPageUrl('StudyPlanDetail')}?plan=${generated.id}`);
  };

  if (generated) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-200 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{generated.cover}</span>
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase">✨ Plan Generated!</p>
            <h3 className="text-base font-bold text-gray-900">{generated.title}</h3>
            <p className="text-sm text-gray-500">{generated.totalDays} days</p>
          </div>
        </div>
        {generated.description && (
          <p className="text-sm text-gray-600">{generated.description}</p>
        )}
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {generated.chapters.slice(0, 5).map((ch, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-xs font-bold text-indigo-500 w-12">Day {i + 1}</span>
              <span>{ch}</span>
            </div>
          ))}
          {generated.chapters.length > 5 && (
            <p className="text-xs text-gray-400 pl-14">+{generated.chapters.length - 5} more days</p>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setGenerated(null)} className="flex-1">
            Try Another
          </Button>
          <Button size="sm" onClick={startPlan} className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-1">
            Start Plan <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-bold text-gray-900">Generate a Theme-Based Plan</h3>
      </div>

      {/* Theme grid */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Choose a Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm font-medium ${
                selectedTheme === theme.id
                  ? theme.color + ' border-current shadow-sm'
                  : 'bg-gray-50 border-transparent text-gray-600 hover:border-gray-200'
              }`}
            >
              <span>{theme.emoji}</span>
              <span className="leading-tight text-xs">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Duration</p>
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                duration === d
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={generate}
        disabled={!selectedTheme || loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate Plan</>
        )}
      </Button>
    </div>
  );
}