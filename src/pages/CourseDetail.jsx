import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star } from 'lucide-react';
import CourseReviewForm from '../components/course/CourseReviewForm';
import CourseReviewsDisplay from '../components/instructor/InstructorReviewDashboard';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle2, Award, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import LessonCard from '../components/LessonCard';
import RelatedContent from '../components/discovery/RelatedContent';

export default function CourseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Auto-enroll user in course
        if (currentUser && courseId) {
          const enrollments = await base44.entities.CourseEnrollment.filter({
            user_id: currentUser.id,
            course_id: courseId
          });
          
          if (enrollments.length === 0) {
            await base44.entities.CourseEnrollment.create({
              user_id: currentUser.id,
              course_id: courseId,
              enrolled_date: new Date().toISOString(),
              progress_percentage: 0
            });
          }
        }
      } catch (error) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, [courseId]);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }).then(r => r[0]),
    enabled: !!courseId,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      const allLessons = await base44.entities.Lesson.filter({ 
        course_id: courseId, 
        status: 'approved' 
      });
      return allLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },
    enabled: !!courseId,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: () => user ? base44.entities.UserProgress.filter({ user_id: user.id, course_id: courseId }) : [],
    enabled: !!user && !!courseId,
  });

  const isLessonCompleted = (lessonId) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Course Header */}
        {course.image_url && (
          <div className="h-64 rounded-xl overflow-hidden mb-8">
            <img 
              src={course.image_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-indigo-100 text-indigo-800">{course.language}</Badge>
            <Badge variant="outline">{course.difficulty}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{course.description}</p>

          {/* Instructor Card */}
          {course.instructor_id && (
            <Card className="bg-indigo-50 border-indigo-200 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taught by</p>
                      <p className="text-lg font-semibold text-gray-900">{course.instructor_name}</p>
                    </div>
                  </div>
                  <Link to={createPageUrl(`InstructorProfile?id=${course.instructor_id}`)}>
                    <Button variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Card */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {completedCount} of {lessons.length} lessons completed
                </span>
                <span className="font-semibold text-indigo-600">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Course Lessons
          </h2>
          {lessonsLoading ? (
            <p className="text-gray-600">Loading lessons...</p>
          ) : lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No lessons available in this course yet
              </CardContent>
            </Card>
          ) : (
            lessons.map((lesson, index) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                completed={isLessonCompleted(lesson.id)}
                index={index + 1}
              />
            ))
          )}
        </div>

        {/* Reviews Section */}
        <div className="space-y-6 mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6" />
            Student Reviews
          </h2>

          {/* Review Form - only show if user completed course */}
          {user && (
            <CourseReviewForm
              courseId={courseId}
              instructorId={course.instructor_id}
              userName={user.full_name}
              onSuccess={() => {
                // Optionally show success message or scroll to reviews
              }}
            />
          )}

          {/* Reviews Display */}
          <CourseReviewsDisplay courseId={courseId} />
        </div>

        {/* Related Content */}
        <RelatedContent currentItem={course} type="course" />
      </div>
    </div>
  );
}