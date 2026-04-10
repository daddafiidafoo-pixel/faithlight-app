import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, MessageCircle, StickyNote, Star } from 'lucide-react';

export default function CommunityLeaderboard() {
  const [timeframe, setTimeframe] = useState('all'); // 'week', 'month', 'all'

  // Get activity data
  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', timeframe],
    queryFn: async () => {
      const all = await base44.entities.UserActivity.list();
      
      if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return all.filter(a => new Date(a.activity_date) >= weekAgo);
      }
      if (timeframe === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return all.filter(a => new Date(a.activity_date) >= monthAgo);
      }
      return all;
    }
  });

  // Get users
  const { data: users = [] } = useQuery({
    queryKey: ['leaderboardUsers'],
    queryFn: () => base44.entities.User.list()
  });

  // Calculate leaderboard rankings
  const calculateLeaderboard = (metric) => {
    const userStats = {};
    
    activities.forEach(activity => {
      if (!userStats[activity.user_id]) {
        userStats[activity.user_id] = {
          userId: activity.user_id,
          notes: 0,
          highlights: 0,
          discussions: 0,
          replies: 0,
          points: 0
        };
      }
      
      userStats[activity.user_id].notes += activity.public_notes_count || 0;
      userStats[activity.user_id].highlights += activity.public_highlights_count || 0;
      userStats[activity.user_id].discussions += activity.discussions_started || 0;
      userStats[activity.user_id].replies += activity.discussion_replies || 0;
      userStats[activity.user_id].points += activity.total_points || 0;
    });

    return Object.values(userStats)
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 10)
      .map((stat, idx) => ({
        rank: idx + 1,
        user: users.find(u => u.id === stat.userId),
        ...stat
      }));
  };

  const LeaderboardList = ({ data, metric, icon: Icon, label }) => (
    <div className="space-y-2">
      {data.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No activity yet</p>
      ) : (
        data.map((entry) => (
          <div
            key={entry.userId}
            className={`p-4 rounded-lg border flex items-center justify-between transition-all ${
              entry.rank <= 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                entry.rank === 2 ? 'bg-gray-300 text-gray-800' :
                entry.rank === 3 ? 'bg-amber-600 text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </div>
              
              <div>
                <p className="font-semibold text-gray-900">
                  {entry.user?.full_name || entry.user?.email || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {entry[metric]} {label}
                </p>
              </div>
            </div>
            
            {entry.rank <= 3 && (
              <Trophy className={`w-6 h-6 ${
                entry.rank === 1 ? 'text-yellow-500' :
                entry.rank === 2 ? 'text-gray-400' :
                'text-amber-700'
              }`} />
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Community Leaderboard
          </h2>
          <p className="text-gray-600 text-sm">Top contributors this {timeframe === 'all' ? 'season' : timeframe}</p>
        </div>
        
        <div className="flex gap-2">
          <Badge
            variant={timeframe === 'week' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeframe('week')}
          >
            This Week
          </Badge>
          <Badge
            variant={timeframe === 'month' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeframe('month')}
          >
            This Month
          </Badge>
          <Badge
            variant={timeframe === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeframe('all')}
          >
            All Time
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points">Top Contributors</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="replies">Most Helpful</TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <LeaderboardList
                data={calculateLeaderboard('points')}
                metric="points"
                icon={Star}
                label="points"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <LeaderboardList
                data={calculateLeaderboard('notes')}
                metric="notes"
                icon={StickyNote}
                label="public notes"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <LeaderboardList
                data={calculateLeaderboard('discussions')}
                metric="discussions"
                icon={MessageCircle}
                label="discussions started"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replies" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <LeaderboardList
                data={calculateLeaderboard('replies')}
                metric="replies"
                icon={TrendingUp}
                label="helpful replies"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}