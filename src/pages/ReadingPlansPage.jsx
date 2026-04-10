import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Circle, Plus, Trash2, Calendar, BookOpen } from 'lucide-react';

export default function ReadingPlansPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    theme: 'faith',
    duration_days: 7,
    readings: []
  });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        return base44.entities.ReadingPlan.filter({ user_email: u.email }, '-started_at', 20);
      })
      .then(setPlans)
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreatePlan = async () => {
    if (!user || !newPlan.title) return;
    try {
      const plan = {
        user_email: user.email,
        title: newPlan.title,
        description: '',
        theme: newPlan.theme,
        duration_days: newPlan.duration_days,
        readings: [{ day: 1, book_id: 'MAT', chapter: 1, verse_start: 1, verse_end: 10 }],
        started_at: new Date().toISOString(),
        is_active: true
      };
      await base44.entities.ReadingPlan.create(plan);
      setPlans(prev => [plan, ...prev]);
      setShowForm(false);
      setNewPlan({ title: '', theme: 'faith', duration_days: 7, readings: [] });
    } catch (err) {
      console.error('Error creating plan:', err);
    }
  };

  const handleCompleteDay = async (planId, dayNumber) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;
      const completed = plan.completed_days || [];
      const updated = completed.includes(dayNumber)
        ? completed.filter(d => d !== dayNumber)
        : [...completed, dayNumber];
      await base44.entities.ReadingPlan.update(planId, { completed_days: updated });
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, completed_days: updated } : p));
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await base44.entities.ReadingPlan.delete(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Reading Plans</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" /> New Plan
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <input
              type="text"
              placeholder="Plan title..."
              value={newPlan.title}
              onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <select
              value={newPlan.theme}
              onChange={(e) => setNewPlan({ ...newPlan, theme: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            >
              {['faith', 'hope', 'peace', 'strength', 'love'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              max="365"
              value={newPlan.duration_days}
              onChange={(e) => setNewPlan({ ...newPlan, duration_days: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              placeholder="Duration (days)"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlan}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No reading plans yet. Create one to get started!</p>
            </div>
          ) : (
            plans.map(plan => {
              const progress = plan.completed_days?.length || 0;
              const percentage = Math.round((progress / plan.duration_days) * 100);
              return (
                <div key={plan.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{plan.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {plan.duration_days} days • {plan.theme}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{progress} of {plan.duration_days} days completed</p>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: plan.duration_days }).map((_, i) => {
                      const day = i + 1;
                      const isCompleted = plan.completed_days?.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => handleCompleteDay(plan.id, day)}
                          className={`p-2 rounded text-sm font-semibold transition ${
                            isCompleted
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title={`Day ${day}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}