import React from 'react';
import { Calendar, CheckCircle2, Play } from 'lucide-react';

const THEME_COLORS = {
  hope: 'from-amber-50 to-orange-50',
  anxiety: 'from-blue-50 to-cyan-50',
  peace: 'from-green-50 to-emerald-50',
  faith: 'from-purple-50 to-pink-50',
  gratitude: 'from-yellow-50 to-amber-50',
  healing: 'from-rose-50 to-pink-50',
};

const THEME_LABELS = {
  hope: 'Hope',
  anxiety: 'Anxiety Relief',
  peace: 'Peace',
  faith: 'Faith',
  gratitude: 'Gratitude',
  healing: 'Healing',
};

export default function ReadingPlanCard({ plan }) {
  const completedDays = plan.completed_days?.length || 0;
  const progressPercent = (completedDays / plan.days.length) * 100;

  return (
    <div
      className={`bg-gradient-to-br ${THEME_COLORS[plan.theme]} rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="p-6">
        {/* Theme badge */}
        <span className="inline-block px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-gray-700 mb-3">
          {THEME_LABELS[plan.theme]}
        </span>

        {/* Title & description */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">
              {completedDays} of {plan.days.length} days completed
            </span>
            <span className="text-xs font-medium text-gray-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-2 bg-white/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{plan.days.length} days</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={14} />
            <span>{completedDays} completed</span>
          </div>
        </div>

        {/* Action button */}
        <button className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-indigo-600 font-semibold rounded-lg border border-gray-200 transition-colors">
          <Play size={16} />
          Continue Reading
        </button>
      </div>
    </div>
  );
}