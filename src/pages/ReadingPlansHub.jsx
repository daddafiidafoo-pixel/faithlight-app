import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, ChevronRight, Star, Calendar, RefreshCw } from 'lucide-react';

// Built-in structured reading plans
const PLANS = [
  {
    id: 'nt-30',
    title: 'New Testament in 30 Days',
    description: 'Read through the entire New Testament in one month.',
    icon: '📖',
    days: 30,
    color: '#6366F1',
    colorBg: '#EEF2FF',
    readings: [
      { day: 1, ref: 'Matthew 1-4', book: 'MAT', chapters: [1,2,3,4] },
      { day: 2, ref: 'Matthew 5-7', book: 'MAT', chapters: [5,6,7] },
      { day: 3, ref: 'Matthew 8-11', book: 'MAT', chapters: [8,9,10,11] },
      { day: 4, ref: 'Matthew 12-15', book: 'MAT', chapters: [12,13,14,15] },
      { day: 5, ref: 'Matthew 16-19', book: 'MAT', chapters: [16,17,18,19] },
      { day: 6, ref: 'Matthew 20-22', book: 'MAT', chapters: [20,21,22] },
      { day: 7, ref: 'Matthew 23-25', book: 'MAT', chapters: [23,24,25] },
      { day: 8, ref: 'Matthew 26-28', book: 'MAT', chapters: [26,27,28] },
      { day: 9, ref: 'Mark 1-4', book: 'MRK', chapters: [1,2,3,4] },
      { day: 10, ref: 'Mark 5-8', book: 'MRK', chapters: [5,6,7,8] },
      { day: 11, ref: 'Mark 9-12', book: 'MRK', chapters: [9,10,11,12] },
      { day: 12, ref: 'Mark 13-16', book: 'MRK', chapters: [13,14,15,16] },
      { day: 13, ref: 'Luke 1-3', book: 'LUK', chapters: [1,2,3] },
      { day: 14, ref: 'Luke 4-6', book: 'LUK', chapters: [4,5,6] },
      { day: 15, ref: 'Luke 7-9', book: 'LUK', chapters: [7,8,9] },
      { day: 16, ref: 'Luke 10-13', book: 'LUK', chapters: [10,11,12,13] },
      { day: 17, ref: 'Luke 14-17', book: 'LUK', chapters: [14,15,16,17] },
      { day: 18, ref: 'Luke 18-21', book: 'LUK', chapters: [18,19,20,21] },
      { day: 19, ref: 'Luke 22-24', book: 'LUK', chapters: [22,23,24] },
      { day: 20, ref: 'John 1-3', book: 'JHN', chapters: [1,2,3] },
      { day: 21, ref: 'John 4-6', book: 'JHN', chapters: [4,5,6] },
      { day: 22, ref: 'John 7-10', book: 'JHN', chapters: [7,8,9,10] },
      { day: 23, ref: 'John 11-13', book: 'JHN', chapters: [11,12,13] },
      { day: 24, ref: 'John 14-17', book: 'JHN', chapters: [14,15,16,17] },
      { day: 25, ref: 'John 18-21', book: 'JHN', chapters: [18,19,20,21] },
      { day: 26, ref: 'Acts 1-5', book: 'ACT', chapters: [1,2,3,4,5] },
      { day: 27, ref: 'Acts 6-10', book: 'ACT', chapters: [6,7,8,9,10] },
      { day: 28, ref: 'Acts 11-15', book: 'ACT', chapters: [11,12,13,14,15] },
      { day: 29, ref: 'Acts 16-20', book: 'ACT', chapters: [16,17,18,19,20] },
      { day: 30, ref: 'Acts 21-28', book: 'ACT', chapters: [21,22,23,24,25,26,27,28] },
    ],
  },
  {
    id: 'psalms-30',
    title: 'Psalms in 30 Days',
    description: 'A month of praise, lament, and worship through the Psalms.',
    icon: '🙏',
    days: 30,
    color: '#0284C7',
    colorBg: '#EFF6FF',
    readings: Array.from({ length: 30 }, (_, i) => {
      const start = i * 5 + 1;
      const end = Math.min(start + 4, 150);
      return { day: i + 1, ref: `Psalms ${start}-${end}`, book: 'PSA', chapters: Array.from({ length: end - start + 1 }, (_, j) => start + j) };
    }),
  },
  {
    id: 'proverbs-31',
    title: 'Proverbs in 31 Days',
    description: 'One chapter of Proverbs per day for a month of wisdom.',
    icon: '💡',
    days: 31,
    color: '#D97706',
    colorBg: '#FFFBEB',
    readings: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1, ref: `Proverbs ${i + 1}`, book: 'PRO', chapters: [i + 1],
    })),
  },
  {
    id: 'gospel-john-21',
    title: 'Gospel of John in 21 Days',
    description: 'Walk with Jesus through John\'s gospel, one chapter a day.',
    icon: '✝️',
    days: 21,
    color: '#7C3AED',
    colorBg: '#F5F3FF',
    readings: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1, ref: `John ${i + 1}`, book: 'JHN', chapters: [i + 1],
    })),
  },
];

