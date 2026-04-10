import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReadingPlanDetail({ plan, onBack, onUpdate }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const [saving, setSaving] = useState(null);

  const pct = plan.total_days > 0 ? Math.round((plan.completed_days || 0) / plan.total_days * 100) : 0;

  const toggleDay = async (dayIndex) => {
    const day = plan.days[dayIndex];
    const nowCompleted = !day.completed;
    setSaving(dayIndex);

    const updatedDays = plan.days.map((d, i) =>
      i === dayIndex
        ? { ...d, completed: nowCompleted, completed_date: nowCompleted ? new Date().toISOString() : null }
        : d
    );
    const completedCount = updatedDays.filter(d => d.completed).length;
    const newStatus = completedCount === plan.total_days ? 'completed' : 'active';

    const updated = await base44.entities.PersonalReadingPlan.update(plan.id, {
      days: updatedDays,
      completed_days: completedCount,
      status: newStatus,
    });
    onUpdate(updated);
    setSaving(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{plan.title}</h1>
            <p className="text-xs text-amber-600 font-medium">🎯 {plan.theme}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 mb-5">
          {plan.description && <p className="text-sm text-gray-600 mb-4">{plan.description}</p>}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {plan.completed_days || 0} of {plan.total_days} days completed
            </span>
            <span className={`text-sm font-extrabold ${pct === 100 ? 'text-green-600' : 'text-amber-600'}`}>{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <div className="mt-3 bg-green-50 rounded-xl p-3 text-center">
              <p className="text-green-700 font-bold text-sm">🎉 Plan Complete! Well done!</p>
            </div>
          )}
        </div>

        {/* Daily list */}
        <div className="space-y-2.5">
          {(plan.days || []).map((day, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${day.completed ? 'border-green-200' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleDay(i)}
                  disabled={saving === i}
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${day.completed ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-amber-400'}`}
                >
                  {day.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Day {day.day}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded font-mono ${day.completed ? 'text-green-600 bg-green-50' : 'text-indigo-600 bg-indigo-50'}`}>
                      {day.reference}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold truncate mt-0.5 ${day.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {day.title}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex-shrink-0"
                >
                  {expandedDay === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {expandedDay === i && day.reflection && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-50">
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Reflection
                    </p>
                    <p className="text-sm text-gray-700">{day.reflection}</p>
                  </div>
                  {!day.completed && (
                    <Button
                      onClick={() => toggleDay(i)}
                      disabled={saving === i}
                      className="w-full mt-3 bg-amber-600 hover:bg-amber-700 gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Day {day.day} Complete
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}