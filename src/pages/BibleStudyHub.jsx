import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, StickyNote, Target, Share2, Search, Globe, Lock, Trash2, Play, Pause, CheckCircle2, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import VerseComparisonPanel from '../components/bible/VerseComparisonPanel';
import AnnotationsManager from '../components/bible/AnnotationsManager';
import ShareStudyPlanModal from '../components/study/ShareStudyPlanModal';

export default function BibleStudyHub() {
  const [user, setUser] = useState(null);
  const [sharingPlan, setSharingPlan] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: studyPlans = [] } = useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: () => base44.entities.StudyPlan.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user,
  });

  const updatePlanMutation = useMutation({
    mutationFn: (data) => base44.entities.StudyPlan.update(data.id, { status: data.status, progress_percentage: data.progress_percentage }),
    onSuccess: () => queryClient.invalidateQueries(['study-plans']),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId) => base44.entities.StudyPlan.delete(planId),
    onSuccess: () => queryClient.invalidateQueries(['study-plans']),
  });

  const activePlans = studyPlans.filter(p => p.status === 'active');
  const completedPlans = studyPlans.filter(p => p.status === 'completed');
  const pausedPlans = studyPlans.filter(p => p.status === 'paused');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Bible Study Hub</h1>
          <p className="text-indigo-200">Compare translations, manage your annotations, and track study plans.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="compare">
          <TabsList className="w-full mb-8 grid grid-cols-3">
            <TabsTrigger value="compare" className="gap-2">
              <BookOpen className="w-4 h-4" /> Compare Translations
            </TabsTrigger>
            <TabsTrigger value="annotations" className="gap-2">
              <StickyNote className="w-4 h-4" /> My Annotations
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Target className="w-4 h-4" /> Study Plans
            </TabsTrigger>
          </TabsList>

          {/* TAB: Translation Comparison */}
          <TabsContent value="compare">
            <VerseComparisonPanel />
          </TabsContent>

          {/* TAB: Annotations */}
          <TabsContent value="annotations">
            {user && <AnnotationsManager userId={user.id} />}
          </TabsContent>

          {/* TAB: Study Plans */}
          <TabsContent value="plans">
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Active', count: activePlans.length, icon: <Target className="w-8 h-8 text-blue-400 opacity-30" /> },
                  { label: 'Completed', count: completedPlans.length, icon: <CheckCircle2 className="w-8 h-8 text-green-400 opacity-30" /> },
                  { label: 'Total', count: studyPlans.length, icon: <BookOpen className="w-8 h-8 text-indigo-400 opacity-30" /> },
                ].map(s => (
                  <Card key={s.label}>
                    <CardContent className="pt-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{s.label}</p>
                        <p className="text-3xl font-bold">{s.count}</p>
                      </div>
                      {s.icon}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link to={createPageUrl('StudyPlans')}>
                  <Button className="gap-2">
                    <Sparkles className="w-4 h-4" /> Generate New Plan
                  </Button>
                </Link>
                <Link to={createPageUrl('SharedPlans')}>
                  <Button variant="outline" className="gap-2">
                    <Globe className="w-4 h-4" /> Browse Community Plans
                  </Button>
                </Link>
              </div>

              {/* Active Plans */}
              {activePlans.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Active Plans</h2>
                  <div className="space-y-3">
                    {activePlans.map(plan => (
                      <Card key={plan.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 flex-wrap">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {plan.duration_days}d</span>
                                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {plan.progress_percentage || 0}%</span>
                                {plan.topics?.slice(0, 2).map((t, i) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${plan.progress_percentage || 0}%` }} />
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button size="sm" variant="outline" className="gap-1" onClick={() => setSharingPlan(plan)}>
                                <Share2 className="w-3 h-3" /> Share
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updatePlanMutation.mutate({ id: plan.id, status: 'paused', progress_percentage: plan.progress_percentage })}>
                                <Pause className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => deletePlanMutation.mutate(plan.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Paused Plans */}
              {pausedPlans.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Paused</h2>
                  <div className="space-y-3">
                    {pausedPlans.map(plan => (
                      <Card key={plan.id} className="opacity-70">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{plan.title}</h3>
                            <p className="text-sm text-gray-500">{plan.progress_percentage || 0}% complete</p>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => updatePlanMutation.mutate({ id: plan.id, status: 'active', progress_percentage: plan.progress_percentage })}>
                            <Play className="w-3 h-3" /> Resume
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Plans */}
              {completedPlans.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Completed</h2>
                  <div className="space-y-3">
                    {completedPlans.map(plan => (
                      <Card key={plan.id} className="border-green-200 bg-green-50">
                        <CardContent className="p-5 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold">{plan.title}</h3>
                            <p className="text-xs text-gray-500">Completed {new Date(plan.updated_date).toLocaleDateString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {studyPlans.length === 0 && (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No study plans yet.</p>
                    <Link to={createPageUrl('StudyPlans')}>
                      <Button className="gap-2"><Sparkles className="w-4 h-4" /> Generate Your First Plan</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {sharingPlan && (
        <ShareStudyPlanModal studyPlan={sharingPlan} user={user} onClose={() => setSharingPlan(null)} />
      )}
    </div>
  );
}