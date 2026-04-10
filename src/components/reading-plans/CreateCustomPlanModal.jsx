import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const DEFAULT_DAY = () => ({ title: '', readings: [''], devotionalNote: '' });

export default function CreateCustomPlanModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState([DEFAULT_DAY()]);
  const [saving, setSaving] = useState(false);

  const updateDay = (idx, field, value) => {
    setDays(d => d.map((day, i) => i === idx ? { ...day, [field]: value } : day));
  };

  const updateReading = (dayIdx, readingIdx, value) => {
    setDays(d => d.map((day, i) => {
      if (i !== dayIdx) return day;
      const readings = [...day.readings];
      readings[readingIdx] = value;
      return { ...day, readings };
    }));
  };

  const addReading = (dayIdx) => {
    setDays(d => d.map((day, i) => i === dayIdx ? { ...day, readings: [...day.readings, ''] } : day));
  };

  const removeReading = (dayIdx, readingIdx) => {
    setDays(d => d.map((day, i) => {
      if (i !== dayIdx) return day;
      return { ...day, readings: day.readings.filter((_, ri) => ri !== readingIdx) };
    }));
  };

  const addDay = () => setDays(d => [...d, DEFAULT_DAY()]);
  const removeDay = (idx) => setDays(d => d.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!title.trim() || !goal.trim()) { toast.error('Please fill in title and goal'); return; }
    if (days.some(d => !d.title.trim())) { toast.error('Each day needs a title'); return; }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      const plan = await base44.entities.CustomReadingPlan.create({
        userEmail: user.email,
        title: title.trim(),
        goal: goal.trim(),
        durationDays: days.length,
        days: days.map((d, i) => ({
          dayNumber: i + 1,
          title: d.title.trim(),
          readings: d.readings.filter(r => r.trim()),
          devotionalNote: d.devotionalNote.trim(),
          completed: false,
        })),
        currentDay: 1,
        isActive: true,
        startedAt: new Date().toISOString(),
      });
      toast.success('Custom plan created! 🎉');
      onCreated(plan);
      onClose();
    } catch (e) {
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">Create Custom Reading Plan</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Plan info */}
          <div className="space-y-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Plan title (e.g. 30 Days of Psalms)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="Your goal (e.g. Deepen my prayer life)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>

          {/* Days */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">{days.length} Days</h3>
            </div>
            <div className="space-y-4">
              {days.map((day, dayIdx) => (
                <div key={dayIdx} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-600">Day {dayIdx + 1}</span>
                    {days.length > 1 && (
                      <button onClick={() => removeDay(dayIdx)} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <input
                    value={day.title}
                    onChange={e => updateDay(dayIdx, 'title', e.target.value)}
                    placeholder="Day title (e.g. Trust and Faith)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 bg-white"
                  />
                  <div className="space-y-1.5 mb-2">
                    {day.readings.map((r, ri) => (
                      <div key={ri} className="flex gap-1.5">
                        <input
                          value={r}
                          onChange={e => updateReading(dayIdx, ri, e.target.value)}
                          placeholder="Reading (e.g. Psalm 23)"
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                        />
                        {day.readings.length > 1 && (
                          <button onClick={() => removeReading(dayIdx, ri)} className="p-2 text-red-400 hover:text-red-600">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addReading(dayIdx)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium"
                    >
                      <Plus size={11} /> Add reading
                    </button>
                  </div>
                  <textarea
                    value={day.devotionalNote}
                    onChange={e => updateDay(dayIdx, 'devotionalNote', e.target.value)}
                    placeholder="Optional devotional note…"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none bg-white"
                  />
                </div>
              ))}
              <button
                onClick={addDay}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={14} /> Add Day
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={submit}
            disabled={saving}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            {saving ? 'Creating…' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}