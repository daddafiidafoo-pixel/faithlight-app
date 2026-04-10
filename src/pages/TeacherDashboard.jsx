import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlusCircle, BookMarked, Clock, CheckCircle2, XCircle, Edit, Sparkles, BarChart3, AlertCircle, BookOpen, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import LessonAnalytics from '../components/teacher/LessonAnalytics';
import QuizInsights from '../components/teacher/QuizInsights';
import AIInsights from '../components/teacher/AIInsights';
import InstructorCourseOverview from '../components/teacher/InstructorCourseOverview';
import CourseContentManager from '../components/teacher/CourseContentManager';
import StudentProgressView from '../components/teacher/StudentProgressView';
import LessonReviewPanel from '../components/teacher/LessonReviewPanel';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson_, setSelectedLesson_] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.user_role !== 'teacher' && currentUser.user_role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: myLessons = [], isLoading } = useQuery({
    queryKey: ['teacher-lessons', user?.id],
    queryFn: () => base44.entities.Lesson.filter({ teacher_id: user.id }),
    enabled: !!user,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-user-progress'],
    queryFn: () => base44.entities.UserProgress.list(),
    enabled: !!user,
  });

  const { data: allQuizAttempts = [] } = useQuery({
    queryKey: ['all-quiz-attempts'],
    queryFn: () => base44.entities.QuizAttempt.list(),
    enabled: !!user,
  });

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list(),
    enabled: !!user,
  });

  const { data: allQuizQuestions = [] } = useQuery({
    queryKey: ['all-quiz-questions'],
    queryFn: () => base44.entities.QuizQuestion.list(),
    enabled: !!user,
  });

  const draftLessons = myLessons.filter(l => l.status === 'draft');
  const pendingLessons = myLessons.filter(l => l.status === 'pending');
  const approvedLessons = myLessons.filter(l => l.status === 'approved');
  const rejectedLessons = myLessons.filter(l => l.status === 'rejected');

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    draft: Edit,
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  };

  const LessonCard = ({ lesson }) => {
    const Icon = statusIcons[lesson.status];
    const lessonProgress = allProgress.filter(p => p.lesson_id === lesson.id);
    const studentsEngaged = lessonProgress.length;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[lesson.status]}>
                  <Icon className="w-3 h-3 mr-1" />
                  {lesson.status}
                </Badge>
                <Badge variant="outline">{lesson.language_code}</Badge>
              </div>
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              {lesson.scripture_references && (
                <p className="text-sm text-gray-600 mt-2">{lesson.scripture_references}</p>
              )}
              {lesson.status === 'approved' && studentsEngaged > 0 && (
                <p className="text-xs text-green-700 font-medium mt-2">
                  👥 {studentsEngaged} students engaged
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lesson.status === 'rejected' && lesson.admin_feedback && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-3">
              <p className="text-sm font-semibold text-red-900 mb-1">Admin Feedback:</p>
              <p className="text-sm text-red-800">{lesson.admin_feedback}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Link to={createPageUrl(`CreateLesson?id=${lesson.id}`)} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </Link>
            {lesson.status === 'approved' && studentsEngaged > 0 && (
              <Button 
                variant="default" 
                size="sm" 
                className="gap-1"
                onClick={() => setSelectedLesson(lesson)}
              >
                <BarChart3 className="w-3 h-3" />
                Analytics
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (selectedLesson) {
    const lessonQuiz = allQuizzes.find(q => q.lesson_id === selectedLesson.id);
    const lessonQuizQuestions = lessonQuiz 
      ? allQuizQuestions.filter(q => q.quiz_id === lessonQuiz.id)
      : [];
    const lessonQuizAttempts = lessonQuiz
      ? allQuizAttempts.filter(a => a.quiz_id === lessonQuiz.id)
      : [];
    const lessonProgress = allProgress.filter(p => p.lesson_id === selectedLesson.id);

    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedLesson(null)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">{selectedLesson.title}</h1>
            <p className="text-gray-600 mt-2">Student Analytics & AI Insights</p>
          </div>

          <div className="space-y-6">
            <LessonAnalytics 
              lesson={selectedLesson}
              progress={lessonProgress}
              quizAttempts={lessonQuizAttempts}
            />

            {lessonQuizQuestions.length > 0 && (
              <QuizInsights 
                quizQuestions={lessonQuizQuestions}
                quizAttempts={lessonQuizAttempts}
                quiz={lessonQuiz}
              />
            )}

            {lessonProgress.length >= 3 && (
              <AIInsights 
                lesson={selectedLesson}
                quizQuestions={lessonQuizQuestions}
                quizAttempts={lessonQuizAttempts}
                userProgress={lessonProgress}
              />
            )}

            {lessonProgress.length < 3 && (
              <Card className="border-gray-200">
                <CardContent className="py-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Not enough data for AI insights</p>
                  <p className="text-sm mt-1">At least 3 students need to engage with this lesson</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Dashboard</h1>
            <p className="text-gray-600">Manage courses, materials, and student progress</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to={createPageUrl('CourseBuilder')}>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90">
                <BookOpen className="w-5 h-5" />
                Create Course
              </Button>
            </Link>
            <Link to={createPageUrl('CreateLesson')}>
              <Button size="lg" variant="outline" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Add Lesson
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <BookMarked className="w-4 h-4" />
              <span className="hidden sm:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Review</span>
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {selectedCourse ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                  className="mb-4"
                >
                  ← Back to Courses
                </Button>
                <Card>
                  <CardHeader>
                    <CardTitle>Course Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StudentProgressView courseId={selectedCourse} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <InstructorCourseOverview
                userId={user?.id}
                onSelectCourse={setSelectedCourse}
              />
            )}
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            {selectedCourse && selectedLesson_ ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCourse(null);
                    setSelectedLesson_(null);
                  }}
                  className="mb-4"
                >
                  ← Back
                </Button>
                <CourseContentManager
                  courseId={selectedCourse}
                  lessonId={selectedLesson_}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookMarked className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Select a course and lesson to manage materials
                  </p>
                  <Button onClick={() => setSelectedCourse('select')}>
                    Select Course
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Student Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {selectedCourse && selectedCourse !== 'select' ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                  className="mb-4"
                >
                  ← Back to Courses
                </Button>
                <StudentProgressView courseId={selectedCourse} />
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Select a course to view student progress
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Lesson Review Tab */}
          <TabsContent value="review" className="space-y-6">
            {selectedCourse && selectedCourse !== 'select' ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                  className="mb-4"
                >
                  ← Back to Courses
                </Button>
                <LessonReviewPanel courseId={selectedCourse} />
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Select a course to review pending lessons
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}