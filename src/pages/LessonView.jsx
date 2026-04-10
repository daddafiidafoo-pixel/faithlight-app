import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { BookOpen, ArrowRight, CheckCircle2, Download, Trash2, WifiOff, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { OfflineStorage } from '../components/OfflineStorage';
import RelatedContent from '../components/discovery/RelatedContent';
import CourseForumBrowser from '../components/forum/CourseForumBrowser';
import CourseForumTopicView from '../components/forum/CourseForumTopicView';

export default function LessonView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [selectedForumTopic, setSelectedForumTopic] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  // Track time spent on lesson
  useEffect(() => {
    if (user && lessonId) {
      setStartTime(Date.now());
      
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - Date.now()) / 1000));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [user, lessonId]);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      // Try offline first
      const offlineLesson = OfflineStorage.getLesson(lessonId);
      if (offlineLesson) {
        setIsOfflineMode(true);
        return offlineLesson;
      }
      // Fetch from server
      return base44.entities.Lesson.filter({ id: lessonId }).then(r => r[0]);
    },
    enabled: !!lessonId,
  });

  // Check if lesson is downloaded
  useEffect(() => {
    if (lessonId) {
      setIsDownloaded(OfflineStorage.isLessonOffline(lessonId));
    }
  }, [lessonId]);

  const { data: quiz } = useQuery({
    queryKey: ['lesson-quiz', lessonId],
    queryFn: () => base44.entities.Quiz.filter({ lesson_id: lessonId }).then(r => r[0]),
    enabled: !!lessonId,
  });

  const { data: progress } = useQuery({
    queryKey: ['lesson-progress', user?.id, lessonId],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: user.id, lesson_id: lessonId }).then(r => r[0]),
    enabled: !!user && !!lessonId,
  });

  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      
      if (!progress) {
        await base44.entities.UserProgress.create({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          completed: true,
          completed_date: new Date().toISOString(),
          started_date: new Date(startTime || Date.now()).toISOString(),
          time_spent_seconds: timeSpent,
        });
      } else if (!progress.completed) {
        const existingTime = progress.time_spent_seconds || 0;
        await base44.entities.UserProgress.update(progress.id, {
          completed: true,
          completed_date: new Date().toISOString(),
          time_spent_seconds: existingTime + timeSpent,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-progress']);
      queryClient.invalidateQueries(['user-progress']);
      if (quiz) {
        navigate(createPageUrl(`QuizView?id=${quiz.id}&lesson_id=${lessonId}`));
      }
    },
  });

  const handleCompleteLesson = () => {
    if (!quiz) {
      alert('No quiz available for this lesson');
      return;
    }
    completeLessonMutation.mutate();
  };

  const handleDownloadToggle = () => {
    if (isDownloaded) {
      if (confirm('Remove this lesson from offline storage?')) {
        OfflineStorage.removeLesson(lessonId);
        setIsDownloaded(false);
      }
    } else {
      OfflineStorage.saveLesson(lesson);
      setIsDownloaded(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson || lesson.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Lesson not found or not available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-indigo-100 text-indigo-800">{lesson.language}</Badge>
                  {progress?.completed && (
                    <Badge className="bg-green-100 text-green-800 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </Badge>
                  )}
                  {isOfflineMode && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1">
                      <WifiOff className="w-3 h-3" />
                      Offline Mode
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-2">{lesson.title}</CardTitle>
                {lesson.scripture_references && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{lesson.scripture_references}</span>
                  </div>
                )}
              </div>
              <Button
                variant={isDownloaded ? "outline" : "default"}
                size="sm"
                onClick={handleDownloadToggle}
                className="gap-2 flex-shrink-0"
              >
                {isDownloaded ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove Offline
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-12">
            {/* Tabs for Content and Forum */}
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="forum" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Discussions
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                {lesson.objectives && (
                  <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Learning Objectives</h3>
                    <p className="text-blue-800 text-sm">{lesson.objectives}</p>
                  </div>
                )}

                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-8">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-6">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-4">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
                      ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>,
                      ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 italic text-gray-700 bg-indigo-50 py-2">
                          {children}
                        </blockquote>
                      ),
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    }}
                  >
                    {lesson.content}
                  </ReactMarkdown>
                </div>

                <div className="mt-12 pt-8 border-t">
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleCompleteLesson}
                      disabled={completeLessonMutation.isPending}
                      size="lg"
                      className="gap-2"
                    >
                      {completeLessonMutation.isPending ? 'Processing...' : 'Complete & Take Quiz'}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Forum Tab */}
              <TabsContent value="forum" className="space-y-6">
                {selectedForumTopic ? (
                  <CourseForumTopicView
                    topicId={selectedForumTopic}
                    courseId={lesson.course_id}
                    userId={user?.id}
                    userRole={user?.user_role}
                    onBackClick={() => setSelectedForumTopic(null)}
                  />
                ) : (
                  <CourseForumBrowser
                    courseId={lesson.course_id}
                    lessonId={lessonId}
                    userId={user?.id}
                    userRole={user?.user_role}
                    onSelectTopic={setSelectedForumTopic}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Content */}
        <RelatedContent currentItem={lesson} type="lesson" />
      </div>
    </div>
  );
}