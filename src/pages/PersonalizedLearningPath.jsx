import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, Loader2 } from 'lucide-react';
import PersonalizedPathGenerator from '../components/learning/PersonalizedPathGenerator';
import PathProgressDisplay from '../components/learning/PathProgressDisplay';
import ModuleSummaryGenerator from '../components/learning/ModuleSummaryGenerator';
import AdaptivePathDashboard from '../components/learning/AdaptivePathDashboard';
import NextStepsRecommendation from '../components/learning/NextStepsRecommendation';
import AIProgressAdapter from '../components/learning/AIProgressAdapter';
import AINextStepRecommendation from '../components/learning/AINextStepRecommendation';
import CustomLearningPathBuilder from '../components/learning/CustomLearningPathBuilder';
import StudyPathGenerator from '../components/learning/StudyPathGenerator';
import GeneratedStudyPlanViewer from '../components/learning/GeneratedStudyPlanViewer';

export default function PersonalizedLearningPathPage() {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [generatedStudyPlan, setGeneratedStudyPlan] = useState(null);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, []);

  // Fetch user's learning paths
  const { data: learningPaths = [], isLoading } = useQuery({
    queryKey: ['userLearningPaths', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await base44.entities.UserLearningPathSession.filter({
          user_id: user.id
        }, '-created_date', 20);
      } catch {
        return [];
      }
    },
    enabled: !!user
  });

  // Update path progress mutation
  const updatePathMutation = useMutation({
    mutationFn: async ({ pathId, updates }) => {
      return base44.entities.UserLearningPathSession.update(pathId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLearningPaths', user?.id] });
    }
  });

  const handleItemComplete = (path, item) => {
    const updatedItems = path.items.map(i =>
      i.id === item.id
        ? { ...i, is_completed: true, completion_date: new Date().toISOString() }
        : i
    );

    const completedCount = updatedItems.filter(i => i.is_completed).length;
    const newProgress = Math.round((completedCount / updatedItems.length) * 100);
    const nextIndex = updatedItems.findIndex(i => !i.is_completed);

    updatePathMutation.mutate({
      pathId: path.id,
      updates: {
        items: updatedItems,
        overall_progress_percent: newProgress,
        current_step_index: nextIndex >= 0 ? nextIndex : updatedItems.length - 1,
        total_completed_hours: updatedItems.reduce((sum, i) => {
          if (i.is_completed) return sum + (i.estimated_duration_hours || 0);
          return sum;
        }, 0),
        status: newProgress === 100 ? 'completed' : 'active'
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card style={{ backgroundColor: cardColor, borderColor }}>
            <CardContent className="pt-6 text-center">
              <p style={{ color: mutedColor }}>Please log in to access your learning paths</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: textColor }}>
            Personalized Learning Paths 📚
          </h1>
          <p className="text-base" style={{ color: mutedColor }}>
            Create custom learning sequences based on your interests and track your progress.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active">Active Paths</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="recommendations">Next Steps</TabsTrigger>
            <TabsTrigger value="ai-generator">AI Generator</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          {/* Active Paths */}
          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <Card style={{ backgroundColor: cardColor, borderColor }}>
                <CardContent className="pt-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: primaryColor }} />
                  <p style={{ color: mutedColor }}>Loading paths...</p>
                </CardContent>
              </Card>
            ) : learningPaths.filter(p => p.status === 'active').length === 0 ? (
              <Card style={{ backgroundColor: cardColor, borderColor }}>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor, opacity: 0.5 }} />
                  <p style={{ color: mutedColor }}>No active paths. Create one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {learningPaths
                  .filter(p => p.status === 'active')
                  .map(path => (
                    <PathProgressDisplay
                      key={path.id}
                      path={path}
                      isDarkMode={isDarkMode}
                      onItemComplete={(item) => handleItemComplete(path, item)}
                    />
                  ))
                }
                
                {/* AI Adaptive Path Dashboard */}
                <div className="mt-6">
                  <AdaptivePathDashboard userId={user.id} />
                </div>
              </>
            )}
          </TabsContent>

          {/* Completed Paths */}
          <TabsContent value="completed" className="space-y-4">
            {learningPaths.filter(p => p.status === 'completed').length === 0 ? (
              <Card style={{ backgroundColor: cardColor, borderColor }}>
                <CardContent className="pt-6 text-center">
                  <p style={{ color: mutedColor }}>No completed paths yet</p>
                </CardContent>
              </Card>
            ) : (
              learningPaths
                .filter(p => p.status === 'completed')
                .map(path => (
                  <Card key={path.id} style={{ backgroundColor: cardColor, borderColor }}>
                    <CardHeader>
                      <CardTitle style={{ color: textColor }}>{path.path_name}</CardTitle>
                      <p className="text-xs mt-1" style={{ color: '#10b981' }}>✓ Completed</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3" style={{ color: mutedColor }}>
                        {path.primary_interests?.join(', ')}
                      </p>
                      <p className="text-sm" style={{ color: textColor }}>
                        {path.items?.length} modules • {path.total_estimated_hours} hours total
                      </p>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* AI Next Steps Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <AdaptivePathDashboard userId={user.id} />
            <AINextStepRecommendation user={user} />
          </TabsContent>

          {/* AI Study Path Generator */}
          <TabsContent value="ai-generator" className="space-y-6">
            {generatedStudyPlan ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedStudyPlan(null)}
                  className="mb-4"
                >
                  ← Back to Generator
                </Button>
                <GeneratedStudyPlanViewer
                  plan={generatedStudyPlan}
                  onStartPlan={() => {
                    queryClient.invalidateQueries({ queryKey: ['userLearningPaths', user?.id] });
                    setGeneratedStudyPlan(null);
                  }}
                />
              </div>
            ) : (
              <StudyPathGenerator
                onPlanGenerated={(plan) => {
                  setGeneratedStudyPlan(plan);
                }}
              />
            )}
          </TabsContent>

          {/* Create New */}
          <TabsContent value="create" className="space-y-6">
            <div className="flex justify-center">
              <CustomLearningPathBuilder user={user} />
            </div>
            <Card style={{ backgroundColor: cardColor, borderColor }}>
              <CardHeader>
                <CardTitle style={{ color: textColor }}>AI-Generated Path</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalizedPathGenerator
                  user={user}
                  isDarkMode={isDarkMode}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}