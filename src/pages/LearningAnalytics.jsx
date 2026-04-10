import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Clock, Target, Award, AlertCircle, Calendar, Zap, BookOpen, Sparkles } from 'lucide-react';

export default function LearningAnalytics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch analytics data
  const { data: quizResults = [] } = useQuery({
    queryKey: ['quizAnalytics', user?.id],
    queryFn: () => base44.entities.UserQuizResult.filter({ user_id: user.id }, '-created_date', 100).catch(() => []),
    enabled: !!user
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progressAnalytics', user?.id],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: user.id }, '-updated_date', 100).catch(() => []),
    enabled: !!user
  });

  const { data: learningMetrics = [] } = useQuery({
    queryKey: ['metricsAnalytics', user?.id],
    queryFn: () => base44.entities.UserLearningMetrics.filter({ user_id: user.id }, '-recorded_at', 200).catch(() => []),
    enabled: !!user
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['coursesAnalytics'],
    queryFn: () => base44.entities.Course.filter({ published: true }).catch(() => [])
  });

  const { data: learningPaths = [] } = useQuery({
    queryKey: ['pathsAnalytics', user?.id],
    queryFn: () => base44.entities.UserLearningPathSession.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user
  });

  // Calculate study time patterns
  const studyTimeData = () => {
    const timeSlots = {
      'Early Morning (5-8)': 0,
      'Morning (8-12)': 0,
      'Afternoon (12-17)': 0,
      'Evening (17-21)': 0,
      'Night (21-24)': 0
    };

    learningMetrics.forEach(m => {
      const timeOfDay = m.metadata?.time_of_day;
      if (timeOfDay === 'morning') timeSlots['Morning (8-12)']++;
      else if (timeOfDay === 'afternoon') timeSlots['Afternoon (12-17)']++;
      else if (timeOfDay === 'evening') timeSlots['Evening (17-21)']++;
      else if (timeOfDay === 'night') timeSlots['Night (21-24)']++;
    });

    return Object.entries(timeSlots).map(([time, count]) => ({ time, sessions: count }));
  };

  // Calculate session duration patterns
  const sessionDurationData = () => {
    const durations = learningMetrics
      .filter(m => m.metadata?.session_duration_minutes)
      .map(m => m.metadata.session_duration_minutes);

    if (durations.length === 0) return [];

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const ranges = {
      '0-10 min': durations.filter(d => d <= 10).length,
      '10-20 min': durations.filter(d => d > 10 && d <= 20).length,
      '20-30 min': durations.filter(d => d > 20 && d <= 30).length,
      '30-60 min': durations.filter(d => d > 30 && d <= 60).length,
      '60+ min': durations.filter(d => d > 60).length
    };

    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  // Calculate course progress overview
  const courseProgressData = () => {
    const courseMap = {};
    progress.forEach(p => {
      if (p.course_id) {
        if (!courseMap[p.course_id]) {
          courseMap[p.course_id] = { completed: 0, total: 0 };
        }
        courseMap[p.course_id].total++;
        if (p.is_completed) courseMap[p.course_id].completed++;
      }
    });

    return Object.entries(courseMap).map(([courseId, data]) => {
      const course = courses.find(c => c.id === courseId);
      return {
        name: course?.title?.substring(0, 20) || 'Unknown',
        progress: Math.round((data.completed / data.total) * 100),
        completed: data.completed,
        total: data.total
      };
    }).slice(0, 10);
  };

  // Calculate quiz performance by topic
  const quizPerformanceByTopic = () => {
    const topicScores = {};
    quizResults.forEach(q => {
      const topic = q.topic || 'General';
      if (!topicScores[topic]) topicScores[topic] = [];
      topicScores[topic].push(q.score);
    });

    return Object.entries(topicScores).map(([topic, scores]) => ({
      topic: topic.substring(0, 15),
      avgScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
      count: scores.length
    })).sort((a, b) => b.count - a.count).slice(0, 8);
  };

  // Identify strengths and weaknesses
  const strengthsWeaknesses = () => {
    const topicPerformance = quizPerformanceByTopic();
    const strengths = topicPerformance.filter(t => t.avgScore >= 80).slice(0, 5);
    const weaknesses = topicPerformance.filter(t => t.avgScore < 70).slice(0, 5);
    return { strengths, weaknesses };
  };

  // Calculate learning path progress
  const pathProgressData = () => {
    return learningPaths.map(path => ({
      name: path.path_name?.substring(0, 20) || 'Unnamed',
      progress: path.overall_progress_percent || 0,
      status: path.status
    })).slice(0, 6);
  };

  // Overall engagement score
  const engagementScore = () => {
    const engagementMetrics = learningMetrics.filter(m => m.metric_type === 'engagement_score');
    if (engagementMetrics.length === 0) return 0;
    return Math.round(engagementMetrics.reduce((sum, m) => sum + m.metric_value, 0) / engagementMetrics.length);
  };

  // Weekly activity trend
  const weeklyActivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        activities: 0
      };
    });

    learningMetrics.forEach(m => {
      const date = new Date(m.recorded_at || m.created_date);
      const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        last7Days[6 - daysDiff].activities++;
      }
    });

    return last7Days;
  };

  const { strengths, weaknesses } = strengthsWeaknesses();
  const engagement = engagementScore();

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Learning Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your learning journey</p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lessons</p>
                  <p className="text-3xl font-bold text-indigo-600">{progress.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {progress.filter(p => p.is_completed).length}
                  </p>
                </div>
                <Award className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Quiz Score</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {quizResults.length > 0 
                      ? Math.round(quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length)
                      : 0}%
                  </p>
                </div>
                <Target className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="text-3xl font-bold text-orange-600">{engagement}%</p>
                </div>
                <Zap className="w-10 h-10 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="patterns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patterns">Study Patterns</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Study Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Best Study Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studyTimeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Session Duration Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sessionDurationData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {sessionDurationData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Weekly Activity Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyActivityData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="activities" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Course Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={courseProgressData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="progress" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Learning Path Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pathProgressData().map((path, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{path.name}</span>
                          <Badge variant={path.status === 'completed' ? 'default' : 'outline'}>
                            {path.progress}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {pathProgressData().length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">No learning paths started yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Quiz Performance by Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={quizPerformanceByTopic()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="topic" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Score" dataKey="avgScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Strengths & Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Your Strengths (80%+)
                    </p>
                    <div className="space-y-2">
                      {strengths.map(s => (
                        <div key={s.topic} className="flex justify-between items-center bg-green-50 p-2 rounded">
                          <span className="text-sm text-green-900">{s.topic}</span>
                          <Badge className="bg-green-600">{s.avgScore}%</Badge>
                        </div>
                      ))}
                      {strengths.length === 0 && (
                        <p className="text-sm text-gray-500">Complete more quizzes to identify strengths</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas for Improvement (&lt;70%)
                    </p>
                    <div className="space-y-2">
                      {weaknesses.map(w => (
                        <div key={w.topic} className="flex justify-between items-center bg-amber-50 p-2 rounded">
                          <span className="text-sm text-amber-900">{w.topic}</span>
                          <Badge className="bg-amber-600">{w.avgScore}%</Badge>
                        </div>
                      ))}
                      {weaknesses.length === 0 && (
                        <p className="text-sm text-gray-500">Great job! No weak areas detected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-indigo-900">📈 Learning Velocity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-indigo-700">Avg Completion Rate</span>
                    <span className="font-bold text-indigo-900">
                      {progress.length > 0 
                        ? Math.round((progress.filter(p => p.is_completed).length / progress.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-indigo-700">Total Study Sessions</span>
                    <span className="font-bold text-indigo-900">{learningMetrics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-indigo-700">Active Learning Paths</span>
                    <span className="font-bold text-indigo-900">
                      {learningPaths.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">🎯 Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Quiz Mastery</span>
                    <span className="font-bold text-green-900">
                      {quizResults.filter(q => q.score >= 80).length} / {quizResults.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Topics Studied</span>
                    <span className="font-bold text-green-900">
                      {new Set(quizResults.map(q => q.topic).filter(Boolean)).size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Engagement Level</span>
                    <Badge className={engagement >= 70 ? 'bg-green-600' : 'bg-yellow-600'}>
                      {engagement >= 70 ? 'High' : engagement >= 40 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {engagement < 50 && (
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-900 mb-1">💡 Boost Your Engagement</p>
                        <p className="text-sm text-purple-700">
                          Try studying during your peak time ({studyTimeData().sort((a, b) => b.sessions - a.sessions)[0]?.time || 'morning'}) for better focus.
                        </p>
                      </div>
                    )}
                    {weaknesses.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-900 mb-1">📚 Focus Areas</p>
                        <p className="text-sm text-purple-700">
                          Dedicate extra time to {weaknesses[0].topic} - your score is {weaknesses[0].avgScore}%, aim for 80%+.
                        </p>
                      </div>
                    )}
                    {progress.filter(p => !p.is_completed && p.progress_percent > 50).length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-900 mb-1">✅ Complete What You Started</p>
                        <p className="text-sm text-purple-700">
                          You have {progress.filter(p => !p.is_completed && p.progress_percent > 50).length} lesson(s) over 50% done. Finish them to boost your progress!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}