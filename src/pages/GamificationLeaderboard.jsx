import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import WeeklyChallenges from '@/components/gamification/WeeklyChallenges';
import LeaderboardPanel from '@/components/gamification/LeaderboardPanel';
import AchievementBadgesPanel from '@/components/gamification/AchievementBadgesPanel';
import StreakCard from '@/components/gamification/StreakCard';
import CommunityLeaderboard from '@/components/gamification/CommunityLeaderboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Award, Target, Flame, Users } from 'lucide-react';

export default function GamificationLeaderboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="community">
          <TabsList className="w-full grid grid-cols-5 bg-gray-100 p-1 rounded-xl mb-8">
            <TabsTrigger value="community" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow gap-1">
              <Users className="w-3.5 h-3.5" /> Community
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow gap-1">
              <Trophy className="w-3.5 h-3.5" /> Points
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow gap-1">
              <Award className="w-3.5 h-3.5" /> Badges
            </TabsTrigger>
            <TabsTrigger value="streak" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow gap-1">
              <Flame className="w-3.5 h-3.5" /> Streak
            </TabsTrigger>
            <TabsTrigger value="challenges" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow gap-1">
              <Target className="w-3.5 h-3.5" /> Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community">
            <CommunityLeaderboard currentUserId={user?.id} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardPanel currentUserId={user?.id} />
          </TabsContent>

          <TabsContent value="achievements">
            {user ? (
              <AchievementBadgesPanel userId={user.id} />
            ) : (
              <div className="text-center py-10 text-gray-400">Login to see your achievements</div>
            )}
          </TabsContent>

          <TabsContent value="streak">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Streak</h2>
                <p className="text-gray-500 text-sm mt-1">Daily activity keeps your streak alive</p>
              </div>
              {user ? <StreakCard userId={user.id} /> : <div className="text-center py-10 text-gray-400">Login to see your streak</div>}
            </div>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-3">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Weekly & Monthly Challenges</h2>
                <p className="text-gray-500 text-sm mt-1">Complete challenges to earn bonus points</p>
              </div>
              {user ? (
                <WeeklyChallenges userId={user.id} />
              ) : (
                <div className="text-center py-10 text-gray-400">Login to see your challenges</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}