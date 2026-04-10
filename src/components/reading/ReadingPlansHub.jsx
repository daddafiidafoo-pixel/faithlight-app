import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Clock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const CURATED_PLANS = [
  {
    id: 'proverbs-30',
    title: '30 Days of Proverbs',
    description: 'Explore practical wisdom through daily Proverbs readings',
    duration: 30,
    difficulty: 'Beginner',
    color: 'from-amber-500 to-orange-600',
    icon: '📚',
  },
  {
    id: 'psalms-40',
    title: '40 Days of Psalms',
    description: 'Journey through songs of praise, lament, and faith',
    duration: 40,
    difficulty: 'Intermediate',
    color: 'from-purple-500 to-pink-600',
    icon: '🎵',
  },
  {
    id: 'gospels-gospels',
    title: 'All Four Gospels',
    description: 'Read Matthew, Mark, Luke, and John chronologically',
    duration: 60,
    difficulty: 'Intermediate',
    color: 'from-blue-500 to-cyan-600',
    icon: '✝️',
  },
  {
    id: 'ot-survey',
    title: 'Old Testament Survey',
    description: 'Overview of key Old Testament books and themes',
    duration: 90,
    difficulty: 'Advanced',
    color: 'from-red-500 to-rose-600',
    icon: '⛪',
  },
];

export default function ReadingPlansHub() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const userProgress = await base44.entities.UserReadingPlanProgress.filter({
            user_email: user.email,
          });
          setProgress(userProgress);
        }
      } catch (err) {
        console.error('Error loading reading plan progress:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  const getProgress = (planId) => {
    const planProgress = progress.find(p => p.plan_id === planId);
    if (!planProgress) return null;
    return Math.round((planProgress.completed_days.length / planProgress.plan_duration_days) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Reading Plans</h1>
          <p className="text-lg text-slate-600">
            Discover curated Bible reading plans designed to deepen your faith journey
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CURATED_PLANS.map((plan) => {
            const planProgress = getProgress(plan.id);
            const hasStarted = planProgress !== null;

            return (
              <Link key={plan.id} to={`/reading-plan-detail?id=${plan.id}`}>
                <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full">
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-br ${plan.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{plan.icon}</span>
                      {hasStarted && (
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                    <p className="text-white/90 text-sm">{plan.description}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{plan.duration} days</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">{plan.difficulty}</span>
                      </div>
                    </div>

                    {hasStarted ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-slate-700">Progress</span>
                          <span className="text-sm font-bold text-slate-900">{planProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${plan.color} h-2 rounded-full transition-all`}
                            style={{ width: `${planProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 rounded-lg transition-colors">
                        Start Plan
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {loading && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Loading plans...</p>
          </div>
        )}
      </div>
    </div>
  );
}