import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, CheckCircle, Lock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import DetailedProgressTracker from '../components/training/DetailedProgressTracker';
import RoleSelector from '../components/training/RoleSelector';
import AIStudyGuideGenerator from '../components/training/AIStudyGuideGenerator';
import { toast } from 'sonner';

export default function TrainingCourse() {
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('general');
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: course } = useQuery({
    queryKey: ['training-course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.TrainingCourse.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  // Only show published courses to non-admin users
  useEffect(() => {
    if (course && course.status !== 'published' && user?.user_role !== 'admin') {
      toast.error('This course is not yet available');
      window.location.href = '/TrainingHome';
    }
  }, [course, user]);

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => base44.entities.TrainingLesson.filter({ course_id: courseId }, 'order'),
    enabled: !!courseId,
  });

  const { data: quiz } = useQuery({
    queryKey: ['course-quiz', courseId],
    queryFn: async () => {
      const quizzes = await base44.entities.TrainingQuiz.filter({ course_id: courseId });
      return quizzes[0];
    },
    enabled: !!courseId,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['user-course-progress', user?.id, courseId],
    queryFn: () => base44.entities.UserTrainingProgress.filter({ user_id: user.id, course_id: courseId }),
    enabled: !!user && !!courseId,
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['course-quiz-results', user?.id, courseId],
    queryFn: () => base44.entities.UserQuizResult.filter({ user_id: user.id, course_id: courseId }),
    enabled: !!user && !!courseId,
  });

  const { data: track } = useQuery({
    queryKey: ['course-track', course?.track_id],
    queryFn: async () => {
      const tracks = await base44.entities.TrainingTrack.filter({ id: course.track_id });
      return tracks[0];
    },
    enabled: !!course?.track_id,
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-training-role', user?.id, course?.track_id],
    queryFn: async () => {
      const roles = await base44.entities.UserTrainingRole.filter({ 
        user_id: user.id, 
        track_id: course.track_id 
      });
      return roles[0];
    },
    enabled: !!user && !!course?.track_id,
  });

  useEffect(() => {
    if (userRole) {
      setSelectedRole(userRole.selected_role);
    }
  }, [userRole]);

  const saveRoleMutation = useMutation({
    mutationFn: async (role) => {
      if (userRole) {
        await base44.entities.UserTrainingRole.update(userRole.id, { selected_role: role });
      } else {
        await base44.entities.UserTrainingRole.create({
          user_id: user.id,
          track_id: course.track_id,
          selected_role: role,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-training-role']);
      toast.success('Training role updated');
    },
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    saveRoleMutation.mutate(role);
  };

  const isLeadershipTrack = track?.track_type === 'leadership';

  const isLessonCompleted = (lessonId) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const allLessonsCompleted = lessons.length > 0 && lessons.every(l => isLessonCompleted(l.id));
  const hasPassedQuiz = quizResults.some(r => r.passed);
  const completedCount = progress.filter(p => p.completed).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  if (!course) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{course.description}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge>{lessons.length} lessons</Badge>
            <Badge variant="outline">{course.estimated_hours || 2} hours</Badge>
            <Badge variant="outline">Pass: {course.pass_score}%</Badge>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span className="font-medium">Course Progress</span>
              <span className="font-semibold">{completedCount} / {lessons.length} lessons ({Math.round(progressPercent)}%)</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>

        {/* Role Selector for Leadership Track */}
        {isLeadershipTrack && (
          <RoleSelector 
            selectedRole={selectedRole}
            onSelectRole={handleRoleSelect}
            trackName={course.title}
          />
        )}

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="lessons">
              <BookOpen className="w-4 h-4 mr-2" />
              Lessons & Quiz
            </TabsTrigger>
            <TabsTrigger value="study">
              <BookOpen className="w-4 h-4 mr-2" />
              Study Guide
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="w-4 h-4 mr-2" />
              My Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-8">
            {/* Lessons */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lessons</h2>
              {lessons.map((lesson, index) => (
                <Card key={lesson.id} className={isLessonCompleted(lesson.id) ? 'bg-green-50 border-green-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isLessonCompleted(lesson.id) ? 'bg-green-600 text-white' : 'bg-gray-200'
                        }`}>
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{lesson.title}</h3>
                          <p className="text-sm text-gray-600">{lesson.estimated_minutes} min</p>
                        </div>
                      </div>
                      <Link to={createPageUrl('TrainingLesson') + `?id=${lesson.id}&role=${selectedRole}`}>
                        <Button size="sm">
                          {isLessonCompleted(lesson.id) ? 'Review' : 'Start'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quiz */}
            {quiz && (
              <Card className={hasPassedQuiz ? 'bg-green-50 border-green-200' : allLessonsCompleted ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        hasPassedQuiz ? 'bg-green-600' : allLessonsCompleted ? 'bg-blue-600' : 'bg-gray-400'
                      } text-white`}>
                        {hasPassedQuiz ? <CheckCircle className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{quiz.title}</h3>
                        <p className="text-sm text-gray-600">{quiz.description}</p>
                        {hasPassedQuiz && (
                          <Badge className="bg-green-600 mt-1">Passed ✓</Badge>
                        )}
                      </div>
                    </div>
                    {allLessonsCompleted ? (
                      <Link to={createPageUrl('TrainingQuiz') + `?id=${quiz.id}&role=${selectedRole}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          {hasPassedQuiz ? 'Retake Quiz' : 'Start Quiz'}
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Locked
                      </Button>
                    )}
                  </div>
                  {!allLessonsCompleted && (
                    <p className="text-sm text-gray-600 mt-3">
                      Complete all lessons to unlock the quiz
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="study">
            <AIStudyGuideGenerator
              courseTitle={course.title}
              courseLessons={lessons}
            />
          </TabsContent>

          <TabsContent value="progress">
            <DetailedProgressTracker 
              lessons={lessons}
              progress={progress}
              quizResults={quizResults}
              course={course}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}