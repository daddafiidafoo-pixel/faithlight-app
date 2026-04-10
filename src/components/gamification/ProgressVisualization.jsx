import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';

export default function ProgressVisualization({ userId, isDarkMode = false }) {
  const { data: userProgress = [] } = useQuery({
    queryKey: ['detailed-progress', userId],
    queryFn: () => base44.entities.UserProgress.filter(
      { user_id: userId },
      '-created_date',
      50
    ),
    enabled: !!userId
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['quiz-results', userId],
    queryFn: () => base44.entities.UserQuizResult.filter(
      { user_id: userId },
      '-created_date',
      30
    ),
    enabled: !!userId
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => base44.entities.UserPoints.filter({ user_id: userId }),
    enabled: !!userId
  });

  // Prepare chart data
  const learningTrendData = useMemo(() => {
    return userProgress
      .slice()
      .reverse()
      .map((p, idx) => ({
        day: idx + 1,
        progress: p.progress_percent || 0,
        timeSpent: (p.time_spent_minutes || 0) / 60 // convert to hours
      }))
      .slice(0, 20);
  }, [userProgress]);

  const quizPerformanceData = useMemo(() => {
    return quizResults
      .slice()
      .reverse()
      .map((q, idx) => ({
        quiz: `Quiz ${idx + 1}`,
        score: q.score || 0,
        attempts: q.attempt_count || 1
      }))
      .slice(0, 15);
  }, [quizResults]);

  const completionStats = useMemo(() => {
    if (!userStats?.[0]) return [];
    const stats = userStats[0];
    return [
      { name: 'Lessons', value: stats.lessons_completed || 0, color: '#3B82F6' },
      { name: 'Quizzes', value: stats.quizzes_completed || 0, color: '#8B5CF6' },
      { name: 'Courses', value: stats.courses_completed || 0, color: '#10B981' }
    ];
  }, [userStats]);

  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const gridColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  const chartProps = {
    margin: { top: 5, right: 30, left: 0, bottom: 5 }
  };

  return (
    <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <TrendingUp className="w-5 h-5" style={{ color: primaryColor }} />
          Learning Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trend">Learning Trend</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Performance</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
          </TabsList>

          {/* Learning Trend Chart */}
          <TabsContent value="trend" className="mt-4">
            {learningTrendData.length === 0 ? (
              <p style={{ color: mutedColor }} className="text-center py-8">
                No learning data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={learningTrendData} {...chartProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="day" stroke={mutedColor} />
                  <YAxis stroke={mutedColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: textColor }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke={primaryColor}
                    dot={{ fill: primaryColor }}
                    name="Progress %"
                  />
                  <Line
                    type="monotone"
                    dataKey="timeSpent"
                    stroke="#8B5CF6"
                    dot={{ fill: '#8B5CF6' }}
                    name="Hours Spent"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          {/* Quiz Performance Chart */}
          <TabsContent value="quiz" className="mt-4">
            {quizPerformanceData.length === 0 ? (
              <p style={{ color: mutedColor }} className="text-center py-8">
                No quiz data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quizPerformanceData} {...chartProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="quiz" stroke={mutedColor} />
                  <YAxis stroke={mutedColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: textColor }}
                  />
                  <Legend />
                  <Bar dataKey="score" fill={primaryColor} name="Score %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="attempts" fill="#EF4444" name="Attempts" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          {/* Completion Stats */}
          <TabsContent value="completion" className="mt-4">
            {completionStats.every(s => s.value === 0) ? (
              <p style={{ color: mutedColor }} className="text-center py-8">
                Start completing activities to see stats
              </p>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={completionStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {completionStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: textColor }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-2">
                  {completionStats.map(stat => (
                    <div
                      key={stat.name}
                      className="p-3 rounded-lg text-center"
                      style={{
                        backgroundColor: `${stat.color}20`,
                        borderColor: stat.color,
                        border: `1px solid ${stat.color}40`
                      }}
                    >
                      <p style={{ color: stat.color }} className="font-bold text-lg">
                        {stat.value}
                      </p>
                      <p style={{ color: mutedColor }} className="text-xs">
                        {stat.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}