import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Plus, Loader2, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function MyReadingPlans() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const userPlans = await base44.entities.ReadingPlan.filter(
          { user_id: currentUser.id },
          '-started_date',
          20
        );
        setPlans(userPlans);
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">My Reading Plans</h2>
          <p className="text-gray-500 text-sm">Sign in to view and create reading plans.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('readingPlans.myPlans', 'My Reading Plans')}</h1>
            <p className="text-gray-500 mt-1">{t('readingPlans.subtitle', 'Track your Bible reading journey')}</p>
          </div>
          <Link to={createPageUrl('CustomReadingPlanGenerator')}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" />
              {t('readingPlans.newPlan', 'New Plan')}
            </Button>
          </Link>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-700">{t('readingPlans.noPlan', 'No plans yet')}</h3>
            <p className="text-gray-500">{t('readingPlans.createYourFirst', 'Create your first personalized Bible reading plan')}</p>
            <Link to={createPageUrl('CustomReadingPlanGenerator')}>
              <Button className="mx-auto bg-indigo-600 hover:bg-indigo-700">
                Create Plan
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => {
              const progress = Math.round((plan.days_completed / plan.duration_days) * 100);
              const isActive = !plan.is_completed;

              return (
                <Card key={plan.id} className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>

                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>{plan.duration_days} {t('readingPlans.days', 'Days')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">🏷️</span>
                      <span>{plan.topic}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          {t('readingPlans.progress', 'Progress')}: {plan.days_completed}/{plan.duration_days} {t('readingPlans.daysCompleted', 'days')}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => navigate(createPageUrl(`ReadingPlanDetail?id=${plan.id}`))}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      {isActive ? t('readingPlans.continuePlan', 'Continue Plan') : t('readingPlans.viewPlan', 'View Plan')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {plan.is_completed && (
                    <div className="mt-2 px-3 py-2 bg-green-50 rounded-lg text-center">
                      <p className="text-xs font-semibold text-green-700">✓ {t('readingPlans.completed', 'Completed')}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}