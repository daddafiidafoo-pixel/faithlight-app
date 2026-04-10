import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BookOpen, Target, Calendar, Zap, Award } from 'lucide-react';

const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

export default function DetailedProgressDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  // Fetch detailed progress data
  const { data: progressData = {} } = useQuery({
    queryKey: ['detailed-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const [progress, quizzes, badges, activity, lessons] = await Promise.all([
        base44.entities.UserProgress.filter({ user_id: user.id }),
        base44.entities.QuizAttempt.filter({ user_id: user.id }),
        base44.entities.UserBadge.filter({ user_id: user.id }, '-earned_at', 50),
        base44.entities.UserActivity.filter({ user_id: user.id }, '-created_date', 100),
        base44.entities.Lesson.list('-created_date', 500),
      ]).catch(() => [[], [], [], [], []]);

      // Calculate time trends (weekly)
      const weeklyData = {};
      activity.forEach(act => {
        const date = new Date(act.created_date);
        const week = `Week ${Math.ceil(date.getDate() / 7)}`;
        if (!weeklyData[week]) {
          weeklyData[week] = { week, activities: 0, lessons: 0, quizzes: 0 };
        }
        weeklyData[week].activities += 1;
      });

      // Calculate course progress
      const courseProgress = {};
      progress.forEach(p => {
        if (!courseProgress[p.course_id]) {
          courseProgress[p.course_id] = { completed: 0, total: 0 };
        }
        courseProgress[p.course_id].total += 1;
        if (p.completed) courseProgress[p.course_id].completed += 1;
      });

      // Quiz performance over time
      const quizData = quizzes.map((q, idx) => ({
        quiz: `Quiz ${idx + 1}`,
        score: q.score || 0,
        date: new Date(q.created_date).toLocaleDateString(),
      })).slice(-10);

      // Category breakdown
      const categories = lessons.reduce((acc, l) => {
        acc[l.category || 'General'] = (acc[l.category || 'General'] || 0) + 1;
        return acc;
      }, {});
      const categoryData = Object.entries(categories).map(([name, count]) => ({
        name,
        value: count,
      }));

      return {
        totalProgress: progress.length,
        completedLessons: progress.filter(p => p.completed).length,
        quizzesCompleted: quizzes.length,
        averageScore: quizzes.length > 0
          ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
          : 0,
        badgesEarned: badges.length,
        recentBadges: badges.slice(0, 5),
        weeklyData: Object.values(weeklyData),
        quizData,
        categoryData,
        completionRate: progress.length > 0
          ? Math.round((progress.filter(p => p.completed).length / progress.length) * 100)
          : 0,
      };
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and achievements</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-blue-600">{progressData.completedLessons || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{progressData.completionRate || 0}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Quizzes Taken</p>
                <p className="text-3xl font-bold text-yellow-600">{progressData.quizzesCompleted || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Avg Quiz Score</p>
                <p className="text-3xl font-bold text-purple-600">{progressData.averageScore || 0}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Badges Earned</p>
                <p className="text-3xl font-bold text-red-600">{progressData.badgesEarned || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Quiz Performance</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Quiz Performance */}
          <TabsContent value="performance" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.quizData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData.quizData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quiz" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ fill: '#4f46e5', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No quiz data yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Activity */}
          <TabsContent value="weekly" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.weeklyData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activities" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No activity data yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Lessons by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.categoryData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {progressData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No category data yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Badges */}
        {progressData.recentBadges?.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {progressData.recentBadges.map((badge) => (
                  <div key={badge.id} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <div className="text-4xl mb-2">🏅</div>
                    <p className="text-sm font-semibold text-gray-900">{badge.badge_name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}