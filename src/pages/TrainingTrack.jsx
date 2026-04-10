import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function TrainingTrack() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: track } = useQuery({
    queryKey: ['training-track', trackId],
    queryFn: async () => {
      const tracks = await base44.entities.TrainingTrack.filter({ id: trackId });
      return tracks[0];
    },
    enabled: !!trackId,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['training-courses', trackId],
    queryFn: () => base44.entities.TrainingCourse.filter({ track_id: trackId }, 'order'),
    enabled: !!trackId,
  });

  // Filter to only published courses for non-admin users
  const courses = user?.user_role === 'admin' 
    ? allCourses 
    : allCourses.filter(c => c.status === 'published');

  const { data: progress = [] } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: () => base44.entities.UserTrainingProgress.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['quiz-results', user?.id],
    queryFn: () => base44.entities.UserQuizResult.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const getCourseProgress = (courseId) => {
    const completedLessons = progress.filter(p => p.course_id === courseId && p.completed).length;
    return completedLessons;
  };

  const hasPassedQuiz = (courseId) => {
    return quizResults.some(r => r.course_id === courseId && r.passed);
  };

  if (!track) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl('TrainingHome')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Training
          </Button>
        </Link>

        {/* Track Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{track.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{track.name}</h1>
              <Badge className="mt-2">Level {track.level}</Badge>
            </div>
          </div>
          <p className="text-lg text-gray-600">{track.description}</p>
        </div>

        {/* Courses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Courses</h2>
          {courses.map((course, index) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{course.title}</h3>
                        {hasPassedQuiz(course.id) && (
                          <Badge className="bg-green-600 mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3 ml-13">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.estimated_hours || 2} hours
                      </span>
                      <span>Pass score: {course.pass_score}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link to={createPageUrl('TrainingCourse') + `?id=${course.id}`}>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        {getCourseProgress(course.id) > 0 ? 'Continue' : 'Start Course'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Requirements */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Certificate Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Complete 100% of required lessons</li>
              <li>✅ Pass each course quiz with {courses[0]?.pass_score || 80}%+</li>
              <li>✅ Submit your full name for the certificate</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}