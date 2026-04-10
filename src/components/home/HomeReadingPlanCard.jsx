import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';

const PLANS = [
  { id: 'overcoming_anxiety', title: 'Overcoming Anxiety', emoji: '🕊️', color: 'from-sky-500 to-indigo-600', totalDays: 7,
    days: [
      { day: 1, reference: 'Philippians 4:6-7' }, { day: 2, reference: 'Matthew 6:25-27' },
      { day: 3, reference: 'Isaiah 41:10' },       { day: 4, reference: 'Psalm 23:1-4' },
      { day: 5, reference: '1 Peter 5:7' },        { day: 6, reference: 'John 14:27' },
      { day: 7, reference: 'Romans 8:28' },
    ],
  },
  { id: 'growth', title: 'Spiritual Growth', emoji: '🌱', color: 'from-emerald-500 to-teal-600', totalDays: 7,
    days: [
      { day: 1, reference: 'James 1:2-4' },        { day: 2, reference: '2 Peter 1:5-8' },
      { day: 3, reference: 'Colossians 3:16' },     { day: 4, reference: 'Psalm 119:105' },
      { day: 5, reference: 'Hebrews 5:14' },        { day: 6, reference: 'Romans 12:2' },
      { day: 7, reference: 'Galatians 5:22-23' },
    ],
  },
  { id: 'strength', title: 'Finding Strength', emoji: '⚡', color: 'from-amber-500 to-orange-600', totalDays: 7,
    days: [
      { day: 1, reference: 'Philippians 4:13' },   { day: 2, reference: 'Isaiah 40:31' },
      { day: 3, reference: 'Psalm 46:1' },          { day: 4, reference: '2 Corinthians 12:9' },
      { day: 5, reference: 'Joshua 1:9' },          { day: 6, reference: 'Ephesians 6:10' },
      { day: 7, reference: 'Psalm 28:7' },
    ],
  },
  { id: 'forgiveness', title: 'Grace & Forgiveness', emoji: '🤍', color: 'from-rose-400 to-pink-600', totalDays: 7,
    days: [
      { day: 1, reference: '1 John 1:9' },          { day: 2, reference: 'Psalm 103:12' },
      { day: 3, reference: 'Ephesians 4:32' },      { day: 4, reference: 'Matthew 18:21-22' },
      { day: 5, reference: 'Colossians 3:13' },     { day: 6, reference: 'Romans 8:1' },
      { day: 7, reference: 'Luke 15:20' },
    ],
  },
];

const STORAGE_KEY = 'faithlight_reading_plan_progress';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function HomeReadingPlanCard() {
  const progress = loadProgress();

  // Find the most recently started, incomplete plan
  const activePlan = useMemo(() => {
    let best = null;
    for (const plan of PLANS) {
      const p = progress[plan.id];
      if (!p) continue;
      const completed = p.completed || [];
      if (completed.length >= plan.totalDays) continue; // fully done
      if (!best || new Date(p.startedAt) > new Date(progress[best.id]?.startedAt)) {
        best = plan;
      }
    }
    return best;
  }, []);

  if (!activePlan) {
    // No active plan — show a start prompt
    return (
      <Link to="/ReadingPlans">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200 flex items-start gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Start a Reading Plan</p>
            <p className="text-xs text-gray-600 mt-1">7-day guided Scripture journeys</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        </motion.div>
      </Link>
    );
  }

  const p = progress[activePlan.id];
  const completed = p.completed || [];
  const pct = Math.round((completed.length / activePlan.totalDays) * 100);

  // Next day to read
  let todayDay = null;
  for (let i = 1; i <= activePlan.totalDays; i++) {
    if (!completed.includes(i)) { todayDay = i; break; }
  }

  const todayPassage = activePlan.days.find(d => d.day === todayDay)?.reference || '';
  const completedToday = todayDay === null || completed.includes(todayDay);

  const markComplete = (e) => {
    e.preventDefault();
    if (todayDay === null) return;
    const current = progress[activePlan.id] || { completed: [] };
    const updated = {
      ...progress,
      [activePlan.id]: { ...current, completed: [...(current.completed || []), todayDay] },
    };
    saveProgress(updated);
    window.location.reload(); // refresh home data
  };

  return (
    <Link to="/ReadingPlans">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-gray-200"
      >
        {/* Color accent bar */}
        <div className={`h-1 bg-gradient-to-r ${activePlan.color}`} />

        <div className="p-6">
          {/* Title row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activePlan.emoji}</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{activePlan.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Day {todayDay ?? activePlan.totalDays} of {activePlan.totalDays}
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-purple-600">{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-2 rounded-full bg-gradient-to-r ${activePlan.color}`}
            />
          </div>

          {/* Today's passage + actions */}
          {todayDay && (
            <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                <BookOpen size={16} className="text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Today's Reading</p>
                  <p className="text-sm font-semibold text-purple-700">{todayPassage}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!completedToday && (
                  <button
                    onClick={markComplete}
                    aria-label="Mark today's reading as done"
                    className="text-xs font-semibold bg-purple-600 text-white px-3 min-h-[44px] rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Done
                  </button>
                )}
              </div>
            </div>
          )}

          {pct === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
              <p className="flex items-center gap-2 text-sm text-green-800 font-semibold">
                <CheckCircle2 size={16} className="text-green-600" /> Plan complete! Start another
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}