import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import StudyPlanCard from '@/components/study/StudyPlanCard';
import ActiveStudyPlanView from '@/components/study/ActiveStudyPlanView';

export default function StudyPlans() {
  const [user, setUser] = useState(null);
  const [activeEnrollment, setActiveEnrollment] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['studyPlans'],
    queryFn: () => base44.entities.StudyPlan.filter({ is_active: true })
  });

  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => user ? base44.entities.UserStudyPlanEnrollment.filter({ user_email: user.email }) : Promise.resolve([]),
    enabled: !!user
  });

  if (!user) return <div className="p-6 text-center">Please log in to access Study Plans</div>;

  const completedCount = enrollments?.filter(e => e.is_completed).length || 0;
  const activeEnrollments = enrollments?.filter(e => !e.is_completed) || [];

  if (activeEnrollment) {
    return <ActiveStudyPlanView enrollment={activeEnrollment} onBack={() => setActiveEnrollment(null)} onUpdate={refetchEnrollments} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Study Plans</h1>
          <p className="text-slate-600 mt-2">Deepen your faith with curated topic-based reading paths</p>
        </div>

        {/* Active Enrollments */}
        {activeEnrollments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">In Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEnrollments.map(enrollment => (
                <Card key={enrollment.id} className="p-6 cursor-pointer hover:shadow-lg transition" onClick={() => setActiveEnrollment(enrollment)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{enrollment.plan_title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{enrollment.plan_topic}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(enrollment.completed_days.length / 7) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold">{enrollment.completed_days.length}/7</span>
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{enrollments?.length || 0}</div>
            <div className="text-sm text-slate-600 mt-2">Enrolled</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-slate-600 mt-2">Completed</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">{plans?.length || 0}</div>
            <div className="text-sm text-slate-600 mt-2">Available</div>
          </Card>
        </div>

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
          {plansLoading ? (
            <div className="text-center py-12">Loading plans...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans?.map(plan => (
                <StudyPlanCard 
                  key={plan.id} 
                  plan={plan} 
                  isEnrolled={enrollments?.some(e => e.study_plan_id === plan.id)}
                  onEnroll={() => refetchEnrollments()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}