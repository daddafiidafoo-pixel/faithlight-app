import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InstructorCourseOverview({ userId, onSelectCourse }) {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses', userId],
    queryFn: async () => {
      const result = await base44.entities.Course.filter(
        { teacher_id: userId, published: true },
        '-created_date',
        100
      );
      return result;
    },
    enabled: !!userId,
  });

  // Fetch enrollment counts
  const { data: enrollments } = useQuery({
    queryKey: ['course-enrollments', courses],
    queryFn: async () => {
      if (!courses?.length) return {};
      const enrollmentMap = {};
      await Promise.all(
        courses.map(async (course) => {
          const count = await base44.entities.CourseEnrollment.filter(
            { course_id: course.id },
            null,
            100
          );
          enrollmentMap[course.id] = count.length;
        })
      );
      return enrollmentMap;
    },
    enabled: !!courses?.length,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">Loading courses...</span>
        </CardContent>
      </Card>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No courses yet</p>
          <Link to={createPageUrl('CourseBuilder')}>
            <Button className="gap-2">
              <BookOpen className="w-4 h-4" />
              Create Your First Course
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {courses.map((course) => {
        const enrollmentCount = enrollments?.[course.id] || 0;
        return (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {course.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="font-bold text-gray-900">{enrollmentCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-bold text-gray-900">
                      {course.estimated_hours}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectCourse(course.id)}
                >
                  View Details
                </Button>
                <Link to={createPageUrl(`CourseBuilder?courseId=${course.id}`)}>
                  <Button size="sm" className="flex-1">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}