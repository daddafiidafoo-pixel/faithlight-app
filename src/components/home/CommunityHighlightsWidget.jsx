import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, ChevronRight, BookOpen, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { formatDistanceToNow } from 'date-fns';

export default function CommunityHighlightsWidget({ user }) {
  const { data: recentTopics = [] } = useQuery({
    queryKey: ['forum-recent-home'],
    queryFn: async () => {
      try {
        return await base44.entities.ForumTopic.list('-updated_date', 4);
      } catch {
        return [];
      }
    },
    retry: false,
  });

  const { data: popularGroups = [] } = useQuery({
    queryKey: ['popular-groups-home'],
    queryFn: async () => {
      try {
        return await base44.entities.Group.filter({ privacy: 'public' }, '-member_count', 3);
      } catch {
        return [];
      }
    },
    retry: false,
  });

  const { data: myGroupIds = [] } = useQuery({
    queryKey: ['my-group-ids-home', user?.id],
    queryFn: async () => {
      try {
        const m = await base44.entities.GroupMember.filter({ user_id: user.id }, '-updated_date', 50);
        return m.map(x => x.group_id);
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
    retry: false,
  });

  const CATEGORY_COLORS = {
    'bible-study': 'bg-blue-100 text-blue-700',
    'theology':    'bg-purple-100 text-purple-700',
    'prayer':      'bg-green-100 text-green-700',
    'general':     'bg-gray-100 text-gray-700',
    'worship':     'bg-pink-100 text-pink-700',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Forum Topics */}
      <Card className="border-gray-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-gray-900 text-sm">Community Forum</span>
            </div>
            <div className="flex items-center gap-1">
              {user && (
                <Link to={createPageUrl('Forum')}>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-indigo-600 hover:bg-indigo-50">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl('Forum')}>
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600 h-7 px-2 gap-1">
                  All <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>

          {recentTopics.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">Start the first discussion!</p>
              <Link to={createPageUrl('Forum')}>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs">Browse Forum</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTopics.map(topic => (
                <Link key={topic.id} to={createPageUrl(`ForumTopic?id=${topic.id}`)}>
                  <div className="flex gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-600">
                      {(topic.author_name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 leading-tight">
                        {topic.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {topic.category && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[topic.category] || CATEGORY_COLORS.general}`}>
                            {topic.category}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {topic.replies_count || 0} replies · {topic.created_date ? formatDistanceToNow(new Date(topic.created_date), { addSuffix: true }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Groups */}
      <Card className="border-gray-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-bold text-gray-900 text-sm">Study Groups</span>
            </div>
            <Link to={createPageUrl('Groups')}>
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 h-7 px-2 gap-1">
                All <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {popularGroups.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">Be the first to create a group!</p>
              <Link to={createPageUrl('Groups')}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">Create Group</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {popularGroups.map(group => {
                const isJoined = myGroupIds.includes(group.id);
                const colors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-green-500 to-teal-600'];
                const colorIdx = (group.name?.charCodeAt(0) || 0) % colors.length;
                return (
                  <Link key={group.id} to={createPageUrl(`GroupDetail?id=${group.id}`)}>
                    <div className="flex gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center flex-shrink-0 text-xs font-bold text-white`}>
                        {(group.name || 'G').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 leading-tight">
                          {group.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-400">
                            <Users className="w-2.5 h-2.5 inline mr-0.5" />
                            {group.member_count || 0} members
                          </span>
                          {isJoined && (
                            <Badge className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0 h-4">Joined</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link to={createPageUrl('BibleTutor')}>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700">AI Bible Tutor</p>
                  <p className="text-[10px] text-gray-400">Ask any Scripture question</p>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400 ml-auto" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}