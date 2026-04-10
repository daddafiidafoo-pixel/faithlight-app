import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommunityActivityWidget({ userId }) {
  const { data: posts = [] } = useQuery({
    queryKey: ['community-activity-widget', userId],
    queryFn: async () => {
      if (!userId) return [];
      const memberships = await base44.entities.GroupMember.filter({ user_id: userId }, '-created_date', 10).catch(() => []);
      if (!memberships.length) return [];
      const groupIds = [...new Set(memberships.map(m => m.group_id))].slice(0, 5);
      const allPosts = await Promise.all(
        groupIds.map(gid => base44.entities.GroupThread.filter({ group_id: gid }, '-created_date', 3).catch(() => []))
      );
      return allPosts.flat().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);
    },
    enabled: !!userId,
    retry: false,
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" />Community Activity</h2>
          <Link to={createPageUrl('Groups')}><Button variant="ghost" size="sm" className="text-indigo-600 text-xs">View Groups →</Button></Link>
        </div>
        {posts.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-8 text-center text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Join a group to see community activity here.</p>
              <Link to={createPageUrl('Groups')} className="mt-3 inline-block">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Browse Groups</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm flex-shrink-0">💬</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title || 'New discussion'}</p>
                  <p className="text-xs text-gray-500">{post.creator_name || 'A member'} · {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}