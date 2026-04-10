import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function ReadingPlanCard({ plan, progress, onClick }) {
  const percentComplete = progress 
    ? Math.round((progress.completedDays.length / plan.durationDays) * 100)
    : 0;

  return (
    <div 
      onClick={onClick}
      className="card p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{plan.icon}</div>
        {progress && (
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {percentComplete}%
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.title}</h3>
      <p className="text-sm text-slate-600 mb-4">{plan.description}</p>

      {progress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">
              {progress.completedDays.length} of {plan.durationDays} days
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}

      <button className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold py-2 px-3 rounded-lg transition-colors">
        <span>{progress ? 'Continue' : 'Start'}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}