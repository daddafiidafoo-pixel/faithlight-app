import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { readingPlans, getReadingPlanProgress, markDayComplete } from '@/lib/readingPlans';
import ReadingPlanCard from '@/components/reading-plans/ReadingPlanCard';
import ReadingPlanDayItem from '@/components/reading-plans/ReadingPlanDayItem';
import SharePlanModal from '@/components/reading-plans/SharePlanModal';
import CreateCustomPlanModal from '@/components/reading-plans/CreateCustomPlanModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Share2, Plus, BookOpen, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ReadingPlanNotificationOptIn from '@/components/reading-plans/ReadingPlanNotificationOptIn';

// Resolve shared plan from URL param
function getSharedPlanId() {
  const params = new URLSearchParams(window.location.search);
  const shared = params.get('shared');
  if (shared) {
    try { return atob(shared); } catch { return null; }
  }
  return null;
}

export default function ReadingPlans() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [progress, setProgress] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customPlans, setCustomPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'custom'
  const [sharedPlanView, setSharedPlanView] = useState(null); // plan being viewed from shared link
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Progress for curated plans
      const progressMap = {};
      readingPlans.forEach(p => {
        const pr = getReadingPlanProgress(u.email).find(pr => pr.planId === p.id);
        progressMap[p.id] = pr;
      });
      setProgress(progressMap);
      // Load user's custom plans
      loadCustomPlans(u.email);
    }).catch(() => {});

    // Handle shared link
    const sharedId = getSharedPlanId();
    if (sharedId) {
      const found = readingPlans.find(p => p.id === sharedId);
      if (found) setSharedPlanView(found);
    }
  }, []);

  const loadCustomPlans = async (email) => {
    try {
      const plans = await base44.entities.CustomReadingPlan.filter({ userEmail: email }, '-created_date', 20);
      setCustomPlans(plans || []);
    } catch { setCustomPlans([]); }
  };

  const handleSubscribeToShared = async () => {
    if (!user) { toast.error('Sign in to subscribe'); return; }
    if (!sharedPlanView) return;
    setIsSubscribing(true);
    try {
      // Check if already subscribed (progress exists)
      const existing = getReadingPlanProgress(user.email).find(p => p.planId === sharedPlanView.id);
      if (existing) {
        toast('Already subscribed to this plan!');
        setSharedPlanView(null);
        setSelectedPlan(sharedPlanView);
        return;
      }
      // Mark as started by completing day 0 (just creating a progress entry)
      markDayComplete(user.email, sharedPlanView.id, 0);
      toast.success('Subscribed to plan! 🎉');
      setSharedPlanView(null);
      setSelectedPlan(sharedPlanView);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDeleteCustomPlan = async (planId) => {
    try {
      await base44.entities.CustomReadingPlan.delete(planId);
      setCustomPlans(p => p.filter(x => x.id !== planId));
      if (selectedPlan?.id === planId) setSelectedPlan(null);
      toast.success('Plan deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleMarkCustomDayComplete = async (plan, dayNumber) => {
    const updatedDays = (plan.days || []).map(d =>
      d.dayNumber === dayNumber ? { ...d, completed: true, completedAt: new Date().toISOString() } : d
    );
    const completedCount = updatedDays.filter(d => d.completed).length;
    const nextDay = Math.min(completedCount + 1, plan.durationDays);
    try {
      const updated = await base44.entities.CustomReadingPlan.update(plan.id, {
        days: updatedDays,
        currentDay: nextDay,
      });
      setCustomPlans(p => p.map(x => x.id === plan.id ? updated : x));
      if (selectedPlan?.id === plan.id) setSelectedPlan(updated);
    } catch { toast.error('Failed to update'); }
  };

  if (!user) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  // Shared plan preview screen
  if (sharedPlanView) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-8 text-center">
          <div className="text-5xl mb-3">{sharedPlanView.icon}</div>
          <h1 className="text-2xl font-bold mb-1">{sharedPlanView.title}</h1>
          <p className="text-indigo-100 text-sm">{sharedPlanView.description}</p>
          <p className="text-indigo-200 text-xs mt-2">{sharedPlanView.durationDays} days</p>
        </div>
        <div className="max-w-lg mx-auto p-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <p className="text-gray-600 text-sm text-center mb-4">Someone shared this reading plan with you!</p>
            <button
              onClick={handleSubscribeToShared}
              disabled={isSubscribing}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubscribing ? 'Subscribing…' : '📖 Subscribe to this Plan'}
            </button>
            <button
              onClick={() => setSharedPlanView(null)}
              className="w-full py-2 mt-2 text-gray-500 text-sm hover:underline"
            >
              Browse all plans instead
            </button>
          </div>
          <div className="space-y-2">
            {(sharedPlanView.dailyReadings || []).slice(0, 5).map(day => (
              <div key={day.dayNumber} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-indigo-600 mb-0.5">Day {day.dayNumber}</p>
                <p className="text-sm font-semibold text-gray-800">{day.title}</p>
                <p className="text-xs text-gray-500">{(day.readings || []).join(', ')}</p>
              </div>
            ))}
            {(sharedPlanView.dailyReadings || []).length > 5 && (
              <p className="text-center text-xs text-gray-400">+{sharedPlanView.dailyReadings.length - 5} more days</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Selected curated plan detail
  if (selectedPlan && !selectedPlan.userEmail) {
    const plan = selectedPlan;
    const planProgress = progress[plan.id];
    const completedDays = planProgress?.completedDays || [];

    return (
      <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 z-30 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)} className="h-8 w-8 p-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold flex-1 truncate">{plan.title}</h1>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            <Share2 size={14} /> Share
          </button>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="bg-white card p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{plan.icon}</div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">{plan.title}</h2>
                <p className="text-sm text-slate-600">{plan.description}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  {completedDays.length} of {plan.durationDays} days complete
                </span>
                <span className="text-sm font-bold text-indigo-600">
                  {Math.round((completedDays.length / plan.durationDays) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${(completedDays.length / plan.durationDays) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <ReadingPlanNotificationOptIn planTitle={plan.title} />

          <div className="space-y-3">
            {plan.dailyReadings.map(day => (
              <ReadingPlanDayItem
                key={day.dayNumber}
                day={day}
                isCompleted={completedDays.includes(day.dayNumber)}
                onClick={() => {
                  markDayComplete(user.email, plan.id, day.dayNumber);
                  const updated = getReadingPlanProgress(user.email).find(p => p.planId === plan.id);
                  setProgress(p => ({ ...p, [plan.id]: updated }));
                }}
              />
            ))}
          </div>
        </div>

        {showShareModal && <SharePlanModal plan={plan} onClose={() => setShowShareModal(false)} />}
      </div>
    );
  }

  // Selected custom plan detail
  if (selectedPlan && selectedPlan.userEmail) {
    const plan = selectedPlan;
    const completedDays = (plan.days || []).filter(d => d.completed).length;

    return (
      <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 z-30 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)} className="h-8 w-8 p-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold flex-1 truncate">{plan.title}</h1>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <div>
                <h2 className="font-bold text-gray-900">{plan.title}</h2>
                <p className="text-sm text-gray-500">{plan.goal}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">{completedDays} of {plan.durationDays} days</span>
                <span className="text-sm font-bold text-indigo-600">{Math.round((completedDays / plan.durationDays) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(completedDays / plan.durationDays) * 100}%` }} />
              </div>
            </div>
          </div>

          <ReadingPlanNotificationOptIn planTitle={plan.title} />

          <div className="space-y-3">
            {(plan.days || []).map(day => (
              <div
                key={day.dayNumber}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                  day.completed ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600">Day {day.dayNumber}</span>
                      {day.completed && <Check size={12} className="text-green-600" />}
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{day.title}</p>
                    {day.readings?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{day.readings.join(' · ')}</p>
                    )}
                    {day.devotionalNote && (
                      <p className="text-xs text-gray-400 italic mt-1">{day.devotionalNote}</p>
                    )}
                  </div>
                  {!day.completed && (
                    <button
                      onClick={() => handleMarkCustomDayComplete(plan, day.dayNumber)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Reading Plans</h1>
        <p className="text-indigo-100">Choose a guided Bible journey</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex max-w-4xl mx-auto">
          {[{ id: 'curated', label: 'Curated Plans' }, { id: 'custom', label: 'My Plans' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {activeTab === 'curated' && (
          <div className="grid gap-4 md:grid-cols-2">
            {readingPlans.map(plan => (
              <ReadingPlanCard
                key={plan.id}
                plan={plan}
                progress={progress[plan.id]}
                onClick={() => setSelectedPlan(plan)}
              />
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full mb-4 py-3 border-2 border-dashed border-indigo-300 rounded-2xl text-indigo-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
            >
              <Plus size={16} /> Create Custom Reading Plan
            </button>

            {customPlans.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No custom plans yet</p>
                <p className="text-gray-400 text-sm">Create your own personalized reading plan</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {customPlans.map(plan => {
                  const completed = (plan.days || []).filter(d => d.completed).length;
                  const pct = plan.durationDays > 0 ? Math.round((completed / plan.durationDays) * 100) : 0;
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 transition-all cursor-pointer relative group"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{plan.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{plan.goal}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteCustomPlan(plan.id); }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{plan.durationDays} days</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold mt-1">{pct}% complete</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCustomPlanModal
          onClose={() => setShowCreateModal(false)}
          onCreated={plan => setCustomPlans(p => [plan, ...p])}
        />
      )}
    </div>
  );
}