const STORAGE_PREFIX = 'faithlight_rp_progress_';

function getProgress(planId) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + planId) || '[]');
  } catch { return []; }
}

function saveProgress(planId, completedDays) {
  localStorage.setItem(STORAGE_PREFIX + planId, JSON.stringify(completedDays));
}

function resetProgress(planId) {
  localStorage.removeItem(STORAGE_PREFIX + planId);
}

export default function ReadingPlansHub() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [progress, setProgress] = useState({}); // planId → completedDays[]

  // Load all progress on mount
  useEffect(() => {
    const map = {};
    PLANS.forEach(p => { map[p.id] = getProgress(p.id); });
    setProgress(map);
  }, []);

  const toggleDay = (planId, day) => {
    const current = progress[planId] || [];
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    saveProgress(planId, updated);
    setProgress(prev => ({ ...prev, [planId]: updated }));
  };

  const handleReset = (planId) => {
    resetProgress(planId);
    setProgress(prev => ({ ...prev, [planId]: [] }));
  };

  const handleOpenChapter = (reading) => {
    navigate(`/BibleReaderPage?book_id=${reading.book}&chapter=${reading.chapters[0]}`);
  };

  // Plan detail view
  if (selectedPlan) {
    const plan = selectedPlan;
    const completedDays = progress[plan.id] || [];
    const pct = Math.round((completedDays.length / plan.days) * 100);

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setSelectedPlan(null)} className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Back">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-base font-bold text-gray-900 flex-1 truncate">{plan.title}</h1>
            <button
              onClick={() => { if (window.confirm('Reset all progress for this plan?')) handleReset(plan.id); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors min-h-[36px]"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* Progress card */}
          <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` }}>
            <div className="text-4xl mb-2">{plan.icon}</div>
            <p className="text-sm font-medium opacity-80 mb-1">{plan.description}</p>
            <p className="text-2xl font-bold">{completedDays.length} / {plan.days} days</p>
            <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs mt-1 opacity-70">{pct}% complete</p>
          </div>

          {/* Days list */}
          <div className="space-y-2">
            {plan.readings.map((reading) => {
              const done = completedDays.includes(reading.day);
              return (
                <div
                  key={reading.day}
                  className={`bg-white rounded-xl border shadow-sm p-3 flex items-center gap-3 transition-all ${
                    done ? 'border-green-200 bg-green-50/40' : 'border-gray-100'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDay(plan.id, reading.day)}
                    className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 text-transparent hover:border-indigo-400'
                    }`}
                    aria-label={done ? `Unmark Day ${reading.day}` : `Mark Day ${reading.day} complete`}
                  >
                    <Check size={14} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Day {reading.day}</p>
                    <p className={`text-sm font-semibold truncate ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {reading.ref}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenChapter(reading)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors min-h-[36px]"
                    style={{ backgroundColor: plan.colorBg, color: plan.color }}
                  >
                    <BookOpen size={12} /> Read
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Plan list view
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Bible Reading Plans</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <p className="text-sm text-gray-500">Choose a plan and track your daily reading progress.</p>

        {PLANS.map(plan => {
          const completedDays = progress[plan.id] || [];
          const pct = Math.round((completedDays.length / plan.days) * 100);
          const started = completedDays.length > 0;

          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{plan.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{plan.title}</h3>
                    <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2 leading-snug">{plan.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={11} /> {plan.days} days
                    </span>
                    {started && (
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: plan.color }}>
                        <Star size={11} /> {pct}% done
                      </span>
                    )}
                  </div>
                  {started && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: plan.color }} />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}