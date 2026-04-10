import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, CheckCircle, Plus } from 'lucide-react';
import LoadingState from '@/components/states/LoadingState';
import ErrorState from '@/components/states/ErrorState';

export default function BibleStudyPlanBrowser() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my-plans'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const me = await base44.auth.me();
          setUser(me);

          // Fetch user's subscriptions
          const subs = await base44.entities.BibleStudyPlanSubscription.filter(
            { user_id: me.id },
            '-started_date',
            100
          );
          setSubscriptions(subs);
        }

        // Fetch available plans (mock data)
        const mockPlans = [
          {
            id: '1',
            title: t('plans.faith', 'Faith & Trust'),
            topic: 'Faith',
            description: 'Explore biblical foundations of faith',
            days: 7,
            verses: ['Romans 3:28', 'Hebrews 11:1', 'John 3:16'],
            difficulty: 'beginner'
          },
          {
            id: '2',
            title: t('plans.prayer', 'Prayer Essentials'),
            topic: 'Prayer',
            description: 'Learn effective biblical prayer practices',
            days: 14,
            verses: ['1 Thessalonians 5:17', 'Matthew 6:6', 'Philippians 4:6'],
            difficulty: 'intermediate'
          },
          {
            id: '3',
            title: t('plans.grace', 'Grace & Forgiveness'),
            topic: 'Grace',
            description: 'Understanding God\'s grace in daily life',
            days: 21,
            verses: ['Ephesians 2:8', 'Colossians 3:13', 'Romans 12:2'],
            difficulty: 'intermediate'
          },
          {
            id: '4',
            title: t('plans.love', 'Love & Compassion'),
            topic: 'Love',
            description: '1 Corinthians 13 deep study',
            days: 10,
            verses: ['1 Corinthians 13', 'John 13:34', '1 John 4:7'],
            difficulty: 'beginner'
          },
        ];
        setPlans(mockPlans);
        setLoading(false);
      } catch (err) {
        console.error('[StudyPlanBrowser] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleSubscribePlan = async (plan) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    try {
      await base44.entities.BibleStudyPlanSubscription.create({
        user_id: user.id,
        plan_id: plan.id,
        plan_title: plan.title,
        plan_topic: plan.topic,
        total_days: plan.days,
        started_date: new Date().toISOString()
      });

      // Refresh subscriptions
      const updated = await base44.entities.BibleStudyPlanSubscription.filter(
        { user_id: user.id },
        '-started_date',
        100
      );
      setSubscriptions(updated);
      setActiveTab('my-plans');
    } catch (err) {
      console.error('[StudyPlanBrowser] Subscribe error:', err);
    }
  };

  const isSubscribed = (planId) => subscriptions.some(s => s.plan_id === planId);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('plans.title', 'Bible Study Plans')}</h1>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-600 border-transparent'
          }`}
        >
          {t('plans.browse', 'Browse Plans')}
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('my-plans')}
            className={`px-4 py-2 font-bold border-b-2 transition-colors ${
              activeTab === 'my-plans'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-600 border-transparent'
            }`}
          >
            {t('plans.myPlans', 'My Plans')} ({subscriptions.length})
          </button>
        )}
      </div>

      {/* Browse Plans */}
      {activeTab === 'browse' && (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {plan.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {plan.days} {t('plans.days', 'days')}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {plan.verses.length} {t('plans.verses', 'passages')}
                </div>
              </div>

              <Button
                onClick={() => handleSubscribePlan(plan)}
                disabled={isSubscribed(plan.id)}
                className={`w-full ${
                  isSubscribed(plan.id)
                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isSubscribed(plan.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('plans.subscribed', 'Subscribed')}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('plans.subscribe', 'Start Plan')}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* My Plans */}
      {activeTab === 'my-plans' && (
        <div className="space-y-3">
          {subscriptions.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>{t('plans.noPlans', 'No active plans. Start one today!')}</p>
            </div>
          ) : (
            subscriptions.map((sub) => {
              const progress = (sub.days_completed / sub.total_days) * 100;
              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(createPageUrl('BibleStudyPlanDetail'), { state: { subscription: sub } })}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{sub.plan_title}</h3>
                    {sub.is_completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {t('plans.progress', 'Progress')}: Day {sub.current_day}/{sub.total_days}
                      </span>
                      <span className="font-bold text-indigo-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    {sub.is_completed
                      ? t('plans.completed', 'Completed')
                      : `${sub.total_days - sub.days_completed} ${t('plans.daysLeft', 'days left')}`}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}