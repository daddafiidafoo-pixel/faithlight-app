import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import FollowButton from '../components/forum/FollowButton';
import { Users, BookOpen, Target, MessageCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function MyFollows() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        window.location.href = '/';
      }
    };
    fetchUser();
  }, []);

  const { data: follows = [] } = useQuery({
    queryKey: ['user-follows', user?.id],
    queryFn: () => base44.entities.UserFollow.filter({ follower_id: user.id }, '-created_date', 200),
    enabled: !!user
  });

  const userFollows = follows.filter(f => f.following_type === 'user');
  const topicFollows = follows.filter(f => f.following_type === 'topic');
  const seriesFollows = follows.filter(f => f.following_type === 'sermon_series');
  const planFollows = follows.filter(f => f.following_type === 'study_plan');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-indigo-600" />
            My Follows
          </h1>
          <p className="text-gray-600 mt-2">
            Manage what you're following and stay updated
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{userFollows.length}</p>
                <p className="text-sm text-gray-600">Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{topicFollows.length}</p>
                <p className="text-sm text-gray-600">Topics</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{seriesFollows.length}</p>
                <p className="text-sm text-gray-600">Sermon Series</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{planFollows.length}</p>
                <p className="text-sm text-gray-600">Study Plans</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users ({userFollows.length})</TabsTrigger>
            <TabsTrigger value="topics">Topics ({topicFollows.length})</TabsTrigger>
            <TabsTrigger value="series">Series ({seriesFollows.length})</TabsTrigger>
            <TabsTrigger value="plans">Plans ({planFollows.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-6">
            {userFollows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Not following any users yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {userFollows.map(follow => (
                  <Card key={follow.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{follow.following_name}</h3>
                            <p className="text-sm text-gray-600">User</p>
                          </div>
                        </div>
                        <FollowButton
                          currentUser={user}
                          followingType="user"
                          followingId={follow.following_id}
                          followingName={follow.following_name}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="topics" className="space-y-4 mt-6">
            {topicFollows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Not following any topics yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {topicFollows.map(follow => (
                  <Card key={follow.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{follow.following_name}</h3>
                            <p className="text-sm text-gray-600">Forum Topic</p>
                          </div>
                        </div>
                        <FollowButton
                          currentUser={user}
                          followingType="topic"
                          followingId={follow.following_id}
                          followingName={follow.following_name}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="series" className="space-y-4 mt-6">
            {seriesFollows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Not following any sermon series yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {seriesFollows.map(follow => (
                  <Card key={follow.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{follow.following_name}</h3>
                            <p className="text-sm text-gray-600">Sermon Series</p>
                          </div>
                        </div>
                        <FollowButton
                          currentUser={user}
                          followingType="sermon_series"
                          followingId={follow.following_id}
                          followingName={follow.following_name}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans" className="space-y-4 mt-6">
            {planFollows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Not following any study plans yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {planFollows.map(follow => (
                  <Card key={follow.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Target className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{follow.following_name}</h3>
                            <p className="text-sm text-gray-600">Study Plan</p>
                          </div>
                        </div>
                        <FollowButton
                          currentUser={user}
                          followingType="study_plan"
                          followingId={follow.following_id}
                          followingName={follow.following_name}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}