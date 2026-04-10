import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp } from 'lucide-react';
import CourseAnalyticsDashboard from '@/components/analytics/CourseAnalyticsDashboard';
import StudentDetailedView from '@/components/analytics/StudentDetailedView';

export default function TeacherAnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || !['teacher', 'admin'].includes(currentUser.user_role)) {
          base44.auth.redirectToLogin();
          return;
        }
        setUser(currentUser);

        // Fetch instructor's courses
        const teacherCourses = await base44.entities.Course.filter(
          { instructor_id: currentUser.id },
          '-created_date',
          100
        );
        setCourses(teacherCourses || []);

        if (teacherCourses && teacherCourses.length > 0) {
          setSelectedCourse(teacherCourses[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unauthorized access</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You don't have any courses yet</p>
              <Button onClick={() => window.location.href = '/MyCourses'}>
                Create a Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">View student progress and course analytics</p>
        </div>

        {/* Course Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Course
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {courses.map((course) => (
              <Button
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course.id);
                  setSelectedStudent(null);
                }}
                variant={selectedCourse === course.id ? 'default' : 'outline'}
                className="whitespace-nowrap"
              >
                {course.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {selectedStudent ? (
          <StudentDetailedView
            studentId={selectedStudent}
            courseId={selectedCourse}
            onBack={() => setSelectedStudent(null)}
          />
        ) : (
          <CourseAnalyticsDashboard
            courseId={selectedCourse}
            onSelectStudent={setSelectedStudent}
          />
        )}
      </div>
    </div>
  );
}