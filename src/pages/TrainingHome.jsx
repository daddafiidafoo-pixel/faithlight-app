import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Award, CheckCircle, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTranslation } from '../components/useTranslation';
import { seedHomeTrainingTranslations } from '../functions/seedHomeTrainingTranslations';
import ProgressVisualization from '@/components/gamification/ProgressVisualization';
import LeaderboardDisplay from '@/components/gamification/LeaderboardDisplay';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import PointsDisplay from '@/components/gamification/PointsDisplay';
import GlobalLeaderboard from '@/components/gamification/GlobalLeaderboard';

export default function TrainingHome() {
  const [user, setUser] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { t } = useTranslation(currentLanguage);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const langCode = currentUser.preferred_language_code || 'en';
        setCurrentLanguage(langCode);

        // Seed translations on first load
        try {
          await seedHomeTrainingTranslations();
        } catch (err) {
          console.log('Translations already seeded or error:', err);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: tracks = [] } = useQuery({
    queryKey: ['training-tracks'],
    queryFn: () => base44.entities.TrainingTrack.list('order', 50),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['user-training-progress', user?.id],
    queryFn: () => base44.entities.UserTrainingProgress.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['user-certificates', user?.id],
    queryFn: () => base44.entities.TrainingCertificate.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-training-courses'],
    queryFn: () => base44.entities.TrainingCourse.list('order'),
    enabled: !!user,
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-training-lessons'],
    queryFn: () => base44.entities.TrainingLesson.list(),
    enabled: !!user,
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['all-quiz-results', user?.id],
    queryFn: () => base44.entities.UserQuizResult.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const biblicalTracks = tracks.filter(t => t.track_type === 'biblical');
  const leadershipTracks = tracks.filter(t => t.track_type === 'leadership');

  const getCourseProgress = (courseId) => {
    const courseLessons = allLessons.filter(l => l.course_id === courseId);
    const completedInCourse = progress.filter(p => 
      p.course_id === courseId && p.completed
    ).length;
    return courseLessons.length > 0 
      ? (completedInCourse / courseLessons.length) * 100 
      : 0;
  };

  const inProgressCourses = allCourses.filter(course => {
    const percent = getCourseProgress(course.id);
    return percent > 0 && percent < 100;
  }).slice(0, 3);

  if (!user) return null;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#1E1B4B] rounded-2xl flex items-center justify-center shadow-xl">
              <GraduationCap className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <p className="text-xs tracking-widest uppercase text-amber-600 font-semibold mb-1">FaithLight Presents</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E1B4B] mb-2">Global Biblical</h1>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-3">Leadership Institute</h1>
          <p className="text-xs tracking-widest uppercase text-gray-400 font-semibold mb-6">Equipping Leaders for Christ</p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Grow in God's Word. Serve with wisdom. Lead with Christ.
          </p>
          <div className="max-w-3xl mx-auto bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <p className="text-gray-700 mb-3">
              {t('training.intro') || 'A structured, seminary-quality training program designed for believers worldwide. Each track leads to a verifiable certificate of completion.'}
            </p>
            <p className="text-indigo-700 font-semibold text-sm">
              🎯 Complete the modules, pass the final exam, and receive your GBLI certificate.
            </p>
          </div>
        </div>

        {/* Gamification Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <PointsDisplay userId={user?.id} />
          <div className="lg:col-span-2">
            <GlobalLeaderboard />
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <ProgressVisualization userId={user?.id} />
          </div>
          <div>
            <LeaderboardDisplay limit={5} />
          </div>
        </div>

        {/* Badges */}
        <div className="mb-12">
          <BadgeDisplay userId={user?.id} />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lessons Completed</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {progress.filter(p => p.completed).length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Certificates Earned</p>
                  <p className="text-3xl font-bold text-green-600">{certificates.length}</p>
                </div>
                <Award className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Courses In Progress</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {inProgressCourses.length}
                  </p>
                </div>
                <BookOpen className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* In Progress Courses */}
        {inProgressCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Continue Learning</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {inProgressCourses.map(course => {
                const courseLessons = allLessons.filter(l => l.course_id === course.id);
                const completedInCourse = progress.filter(p => 
                  p.course_id === course.id && p.completed
                ).length;
                const coursePercent = getCourseProgress(course.id);
                const courseQuizResults = quizResults.filter(r => r.course_id === course.id);

                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">{completedInCourse}/{courseLessons.length} lessons</span>
                        </div>
                        <Progress value={coursePercent} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{Math.round(coursePercent)}% complete</p>
                      </div>
                      {courseQuizResults.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Best quiz score: <span className="font-bold">{Math.round(Math.max(...courseQuizResults.map(r => r.score)))}%</span>
                        </div>
                      )}
                      <Link to={createPageUrl('TrainingCourse') + `?id=${course.id}`}>
                        <Button className="w-full">Continue Course</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Choose Your Training Path */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Choose Your Training Path</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Biblical Training */}
            <Card className="hover:shadow-xl transition-shadow border-2 border-blue-200">
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-3">📖</div>
                <CardTitle className="text-2xl">{t('training.biblical.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-700 mb-6 font-medium">
                  Build a strong foundation in God's Word and Christian faith.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">What you'll learn</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• {t('training.biblical.item1')}</li>
                    <li>• {t('training.biblical.item2')}</li>
                    <li>• {t('training.biblical.item3')}</li>
                  </ul>
                </div>
                {biblicalTracks.length > 0 ? (
                  <Link to={createPageUrl('TrainingTrack') + `?id=${biblicalTracks[0].id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                      Start Biblical Training
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                    Start Biblical Training
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Leadership Training */}
            <Card className="hover:shadow-xl transition-shadow border-2 border-purple-200">
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-3">🧭</div>
                <CardTitle className="text-2xl">{t('training.leadership.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-700 mb-6 font-medium">
                  Learn to lead like Jesus—with humility, integrity, and service.
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">What you'll learn</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• {t('training.leadership.item1')}</li>
                    <li>• {t('training.leadership.item2')}</li>
                    <li>• {t('training.leadership.item3')}</li>
                  </ul>
                </div>
                {leadershipTracks.length > 0 ? (
                  <Link to={createPageUrl('TrainingTrack') + `?id=${leadershipTracks[0].id}`}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                      Start Leadership Training
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                    Start Leadership Training
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Certificate Section */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <CardHeader className="text-center">
            <div className="text-6xl mb-3">🏅</div>
            <CardTitle className="text-2xl">Certificates</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-6 font-medium">Certificates are awarded after:</p>
            <div className="bg-white rounded-lg p-6 mb-6 max-w-md mx-auto">
              <ul className="space-y-3 text-left text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Completing all lessons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Passing all quizzes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Passing the Final Exam (100 questions)</span>
                </li>
              </ul>
            </div>
            <Link to={createPageUrl('MyCertificates')}>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-lg px-8">
                View Certificate Requirements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}