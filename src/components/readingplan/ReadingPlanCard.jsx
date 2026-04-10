import React from 'react';
import { BookOpen, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
};

export default function ReadingPlanCard({ plan, onClick }) {
  const pct = plan.total_days > 0 ? Math.round((plan.completed_days || 0) / plan.total_days * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all p-4 text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-gray-900 truncate text-sm">{plan.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_COLORS[plan.status] || STATUS_COLORS.active}`}>
              {plan.status}
            </span>
          </div>
          <p className="text-xs text-indigo-600 font-medium mb-1">🎯 {plan.theme}</p>
          {plan.description && <p className="text-xs text-gray-500 line-clamp-1">{plan.description}</p>}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                {plan.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                {plan.completed_days || 0} / {plan.total_days} days
              </span>
              <span className="text-[11px] font-bold text-amber-700">{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-400 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}