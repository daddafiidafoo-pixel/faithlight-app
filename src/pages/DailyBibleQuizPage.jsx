import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BibleQuizPlayer from '@/components/quiz/BibleQuizPlayer';
import OfflineSyncManager from '@/components/offline/OfflineSyncManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, BookOpen, Loader2, AlertCircle, Zap } from 'lucide-react';
import { cacheData, getCachedData, isOnline } from '@/lib/offlineCacheManager';

const QUIZ_MODES = {
  SELECT: 'select',
  STANDALONE: 'standalone',
  PLAN: 'plan'
};

export default function DailyBibleQuizPage() {
  const [mode, setMode] = useState(QUIZ_MODES.SELECT);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const queryClient = useQueryClient();

  const { data: plans } = useQuery({
    queryKey: ['readingPlans'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return await base44.entities.PersonalReadingPlan.filter(
          { user_id: user?.id },
          '-updated_date',
          10
        );
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: todayQuiz } = useQuery({
    queryKey: ['dailyQuiz'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const quizzes = await base44.entities.DailyBibleQuiz.filter(
        { date: today, mode: 'standalone' },
        '-created_date',
        1
      );
      return quizzes[0] || null;
    },
    staleTime: 60 * 60 * 1000,
  });

  const generateQuizMutation = useMutation({
    mutationFn: async ({ quizMode, planId, planTitle }) => {
      let book, chapter, reference, topic;

      if (quizMode === 'plan' && selectedPlan) {
        // Use plan's next reading
        const plan = selectedPlan;
        const nextDay = plan.days.find(d => !d.completed) || plan.days[0];
        book = nextDay.book || 'John';
        chapter = nextDay.chapter || 1;
        reference = nextDay.reference || 'John 1:1';
        topic = plan.title;
      } else {
        // Random daily quiz
        const books = ['John', 'Psalm', 'Romans', 'Matthew', 'Mark', 'Luke', '1 Peter', 'James'];
        book = books[Math.floor(Math.random() * books.length)];
        chapter = Math.floor(Math.random() * 20) + 1;
        reference = `${book} ${chapter}`;
        topic = 'Daily Challenge';
      }

      const response = await base44.functions.invoke('generateDailyBibleQuiz', {
        mode: quizMode,
        plan_id: planId || null,
        book,
        chapter,
        reference,
        topic
      });

      return response.data.quiz;
    },
    onSuccess: async (quiz) => {
      setQuizData(quiz);
      setMode(QUIZ_MODES.SELECT); // Reset mode after quiz loads
      
      if (!isOnline()) {
        await cacheData('dailyQuiz', quiz);
      }
    },
    onError: (error) => {
      console.error('Generate quiz error:', error);
    }
  });

  const handleStartStandalone = () => {
    generateQuizMutation.mutate({ quizMode: 'standalone' });
  };

  const handleStartPlanBased = (plan) => {
    setSelectedPlan(plan);
    generateQuizMutation.mutate({
      quizMode: 'plan',
      planId: plan.id,
      planTitle: plan.title
    });
  };

  const handleQuizComplete = ({ score, percentage, total }) => {
    queryClient.invalidateQueries({ queryKey: ['dailyQuiz'] });
    setTimeout(() => {
      setQuizData(null);
      setMode(QUIZ_MODES.SELECT);
    }, 2000);
  };

  // Loading
  if (generateQuizMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-700">Generating your quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Player
  if (quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
        <OfflineSyncManager />
        <BibleQuizPlayer quiz={quizData} onComplete={handleQuizComplete} />
      </div>
    );
  }

  // Mode Selection
  if (mode === QUIZ_MODES.SELECT) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
        <OfflineSyncManager />
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
              <Zap className="w-4 h-4" /> Daily Challenge
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bible Quiz</h1>
            <p className="text-gray-600">Test your knowledge with AI-generated questions</p>
          </div>

          {/* Standalone Daily Quiz */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Daily Standalone Quiz</h2>
            {todayQuiz ? (
              <Card className="p-6 bg-white border-indigo-200">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-indigo-600 font-semibold mb-1">Today's Challenge</p>
                    <p className="font-semibold text-gray-900 mb-1">{todayQuiz.reference}</p>
                    <p className="text-sm text-gray-600">{todayQuiz.questions.length} questions</p>
                  </div>
                  <Button onClick={handleStartStandalone} className="bg-indigo-600 hover:bg-indigo-700">
                    <Sparkles className="w-4 h-4 mr-2" /> Start Quiz
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <Button onClick={handleStartStandalone} className="w-full bg-indigo-600 hover:bg-indigo-700 py-6">
                  <Sparkles className="w-5 h-5 mr-2" /> Generate Daily Quiz
                </Button>
              </Card>
            )}
          </div>

          {/* Plan-Based Quizzes */}
          {plans && plans.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Quiz from Your Reading Plans</h2>
              <div className="space-y-3">
                {plans.map(plan => (
                  <Card key={plan.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">From Your Plan</p>
                        <p className="font-semibold text-gray-900">{plan.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{plan.days?.length || 0} readings · {Math.round((plan.completed_days || 0) / (plan.days?.length || 1) * 100)}% complete</p>
                      </div>
                      <Button
                        onClick={() => handleStartPlanBased(plan)}
                        disabled={generateQuizMutation.isPending}
                        variant="outline"
                      >
                        <BookOpen className="w-4 h-4 mr-2" /> Quiz
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(!plans || plans.length === 0) && (
            <Card className="p-6 bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900 font-semibold mb-2">No reading plans yet</p>
              <p className="text-sm text-amber-700">Create a reading plan to generate quizzes based on your studies.</p>
            </Card>
          )}
        </div>
      </div>
    );
  }
}