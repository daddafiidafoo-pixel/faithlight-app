import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import LearningPathProgressTracker from '../components/learning/LearningPathProgressTracker';
import CourseCard from '../components/CourseCard';

export default function LearningPathDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const pathId = urlParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.log('Not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: path, isLoading: pathLoading } = useQuery({
    queryKey: ['learning-path', pathId],
    queryFn: async () => {
      const paths = await base44.entities.LearningPath.filter({ id: pathId });
      return paths?.[0] || null;
    },
    enabled: !!pathId,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-path-progress', user?.id, pathId],
    queryFn: async () => {
      if (!user?.id) return null;
      const enrollments = await base44.entities.UserLearningPath.filter({
        user_id: user.id,
        path_id: pathId,
      });
      return enrollments?.[0] || null;
    },
    enabled: !!user?.id && !!pathId,
  });

  const { data: pathCourses = [] } = useQuery({
    queryKey: ['path-courses', pathId],
    queryFn: async () => {
      const maps = await base44.entities.PathCourse.filter({ path_id: pathId });
      return (maps || []).sort((a, b) => (a.order_in_path || 0) - (b.order_in_path || 0));
    },
    enabled: !!pathId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['path-course-details', pathId],
    queryFn: async () => {
      if (pathCourses.length === 0) return [];
      const courseIds = pathCourses.map(pc => pc.course_id);
      const courseDetails = await Promise.all(
        courseIds.map(cId =>
          base44.entities.Course.filter({ id: cId }).then(r => r?.[0])
        )
      );
      return courseDetails.filter(Boolean);
    },
    enabled: pathCourses.length > 0,
  });

  const { data: userCourseProgress = [] } = useQuery({
    queryKey: ['user-course-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const progress = await base44.entities.UserCourseProgress.filter({ user_id: user.id });
      return progress || [];
    },
    enabled: !!user?.id,
  });

  if (pathLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading learning path...</p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Learning path not found</p>
      </div>
    );
  }

  const completedCourses = courses.filter(c =>
    userCourseProgress.some(p => p.course_id === c.id && p.status === 'completed')
  );

  const currentCourseIndex = pathCourses.findIndex(pc =>
    !userCourseProgress.some(p => p.course_id === pc.course_id && p.status === 'completed')
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {path.cover_image_url && (
          <div className="h-64 rounded-xl overflow-hidden mb-8">
            <img src={path.cover_image_url} alt={path.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="capitalize bg-indigo-100 text-indigo-800">{path.difficulty}</Badge>
            {path.category && <Badge variant="outline">{path.category}</Badge>}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{path.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{path.description}</p>

          {/* Path Meta */}
          <div className="flex flex-wrap gap-6 text-gray-700">
            {path.estimated_hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>{path.estimated_hours} hours</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>{courses.length} courses</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Objectives */}
            {path.learning_objectives && path.learning_objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {path.learning_objectives.map((obj, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                        <span className="text-gray-700">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Courses */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Path Courses</h2>
              <div className="space-y-4">
                {courses.map((course, index) => {
                  const pathCourse = pathCourses[index];
                  const isCompleted = completedCourses.some(c => c.id === course.id);
                  const isCurrent = index === currentCourseIndex;

                  return (
                    <div key={course.id} className={`opacity-${isCompleted || isCurrent ? '100' : '75'}`}>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="font-bold text-indigo-600 pt-1">{index + 1}.</div>
                        <div className="flex-1">
                          {pathCourse?.is_required ? (
                            <Badge className="bg-red-100 text-red-800 text-xs mb-1">Required</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 text-xs mb-1">Optional</Badge>
                          )}
                        </div>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        )}
                      </div>
                      <CourseCard
                        course={course}
                        lessonCount={course.lesson_count || 0}
                        showProgress={false}
                        showInstructor={true}
                      />
                      {isCurrent && (
                        <Link to={createPageUrl(`TrainingCourse?id=${course.id}`)}>
                          <Button className="w-full mt-2 gap-2">
                            Continue This Course
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {user && userProgress && (
            <div>
              <LearningPathProgressTracker
                path={path}
                userProgress={userProgress}
                courses={pathCourses}
                completedCourses={completedCourses}
                currentCourseIndex={currentCourseIndex}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}