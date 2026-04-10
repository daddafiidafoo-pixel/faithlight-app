import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Heart, Loader2 } from 'lucide-react';

export default function VersOfTheDayViewer({ currentUser, isDarkMode }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const { data: votd } = useQuery({
    queryKey: ['versOfTheDay', today],
    queryFn: async () => {
      const results = await base44.entities.VersOfTheDayDiscussion.filter(
        { verse_date: today },
        '-created_date',
        1
      );
      return results[0];
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['votdComments', votd?.id],
    queryFn: async () => {
      if (!votd) return [];
      return base44.entities.VersOfTheDayComment.filter(
        { discussion_id: votd.id },
        '-created_date'
      );
    },
    enabled: !!votd
  });

  const postComment = useMutation({
    mutationFn: async () => {
      if (!votd || !newComment.trim()) return;
      return base44.entities.VersOfTheDayComment.create({
        discussion_id: votd.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        comment_text: newComment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votdComments'] });
      setNewComment('');
    }
  });

  if (!votd) return null;
  if (!currentUser) return null;

  return (
    <Card style={{
      backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF',
      borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB'
    }}>
      <CardHeader>
        <CardTitle className="text-base">Verse of the Day</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="font-semibold text-sm">{votd.book} {votd.chapter}:{votd.verse}</p>
          <p className="text-sm italic mt-2">{votd.verse_text}</p>
          {votd.theme && (
            <p className="text-xs text-gray-600 mt-3">💭 {votd.theme}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold">{comments.length} Community Comments</span>
          </div>

          {comments.slice(0, 5).map(comment => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded text-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-xs">{comment.user_name}</p>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  {comment.like_count}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-1">{comment.comment_text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your reflection..."
            className="flex-1 p-2 border rounded text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') postComment.mutate();
            }}
          />
          <Button
            size="sm"
            onClick={() => postComment.mutate()}
            disabled={postComment.isPending || !newComment.trim()}
          >
            {postComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}