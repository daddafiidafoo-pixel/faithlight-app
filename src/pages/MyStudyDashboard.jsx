import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BookOpen, CheckCircle2, Target, TrendingUp, Clock, Award, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';

// Mock AI recommendation engine
const generateRecommendations = async (user, stats) => {
  // Simulate AI analysis
  const recommendations = {
    passages: [
      {
        id: 'rec-1',
        book: 'Psalm',
        chapter: 23,
        verses: '1-6',
        reason: 'Based on your recent bookmarks about peace and comfort',
        relevance: 95,
        icon: '🕊️'
      },
      {
        id: 'rec-2',
        book: 'John',
        chapter: 3,
        verses: '16',
        reason: 'Core passage for understanding salvation — matches your faith-building study',
        relevance: 88,
        icon: '✝️'
      },
      {
        id: 'rec-3',
        book: '1 Corinthians',
        chapter: 13,
        verses: '1-13',
        reason: 'Perfect for deepening your understanding of love — your most studied theme',
        relevance: 92,
        icon: '❤️'
      },
    ],
    plans: [
      {
        id: 'plan-1',
        title: '7-Day Faith Building Challenge',
        duration: '7 days',
        lessons: 7,
        difficulty: 'Beginner',
        match: 'You completed similar plans',
        icon: '⚡'
      },
      {
        id: 'plan-2',
        title: 'The Psalms — A Journey of Trust',
        duration: '14 days',
        lessons: 14,
        difficulty: 'Intermediate',
        match: 'Matches your reading history in Psalms',
        icon: '📖'
      },
    ],
    lessons: [
      {
        id: 'lesson-1',
        title: 'Understanding Grace in Daily Life',
        course: 'Spiritual Growth 101',
        duration: '15 min',
        relevance: 87,
      },
      {
        id: 'lesson-2',
        title: 'Prayer: Communication with God',
        course: 'Discipleship Track',
        duration: '20 min',
        relevance: 85,
      },
    ],
    devotionals: [
      {
        id: 'dev-1',
        title: 'Finding Peace in Uncertainty',
        author: 'FaithLight',
        theme: 'peace',
        length: '5 min read',
      },
    ]
  };
  return recommendations;
};

export default function MyStudyDashboard() {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        // Generate recommendations
        const recs = await generateRecommendations(currentUser, {});
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchData();
  }, []);

  const { data: readingHistory = [] } = useQuery({
    queryKey: ['reading-history', user?.id],
    queryFn: () => base44.entities.ReadingHistory?.filter?.({ user_id: user?.id }, '-updated_date', 5).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => base44.entities.SavedVerse?.filter?.({ user_id: user?.id }, '-updated_date', 5).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['quiz-results', user?.id],
    queryFn: () => base44.entities.QuizAttempt?.filter?.({ user_id: user?.id }, '-updated_date', 3).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  if (!user || !recommendations) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 animate-pulse">Loading your study dashboard...</p></div>;
  }

  const avgQuizScore = quizResults.length > 0 ? Math.round(quizResults.reduce((sum, q) => sum + (q.score || 0), 0) / quizResults.length) : 0;
  const studyStreak = 7; // Mock data

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            My Study Dashboard
          </h1>
          <p className="text-gray-600">AI-powered personalized recommendations based on your learning</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: TrendingUp, label: 'Study Streak', value: `${studyStreak} days`, color: 'from-orange-500 to-red-500' },
            { icon: Award, label: 'Avg Quiz Score', value: `${avgQuizScore}%`, color: 'from-indigo-500 to-purple-600' },
            { icon: BookOpen, label: 'Reading History', value: `${readingHistory.length} verses`, color: 'from-blue-500 to-indigo-600' },
            { icon: CheckCircle2, label: 'Bookmarks', value: `${bookmarks.length} saved`, color: 'from-green-500 to-teal-600' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Recommendations */}
        <Tabs defaultValue="passages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-xl">
            <TabsTrigger value="passages" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Passages</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Plans</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="devotionals" className="gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Devotionals</span>
            </TabsTrigger>
          </TabsList>

          {/* Recommended Passages */}
          <TabsContent value="passages">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Recommended Bible Passages
              </h2>
              {recommendations.passages.map(passage => (
                <Card key={passage.id} className="border-purple-100 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{passage.icon}</span>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {passage.book} {passage.chapter}:{passage.verses}
                            </h3>
                            <p className="text-sm text-gray-600 mt-0.5">{passage.reason}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge className="bg-purple-100 text-purple-700 border-0">{passage.relevance}% match</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommended Plans */}
          <TabsContent value="plans">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Study Plans For You
              </h2>
              {recommendations.plans.map(plan => (
                <Card key={plan.id} className="border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                          <span>{plan.icon}</span> {plan.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{plan.match}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">{plan.lessons} lessons</Badge>
                          <Badge variant="outline" className="text-xs">{plan.duration}</Badge>
                          <Badge variant="secondary" className="text-xs">{plan.difficulty}</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 flex-shrink-0">
                        Start <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommended Lessons */}
          <TabsContent value="lessons">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Recommended Lessons
              </h2>
              {recommendations.lessons.map(lesson => (
                <Card key={lesson.id} className="border-green-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{lesson.course}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{lesson.duration}</Badge>
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">{lesson.relevance}% match</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 flex-shrink-0">
                        Learn <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Devotionals */}
          <TabsContent value="devotionals">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                Daily Devotionals
              </h2>
              {recommendations.devotionals.map(dev => (
                <Card key={dev.id} className="border-rose-100 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{dev.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">By {dev.author}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{dev.theme}</Badge>
                          <Badge variant="outline" className="text-xs">{dev.length}</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1 bg-rose-600 hover:bg-rose-700 flex-shrink-0">
                        Read <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Continue Learning */}
        <Card className="mt-8 border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2">Keep Your Streak Going!</h3>
            <p className="text-indigo-100 mb-4">You've studied for {studyStreak} days in a row. Read 1 more passage today to maintain your streak.</p>
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 gap-2">
              <BookOpen className="w-4 h-4" />
              Read a Verse
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}