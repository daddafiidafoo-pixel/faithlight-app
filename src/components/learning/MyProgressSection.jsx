import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProgressBar from '../course/ProgressBar';

export default function MyProgressSection({ userId }) {
  const { data: courseProgress = [], isLoading } = useQuery({
    queryKey: ['my-course-progress', userId],
    queryFn: async () => {
      if (!userId || !base44?.entities?.UserCourseProgress) return [];
      try {
        const progress = await base44.entities.UserCourseProgress.filter({ user_id: userId }, '-created_date');
        if (!progress || progress.length === 0) return [];

        // Enrich with course data
        const enrichedProgress = await Promise.all(
          progress.map(async (p) => {
            try {
              const courses = await base44.entities.Course.list('-created_date', 200);
              const course = courses?.find(c => c.id === p.course_id);
              return { ...p, course };
            } catch (err) {
              return p;
            }
          })
        );
        return enrichedProgress;
      } catch (err) {
        console.warn('[MyProgressSection] Failed to load progress:', err);
        return [];
      }
    },
    enabled: !!userId,
    retry: false,
  });

  if (isLoading) {
    return <div className="text-center py-6 text-gray-500">Loading your progress...</div>;
  }

  if (courseProgress.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-indigo-400 mb-3" />
          <p className="text-gray-600 mb-4">No enrolled courses yet. Start learning today!</p>
          <Link to={createPageUrl('ExploreCourses')}>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Explore Courses</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const completedCourses = courseProgress.filter(p => p.status === 'completed').length;
  const inProgressCourses = courseProgress.filter(p => p.status === 'in_progress').length;
  const totalProgress = courseProgress.length > 0 
    ? Math.round(courseProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / courseProgress.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCourses}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCourses}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-indigo-600">{totalProgress}%</p>
              </div>
              <Zap className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrolled</p>
                <p className="text-2xl font-bold text-purple-600">{courseProgress.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Cards */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Courses</h3>
        <div className="space-y-4">
          {courseProgress.map((progress) => (
            <Card key={progress.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{progress.course?.title || 'Untitled Course'}</h4>
                      <Badge className={
                        progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                        progress.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {progress.status === 'completed' ? 'Completed' :
                         progress.status === 'in_progress' ? 'In Progress' :
                         'Not Started'}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{progress.progress_percentage || 0}%</span>
                      </div>
                      <ProgressBar percentage={progress.progress_percentage || 0} height="h-2" />
                    </div>

                    {/* Lesson Info */}
                    <p className="text-sm text-gray-600">
                      {progress.lessons_completed || 0} of {progress.total_lessons || 0} lessons completed
                    </p>

                    {/* Dates */}
                    {progress.started_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Started {new Date(progress.started_at).toLocaleDateString()}
                        {progress.completed_at && ` · Completed ${new Date(progress.completed_at).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link to={createPageUrl(`TrainingCourse?id=${progress.course_id}`)}>
                    <Button 
                      variant={progress.status === 'completed' ? 'outline' : 'default'}
                      className="whitespace-nowrap"
                    >
                      {progress.status === 'completed' ? 'Review' : 'Continue'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}