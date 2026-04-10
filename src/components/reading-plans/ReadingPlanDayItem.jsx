import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function ReadingPlanDayItem({ day, isCompleted, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <button 
          className="flex-shrink-0 mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-slate-300" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Day {day.dayNumber}</span>
            {isCompleted && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Done</span>}
          </div>
          <h3 className={`font-semibold mb-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
            {day.title}
          </h3>
          <p className="text-sm text-slate-600">
            {day.passages.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}