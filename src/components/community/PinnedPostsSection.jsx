import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pin, MessageSquare } from 'lucide-react';

export default function PinnedPostsSection({ groupId, isOwner }) {
  const { data: pinnedPosts = [] } = useQuery({
    queryKey: ['pinned-posts', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      return base44.entities.GroupPost.filter(
        { group_id: groupId, is_pinned: true, status: 'approved' },
        '-created_date',
        5
      );
    },
    enabled: !!groupId,
  });

  if (pinnedPosts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Pin className="w-5 h-5 text-amber-600" />
        Pinned Announcements
      </h3>

      {pinnedPosts.map((post) => (
        <Card key={post.id} className="border-l-4 border-l-amber-600 bg-amber-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">{post.title}</h4>
              <p className="text-gray-700 text-sm line-clamp-3">{post.content}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span>{post.replies_count} replies</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}