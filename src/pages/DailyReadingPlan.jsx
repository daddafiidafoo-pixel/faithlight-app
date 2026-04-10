import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Circle, Bell, BellOff, ChevronRight, Trophy, Flame, Loader2, Lock } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';

// 7-day starter plan
const STARTER_PLAN = [
  { day: 1, reference: 'Psalm 23', title: 'The Lord is My Shepherd', reflection: 'Rest in God\'s provision and guidance for your life.' },
  { day: 2, reference: 'John 1:1-18', title: 'The Word Became Flesh', reflection: 'Meditate on Jesus as the living Word of God.' },
  { day: 3, reference: 'Romans 8:1-17', title: 'Life in the Spirit', reflection: 'How does the Holy Spirit guide your daily life?' },
  { day: 4, reference: 'Proverbs 3:1-12', title: 'Trust in the Lord', reflection: 'Where do you need to trust God more fully?' },
  { day: 5, reference: 'Matthew 5:1-16', title: 'The Beatitudes', reflection: 'Which beatitude speaks most to you today?' },
  { day: 6, reference: 'Isaiah 40:28-31', title: 'Renewed Strength', reflection: 'How can you "soar on wings like eagles" this week?' },
  { day: 7, reference: 'Ephesians 6:10-18', title: 'The Armor of God', reflection: 'Which piece of spiritual armor do you most need today?' },
];

export default function DailyReadingPlan() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [checkingDay, setCheckingDay] = useState(null);
  const [today] = useState(new Date());

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setLoading(false); return; }
      const u = await base44.auth.me();
      setUser(u);
      await loadOrCreatePlan(u);
    };
    init();
  }, []);

  const loadOrCreatePlan = async (u) => {
    setLoading(true);
    try {
      const existing = await base44.entities.PersonalReadingPlan.filter({ user_id: u.id, status: 'active' }, '-created_date', 1);
      if (existing.length > 0) {
        setPlan(existing[0]);
      } else {
        const newPlan = await base44.entities.PersonalReadingPlan.create({
          user_id: u.id,
          title: '7-Day Bible Starter Plan',
          theme: 'foundation',
          description: 'A foundational week of Scripture for new and returning readers.',
          total_days: 7,
          completed_days: 0,
          days: STARTER_PLAN.map(d => ({ ...d, completed: false, completed_date: null })),
          status: 'active',
          started_date: new Date().toISOString(),
        });
        setPlan(newPlan);
      }
    } catch (e) {
      console.error('Plan init error:', e);
    }
    setLoading(false);
  };

  const handleCheckDay = async (dayIndex) => {
    if (!plan || checkingDay !== null) return;
    const days = [...plan.days];
    if (days[dayIndex].completed) return;
    setCheckingDay(dayIndex);
    try {
      days[dayIndex] = { ...days[dayIndex], completed: true, completed_date: new Date().toISOString() };
      const completedCount = days.filter(d => d.completed).length;
      const newStatus = completedCount === plan.total_days ? 'completed' : 'active';
      const updated = await base44.entities.PersonalReadingPlan.update(plan.id, {
        days,
        completed_days: completedCount,
        status: newStatus,
      });
      setPlan(updated);
    } catch (e) {
      console.error('Check day error:', e);
    }
    setCheckingDay(null);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in this browser.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification('FaithLight Daily Reading', {
        body: 'You\'ll now receive daily reading reminders. Keep growing!',
        icon: '/icon.png',
      });
    } else {
      alert('Notification permission denied. Please enable it in your browser settings.');
    }
  };

  const completedCount = plan?.days?.filter(d => d.completed).length || 0;
  const progress = plan ? Math.round((completedCount / plan.total_days) * 100) : 0;
  const streak = completedCount; // simplified streak = completed days

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Lock className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-6">Create an account to track your daily Bible reading progress.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-4">
            <BookOpen className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{plan?.title || '7-Day Bible Reading Plan'}</h1>
          <p className="text-gray-500 text-sm">{plan?.description}</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{completedCount}/{plan?.total_days || 7}</p>
            <p className="text-xs text-gray-500 mt-1">Days Done</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5" />{streak}
            </p>
            <p className="text-xs text-gray-500 mt-1">Day Streak</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{progress}%</p>
            <p className="text-xs text-gray-500 mt-1">Complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-3 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Notification toggle */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">Daily Reading Reminders</p>
            <p className="text-xs text-amber-600">Get notified every day to stay consistent.</p>
          </div>
          <Button
            size="sm"
            variant={notificationsEnabled ? 'default' : 'outline'}
            onClick={handleEnableNotifications}
            className={notificationsEnabled
              ? 'bg-amber-500 hover:bg-amber-600 text-white gap-2'
              : 'border-amber-300 text-amber-700 hover:bg-amber-100 gap-2'}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {notificationsEnabled ? 'Reminders On' : 'Enable'}
          </Button>
        </div>

        {/* Completed banner */}
        {plan?.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-center">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-green-800">Plan Complete! 🎉</h3>
            <p className="text-green-600 text-sm">You've finished all 7 days. Well done!</p>
          </div>
        )}

        {/* Days list */}
        <div className="space-y-3">
          {(plan?.days || STARTER_PLAN).map((day, i) => {
            const done = day.completed;
            const isChecking = checkingDay === i;
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex items-center gap-4 ${done ? 'border-green-200 bg-green-50/40' : 'border-gray-100 hover:shadow-md'}`}
              >
                <button
                  onClick={() => !done && handleCheckDay(i)}
                  disabled={done || isChecking}
                  className="flex-shrink-0 focus:outline-none"
                >
                  {isChecking ? (
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                  ) : done ? (
                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-300 hover:text-indigo-400 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Day {day.day}</span>
                    {done && day.completed_date && (
                      <span className="text-xs text-green-500 font-medium">
                        · {isToday(parseISO(day.completed_date)) ? 'Today' : format(parseISO(day.completed_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                  <p className={`font-semibold text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{day.title}</p>
                  <p className="text-xs text-indigo-500 font-medium">{day.reference}</p>
                  {!done && (
                    <p className="text-xs text-gray-400 mt-1 italic truncate">{day.reflection}</p>
                  )}
                </div>
                {!done && (
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 italic">
          "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
        </p>
      </div>
    </div>
  );
}