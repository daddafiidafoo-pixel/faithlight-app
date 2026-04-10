import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSyncManager } from '@/components/offline/useSyncManager';
import SyncStatusIndicator from '@/components/offline/SyncStatusIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, BookOpen, Sparkles, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import AITutoringAssistant from '@/components/training/AITutoringAssistant';
import AIStudyRecommendations from '@/components/training/AIStudyRecommendations';
import AISummaryGenerator from '@/components/training/AISummaryGenerator';
import AIQuizGenerator from '@/components/training/AIQuizGenerator';
import AISupplementaryResources from '@/components/training/AISupplementaryResources';
import InteractiveLessonQuiz from '@/components/training/InteractiveLessonQuiz';

export default function TrainingLesson() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showTutor, setShowTutor] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMidQuiz, setShowMidQuiz] = useState(false);
  const [midQuizPassed, setMidQuizPassed] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const { isOnline, isSyncing, syncStatus, pendingCount, performSync, queueChange } = useSyncManager();
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');
  const selectedRole = urlParams.get('role') || 'general';

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Track reading progress and time spent
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setReadingProgress(Math.min(100, scrollPercentage));

      // Show mid-lesson quiz at 50% scroll
      if (scrollPercentage >= 50 && !showMidQuiz && !midQuizPassed) {
        setShowMidQuiz(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showMidQuiz, midQuizPassed]);

  // Track time spent on lesson
  useEffect(() => {
    return () => {
      if (user && lessonId) {
        const timeSpent = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
        base44.entities.UserLearningMetrics.create({
          user_id: user.id,
          lesson_id: lessonId,
          metric_type: 'time_spent',
          metric_value: timeSpent,
          metadata: {
            session_duration_minutes: timeSpent,
            time_of_day: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
          }
        }).catch(err => console.error('Failed to track time:', err));
      }
    };
  }, [user, lessonId, sessionStartTime]);

  const { data: lesson } = useQuery({
    queryKey: ['training-lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.TrainingLesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId,
  });

  const { data: progress } = useQuery({
    queryKey: ['lesson-progress', user?.id, lessonId],
    queryFn: async () => {
      const prog = await base44.entities.UserTrainingProgress.filter({
        user_id: user.id,
        lesson_id: lessonId,
      });
      return prog[0];
    },
    enabled: !!user && !!lessonId,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (progress) {
        return await base44.entities.UserTrainingProgress.update(progress.id, {
          completed: true,
          completed_at: new Date().toISOString(),
        });
      } else {
        return await base44.entities.UserTrainingProgress.create({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-progress']);
      queryClient.invalidateQueries(['user-course-progress']);
      toast.success('Lesson completed!');
    },
  });

  if (!lesson) return <div className="p-12 text-center">Loading...</div>;

  const isCompleted = progress?.completed;

  // Get role-specific content if available
  const getRoleContent = () => {
    if (selectedRole === 'general' || !lesson.audience_variants) {
      return null;
    }
    
    const roleKey = selectedRole;
    return lesson.audience_variants?.[roleKey];
  };

  const roleContent = getRoleContent();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <SyncStatusIndicator
            isOnline={isOnline}
            syncStatus={syncStatus}
            pendingCount={pendingCount}
            isDarkMode={isDarkMode}
            onSync={performSync}
            isSyncing={isSyncing}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">{lesson.title}</h1>
          </div>
          {isCompleted && (
            <Badge className="bg-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* Video */}
        {lesson.video_url && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reading Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Reading Progress</span>
            <span>{readingProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>

        {/* Mid-Lesson Quiz */}
        {showMidQuiz && !midQuizPassed && user && (
          <div className="mb-6">
            <InteractiveLessonQuiz
              lessonId={lessonId}
              lessonTitle={lesson.title}
              lessonContent={lesson.content}
              userId={user.id}
              quizType="mid"
              onComplete={(score, passed) => {
                if (passed) {
                  setMidQuizPassed(true);
                  setShowMidQuiz(false);
                }
              }}
              minPassScore={60}
            />
          </div>
        )}

        {/* Content */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <ReactMarkdown className="prose prose-lg max-w-none">
              {lesson.content}
            </ReactMarkdown>

            {/* Role-Specific Content */}
            {roleContent && (
              <div className="mt-8 pt-8 border-t">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 text-indigo-900">
                    🎯 For {selectedRole.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}s
                  </h3>
                  
                  {roleContent.examples && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Examples & Scenarios:</h4>
                      <div className="text-gray-700">
                        <ReactMarkdown>{roleContent.examples}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {roleContent.application_points && roleContent.application_points.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Practical Application:</h4>
                      <ul className="space-y-1">
                        {roleContent.application_points.map((point, idx) => (
                          <li key={idx} className="text-gray-700">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {roleContent.reflection_question && (
                    <div className="bg-white rounded-lg p-4 mt-4">
                      <h4 className="font-semibold mb-2">Reflection Question:</h4>
                      <p className="text-gray-700 italic">{roleContent.reflection_question}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scripture References */}
        {lesson.scripture_references && lesson.scripture_references.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">📖 Key Verses</h3>
              <div className="space-y-2">
                {lesson.scripture_references.map((ref, index) => (
                  <p key={index} className="text-gray-700">{ref}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* End-of-Lesson Quiz */}
        {user && !isCompleted && (
          <div className="mb-6">
            <InteractiveLessonQuiz
              lessonId={lessonId}
              lessonTitle={lesson.title}
              lessonContent={lesson.content}
              userId={user.id}
              quizType="end"
              onComplete={(score, passed) => {
                if (passed) {
                  markCompleteMutation.mutate();
                }
              }}
              minPassScore={70}
            />
          </div>
        )}

        {/* Complete Button (only if quiz passed) */}
        {!isCompleted && (
          <p className="text-sm text-gray-600 text-center py-4">
            Complete the quiz above with 70% or higher to finish this lesson.
          </p>
        )}
        </div>

        {/* Sidebar - AI Tools */}
        <div className="lg:col-span-1 space-y-6">
          {/* Completion Info */}
          {isCompleted && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-900">Lesson Completed!</p>
                  <p className="text-sm text-green-700">Keep up the great work 🎉</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Study Recommendations */}
          {user && lesson && (
            <AIStudyRecommendations 
              courseId={lesson.course_id}
              userId={user.id}
              userName={user.full_name}
            />
          )}

          {/* Summary Generator */}
          {lesson && (
            <AISummaryGenerator
              lessonTitle={lesson.title}
              lessonContent={lesson.content}
              courseId={lesson.course_id}
            />
          )}

          {/* Quiz Generator */}
           {lesson && (
             <AIQuizGenerator
               lessonTitle={lesson.title}
               lessonContent={lesson.content}
             />
           )}

           {/* Supplementary Resources */}
           {lesson && (
             <AISupplementaryResources
               lessonTitle={lesson.title}
               lessonContent={lesson.content}
               scriptureReferences={lesson.scripture_references}
             />
           )}

           {/* AI Tutor */}
          {user && lesson && (
            <div>
              <Button
                onClick={() => setShowTutor(!showTutor)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 mb-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showTutor ? 'Hide AI Tutor' : 'Ask AI Tutor'}
              </Button>

              {showTutor && (
                <AITutoringAssistant
                  lessonId={lessonId}
                  courseId={lesson.course_id}
                  userId={user.id}
                  userName={user.full_name}
                />
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}