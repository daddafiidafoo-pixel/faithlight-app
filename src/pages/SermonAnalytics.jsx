import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download, Eye, Star, MessageCircle, Globe, BookOpen, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SermonAnalytics() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch user's generated sermons
  const { data: mySermons = [] } = useQuery({
    queryKey: ['my-sermons', user?.id],
    queryFn: () => base44.entities.SermonNote.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  // Fetch community shared sermons
  const { data: sharedSermons = [] } = useQuery({
    queryKey: ['shared-sermons'],
    queryFn: () => base44.entities.SharedSermon.list('-created_date', 1000),
  });

  // Fetch user's shared sermons
  const { data: mySharedSermons = [] } = useQuery({
    queryKey: ['my-shared-sermons', user?.id],
    queryFn: () => base44.entities.SharedSermon.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  // Calculate metrics for user's shared sermons
  const mySharedMetrics = {
    totalViews: mySharedSermons.reduce((sum, s) => sum + (s.views_count || 0), 0),
    totalDownloads: mySharedSermons.reduce((sum, s) => sum + (s.downloads_count || 0), 0),
    totalRatings: mySharedSermons.reduce((sum, s) => sum + (s.ratings_count || 0), 0),
    totalComments: mySharedSermons.reduce((sum, s) => sum + (s.comments_count || 0), 0),
    avgRating: mySharedSermons.length > 0
      ? (mySharedSermons.reduce((sum, s) => sum + (s.average_rating || 0), 0) / mySharedSermons.length).toFixed(1)
      : 0,
  };

  // Calculate overall community metrics
  const communityMetrics = {
    totalSermons: sharedSermons.length,
    totalViews: sharedSermons.reduce((sum, s) => sum + (s.views_count || 0), 0),
    totalDownloads: sharedSermons.reduce((sum, s) => sum + (s.downloads_count || 0), 0),
    totalRatings: sharedSermons.reduce((sum, s) => sum + (s.ratings_count || 0), 0),
    totalComments: sharedSermons.reduce((sum, s) => sum + (s.comments_count || 0), 0),
  };

  // Language distribution for user's sermons
  const myLanguageData = Object.entries(
    mySermons.reduce((acc, s) => {
      const lang = s.language || 'en';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {})
  ).map(([language, count]) => ({ language, count }));

  // Language distribution for community
  const communityLanguageData = Object.entries(
    sharedSermons.reduce((acc, s) => {
      const lang = s.language || 'en';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {})
  ).map(([language, count]) => ({ language, count }));

  // Sermon style distribution
  const styleData = Object.entries(
    mySermons.reduce((acc, s) => {
      const style = s.style || 'expository';
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {})
  ).map(([style, count]) => ({ style, count }));

  // Audience distribution
  const audienceData = Object.entries(
    mySermons.reduce((acc, s) => {
      const audience = s.audience || 'adults';
      acc[audience] = (acc[audience] || 0) + 1;
      return acc;
    }, {})
  ).map(([audience, count]) => ({ audience, count }));

  // Top performing shared sermons
  const topSermons = [...mySharedSermons]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5);

  // Engagement over time (by created_date)
  const engagementData = mySharedSermons
    .map(s => ({
      date: new Date(s.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: s.views_count || 0,
      downloads: s.downloads_count || 0,
      title: s.title,
    }))
    .reverse()
    .slice(0, 10);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  const StatCard = ({ icon: Icon, title, value, description, color = 'text-indigo-600' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sermon Analytics</h1>
          <p className="text-gray-600">Track your sermon impact and community engagement</p>
        </div>

        <Tabs defaultValue="my-sermons" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-sermons">My Sermons</TabsTrigger>
            <TabsTrigger value="community">Community Overview</TabsTrigger>
          </TabsList>

          {/* My Sermons Tab */}
          <TabsContent value="my-sermons" className="space-y-6">
            {/* Personal Stats */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={BookOpen}
                  title="Total Sermons Generated"
                  value={mySermons.length}
                  description="All time"
                  color="text-indigo-600"
                />
                <StatCard
                  icon={Users}
                  title="Shared to Community"
                  value={mySharedSermons.length}
                  description={`${((mySharedSermons.length / Math.max(mySermons.length, 1)) * 100).toFixed(0)}% of total`}
                  color="text-purple-600"
                />
                <StatCard
                  icon={Eye}
                  title="Total Views"
                  value={mySharedMetrics.totalViews}
                  description="On shared sermons"
                  color="text-blue-600"
                />
                <StatCard
                  icon={Download}
                  title="Total Downloads"
                  value={mySharedMetrics.totalDownloads}
                  description="From community"
                  color="text-green-600"
                />
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={Star}
                title="Average Rating"
                value={mySharedMetrics.avgRating}
                description={`${mySharedMetrics.totalRatings} total ratings`}
                color="text-yellow-600"
              />
              <StatCard
                icon={MessageCircle}
                title="Total Comments"
                value={mySharedMetrics.totalComments}
                description="Community feedback"
                color="text-pink-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Engagement Rate"
                value={mySharedSermons.length > 0
                  ? `${((mySharedMetrics.totalDownloads / Math.max(mySharedMetrics.totalViews, 1)) * 100).toFixed(1)}%`
                  : '0%'}
                description="Downloads per view"
                color="text-indigo-600"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Language Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    Language Distribution
                  </CardTitle>
                  <CardDescription>Your sermons by language</CardDescription>
                </CardHeader>
                <CardContent>
                  {myLanguageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={myLanguageData}
                          dataKey="count"
                          nameKey="language"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `${entry.language.toUpperCase()}: ${entry.count}`}
                        >
                          {myLanguageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sermon Style Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sermon Styles</CardTitle>
                  <CardDescription>Distribution by preaching style</CardDescription>
                </CardHeader>
                <CardContent>
                  {styleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={styleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="style" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Audience Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Target Audience</CardTitle>
                  <CardDescription>Sermons by audience type</CardDescription>
                </CardHeader>
                <CardContent>
                  {audienceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={audienceData}
                          dataKey="count"
                          nameKey="audience"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `${entry.audience}: ${entry.count}`}
                        >
                          {audienceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Engagement Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trend</CardTitle>
                  <CardDescription>Views vs Downloads over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {engagementData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} />
                        <Line type="monotone" dataKey="downloads" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400">
                      No shared sermons yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Sermons */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Sermons</CardTitle>
                <CardDescription>Your most viewed shared sermons</CardDescription>
              </CardHeader>
              <CardContent>
                {topSermons.length > 0 ? (
                  <div className="space-y-3">
                    {topSermons.map((sermon, index) => (
                      <div key={sermon.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{sermon.title}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="gap-1">
                              <Eye className="w-3 h-3" />
                              {sermon.views_count || 0} views
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Download className="w-3 h-3" />
                              {sermon.downloads_count || 0} downloads
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Star className="w-3 h-3" />
                              {sermon.average_rating?.toFixed(1) || 0}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {sermon.comments_count || 0} comments
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No shared sermons yet. Share your sermons to track their performance!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Overview Tab */}
          <TabsContent value="community" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Library Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  icon={BookOpen}
                  title="Total Sermons"
                  value={communityMetrics.totalSermons}
                  description="In library"
                  color="text-indigo-600"
                />
                <StatCard
                  icon={Eye}
                  title="Total Views"
                  value={communityMetrics.totalViews.toLocaleString()}
                  description="All sermons"
                  color="text-blue-600"
                />
                <StatCard
                  icon={Download}
                  title="Total Downloads"
                  value={communityMetrics.totalDownloads.toLocaleString()}
                  description="All time"
                  color="text-green-600"
                />
                <StatCard
                  icon={Star}
                  title="Total Ratings"
                  value={communityMetrics.totalRatings.toLocaleString()}
                  description="Community reviews"
                  color="text-yellow-600"
                />
                <StatCard
                  icon={MessageCircle}
                  title="Total Comments"
                  value={communityMetrics.totalComments.toLocaleString()}
                  description="Discussions"
                  color="text-pink-600"
                />
              </div>
            </div>

            {/* Community Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  Community Language Distribution
                </CardTitle>
                <CardDescription>All shared sermons by language</CardDescription>
              </CardHeader>
              <CardContent>
                {communityLanguageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={communityLanguageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="language" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#6366f1" name="Sermons" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}