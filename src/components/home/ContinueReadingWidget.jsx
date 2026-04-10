import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { BookOpen, ChevronRight, Play } from 'lucide-react';

export default function ContinueReadingWidget() {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // Load active plan progress from localStorage
    const active = localStorage.getItem('active_study_plan');
    if (active) {
      try { setPlan(JSON.parse(active)); } catch { /* ignore */ }
    }
  }, []);

  if (!plan) return null;

  const completedDays = plan.completedDays?.length || 0;
  const totalDays = plan.totalDays || 1;
  const pct = Math.round((completedDays / totalDays) * 100);
  const nextDay = completedDays + 1;

  return (
    <Link to={`${createPageUrl('StudyPlanDetail')}?plan=${plan.id}`} className="block">
      <div className="bg-white rounded-3xl p-4 border border-indigo-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
            {plan.cover || '📖'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Continue Reading</p>
            <p className="text-sm font-bold text-gray-900 truncate">{plan.title}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Play className="w-3.5 h-3.5 text-white ml-0.5" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-500">{pct}%</span>
        </div>
        <p className="text-xs text-gray-400">Day {nextDay} of {totalDays} · {plan.chapters?.[completedDays] || 'Next reading'}</p>
      </div>
    </Link>
  );
}