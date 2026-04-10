import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlayCircle, CheckCircle, MessageCircle } from 'lucide-react';
import ProgressBar from '../components/course/ProgressBar';
import CourseContentBrowser from '../components/course/CourseContentBrowser';
import CourseForumBrowser from '../components/forum/CourseForumBrowser';
import CourseForumTopicView from '../components/forum/CourseForumTopicView';
import { getUserEnrolledCoursesWithProgress, getCourseLessonProgress } from '../functions/courseProgressManager';

export default function MyEnrolledCourses() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCoursesWithLessons, setEnrolledCoursesWithLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForumTopics, setSelectedForumTopics] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  // Load enrolled courses and their lessons
  useEffect(() => {
    const loadEnrolledCourses = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const enrolledProgress = await getUserEnrolledCoursesWithProgress(user.id);

        // For each enrolled course, fetch course details and lesson progress
        const coursesWithDetails = await Promise.all(
          enrolledProgress.map(async (progress) => {
            const courseData = await base44.entities.Course.filter(
              { id: progress.course_id },
              null,
              1
            );
            const course = courseData?.[0];

            const lessonProgress = await getCourseLessonProgress(user.id, progress.course_id);

            return {
              ...progress,
              course,
              lessonProgress,
            };
          })
        );

        setEnrolledCoursesWithLessons(coursesWithDetails);
      } catch (error) {
        console.error('Error loading enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrolledCourses();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-600">Track your progress through enrolled courses</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
          </div>
        ) : enrolledCoursesWithLessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <PlayCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
              <Link to={createPageUrl('ExploreCourses')}>
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={enrolledCoursesWithLessons[0]?.course.id} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-white border-b border-gray-200 rounded-none p-0 h-auto">
              {enrolledCoursesWithLessons.map((enrollment) => (
                <TabsTrigger
                  key={enrollment.course.id}
                  value={enrollment.course.id}
                  className="flex-1 min-w-max rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 px-4 py-3"
                >
                  <div className="text-left">
                    <p className="font-semibold text-sm">{enrollment.course.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {enrollment.progress_percentage}% complete
                    </p>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {enrolledCoursesWithLessons.map((enrollment) => {
              const course = enrollment.course;
              const nextIncompleteLesson = enrollment.lessonProgress?.find(
                (lp) => lp.status !== 'completed'
              );

              return (
                <TabsContent key={course.id} value={course.id} className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Course Header */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                          <p className="text-gray-600">{course.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {course.estimated_hours && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Duration:</span> {course.estimated_hours} hours
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Level:</span> {course.difficulty}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Course Materials */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Materials & Lessons</h2>
                        <CourseContentBrowser courseId={course.id} enrollmentStatus="enrolled" />
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                      {/* Forum Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Course Discussions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedForumTopics[course.id] ? (
                            <div className="space-y-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedForumTopics({
                                    ...selectedForumTopics,
                                    [course.id]: null,
                                  })
                                }
                              >
                                ← Back to Forum
                              </Button>
                              <CourseForumTopicView
                                topicId={selectedForumTopics[course.id]}
                                courseId={course.id}
                                userId={user?.id}
                                userRole={user?.user_role}
                                onBackClick={() =>
                                  setSelectedForumTopics({
                                    ...selectedForumTopics,
                                    [course.id]: null,
                                  })
                                }
                              />
                            </div>
                          ) : (
                            <CourseForumBrowser
                              courseId={course.id}
                              userId={user?.id}
                              userRole={user?.user_role}
                              onSelectTopic={(topicId) =>
                                setSelectedForumTopics({
                                  ...selectedForumTopics,
                                  [course.id]: topicId,
                                })
                              }
                            />
                          )}
                        </CardContent>
                      </Card>

                      {/* Progress Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Your Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Overall</span>
                              <span className="font-semibold">{enrollment.progress_percentage}%</span>
                            </div>
                            <ProgressBar percentage={enrollment.progress_percentage} height="h-3" />
                          </div>

                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Lessons</span>
                              <span className="font-semibold">
                                {enrollment.lessons_completed}/{enrollment.total_lessons}
                              </span>
                            </div>
                            <Badge
                              variant={
                                enrollment.status === 'completed'
                                  ? 'default'
                                  : enrollment.status === 'in_progress'
                                    ? 'outline'
                                    : 'secondary'
                              }
                              className="w-full text-center"
                            >
                              {enrollment.status === 'completed' && 'Completed'}
                              {enrollment.status === 'in_progress' && 'In Progress'}
                              {enrollment.status === 'not_started' && 'Not Started'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      {nextIncompleteLesson && (
                        <Link
                          to={createPageUrl(
                            `LessonView?lessonId=${nextIncompleteLesson.lesson_id}`
                          )}
                        >
                          <Button className="w-full gap-2">
                            <PlayCircle className="w-4 h-4" />
                            Resume Course
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}