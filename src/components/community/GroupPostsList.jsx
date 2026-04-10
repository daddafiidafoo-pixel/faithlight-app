import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function GroupPostsList({ groupId }) {
  const { data: posts = [] } = useQuery({
    queryKey: ['group-posts', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      return base44.entities.GroupPost.filter(
        { group_id: groupId, is_pinned: false, status: 'approved' },
        '-created_date',
        50
      );
    },
    enabled: !!groupId,
    refetchInterval: 10000,
  });

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-600">
          No posts yet. Be the first to share!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Posts</h3>

      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">{post.title}</h4>
              <p className="text-gray-700 text-sm line-clamp-4">{post.content}</p>

              <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
                <span>{formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}</span>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.likes_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.replies_count}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}