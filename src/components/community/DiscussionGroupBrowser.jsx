import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Sparkles, Loader2 } from 'lucide-react';

export default function DiscussionGroupBrowser({ currentUser, isDarkMode }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['discussionGroups', filter],
    queryFn: async () => {
      const query = filter === 'all' ? {} : { group_type: filter };
      return base44.entities.DiscussionGroup.filter(query, '-last_activity_date', 20);
    }
  });

  const { data: myGroups = [] } = useQuery({
    queryKey: ['myDiscussionGroups', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return base44.entities.DiscussionGroupMember.filter(
        { user_id: currentUser.id },
        '-joined_date'
      );
    },
    enabled: !!currentUser
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId) => {
      await base44.entities.DiscussionGroupMember.create({
        group_id: groupId,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        role: 'member'
      });
      await base44.entities.DiscussionGroup.update(groupId, {
        member_count: groups.find(g => g.id === groupId)?.member_count + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDiscussionGroups'] });
    }
  });

  const isMemberOf = (groupId) => myGroups.some(m => m.group_id === groupId);

  if (!currentUser) {
    return <p className="text-xs text-gray-500">Login to join discussion groups</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['all', 'book', 'theme', 'passage'].map(type => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-sm">Loading groups...</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {groups.map(group => (
            <Card
              key={group.id}
              style={{
                backgroundColor: isDarkMode ? '#1A1F1C' : '#F9FAFB',
                borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB'
              }}
            >
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{group.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{group.description}</p>
                    {group.book && <p className="text-xs text-indigo-600 mt-2">📖 {group.book}</p>}
                    {group.theme && <p className="text-xs text-purple-600 mt-2">✨ {group.theme}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant={isMemberOf(group.id) ? 'outline' : 'default'}
                    disabled={joinGroup.isPending || isMemberOf(group.id)}
                    onClick={() => joinGroup.mutate(group.id)}
                  >
                    {isMemberOf(group.id) ? 'Joined' : 'Join'}
                  </Button>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {group.member_count} members
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {group.post_count} posts
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}