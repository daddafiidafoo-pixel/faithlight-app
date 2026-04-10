import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, BarChart3, Users, Star, AlertCircle } from 'lucide-react';
import CourseEnrollmentStats from '../components/instructor/CourseEnrollmentStats';
import LessonPerformanceAnalyzer from '../components/instructor/LessonPerformanceAnalyzer';
import StudentProgressOverview from '../components/instructor/StudentProgressOverview';
import ReviewsAnalyticsSummary from '../components/instructor/ReviewsAnalyticsSummary';

export default function InstructorCourseManagement() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          window.location.href = '/';
          return;
        }

        if (!['teacher', 'pastor', 'admin'].includes(currentUser.user_role)) {
          window.location.href = '/';
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.log('Not logged in');
        window.location.href = '/';
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Get instructor's courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['instructor-courses', user?.id],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.filter(
        { instructor_id: user.id },
        '-created_date'
      );
      return allCourses || [];
    },
    enabled: !!user,
  });

  // Get analytics for selected course
  const { data: analytics = null, isLoading: analyticsLoading } = useQuery({
    queryKey: ['course-analytics', selectedCourse?.id],
    queryFn: async () => {
      const result = await base44.functions.invoke('courseAnalyticsAggregator', {
        action: 'get_course_analytics',
        courseId: selectedCourse.id,
      });
      return result.data;
    },
    enabled: !!selectedCourse,
  });

  if (isLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">You haven't created any courses yet</p>
              <Button className="gap-2">Create Your First Course</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Set default selected course
  if (!selectedCourse && courses.length > 0) {
    setSelectedCourse(courses[0]);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10" />
            Course Management Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Monitor enrollment, student progress, and course performance
          </p>
        </div>

        {/* Course Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Course
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedCourse?.id === course.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                <p className="text-xs text-gray-600 mt-1">{course.category}</p>
                {selectedCourse?.id === course.id && (
                  <div className="mt-2 text-indigo-600 text-xs font-semibold">✓ Selected</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Tabs */}
        {selectedCourse && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Lessons</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
            </TabsList>

            {analyticsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            ) : analytics ? (
              <>
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <CourseEnrollmentStats enrollment={analytics.enrollment} />
                  <StudentProgressOverview students={analytics.top_students} />
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enrollment Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: 'Completed', value: analytics.enrollment.completed, color: 'bg-green-500' },
                          { label: 'In Progress', value: analytics.enrollment.in_progress, color: 'bg-blue-500' },
                          { label: 'Not Started', value: analytics.enrollment.not_started, color: 'bg-gray-300' },
                        ].map((item) => {
                          const percent = analytics.enrollment.total > 0
                            ? (item.value / analytics.enrollment.total) * 100
                            : 0;
                          return (
                            <div key={item.label}>
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                                <p className="text-sm text-gray-600">
                                  {item.value} ({Math.round(percent)}%)
                                </p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all ${item.color}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Lessons Tab */}
                <TabsContent value="lessons" className="space-y-6">
                  <LessonPerformanceAnalyzer
                    lessons={analytics.lessons}
                    lowPerforming={analytics.low_performing_lessons}
                  />
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                  <ReviewsAnalyticsSummary reviews={analytics.reviews} />
                </TabsContent>
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">No analytics data available</p>
                </CardContent>
              </Card>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}