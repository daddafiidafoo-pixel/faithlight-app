import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ThumbsUp, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { trackActivity } from '../community/BadgeTracker';

export default function ChapterDiscussionPanel({ book, chapter, translation, currentUser }) {
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [verseRef, setVerseRef] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const queryClient = useQueryClient();

  // Fetch discussions
  const { data: discussions = [] } = useQuery({
    queryKey: ['chapterDiscussions', book, chapter],
    queryFn: () => base44.entities.ChapterDiscussion.filter({
      book,
      chapter: parseInt(chapter)
    }, '-created_date', 50),
    enabled: !!book && !!chapter
  });

  // Fetch replies for selected discussion
  const { data: replies = [] } = useQuery({
    queryKey: ['discussionReplies', selectedDiscussion?.id],
    queryFn: () => base44.entities.ChapterDiscussionReply.filter({
      discussion_id: selectedDiscussion.id
    }, 'created_date', 100),
    enabled: !!selectedDiscussion
  });

  // Get users
  const { data: users = [] } = useQuery({
    queryKey: ['discussionUsers'],
    queryFn: () => base44.entities.User.list()
  });

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.email || 'Anonymous';
  };

  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: (data) => base44.entities.ChapterDiscussion.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries(['chapterDiscussions']);
      setTitle('');
      setContent('');
      setVerseRef('');
      setShowNewDiscussion(false);
      toast.success('Discussion started!');
      // Track activity and check badges
      await trackActivity(currentUser.id, 'discussion', 5);
    }
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ChapterDiscussionReply.create(data);
      await base44.entities.ChapterDiscussion.update(selectedDiscussion.id, {
        replies_count: (selectedDiscussion.replies_count || 0) + 1
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['discussionReplies']);
      queryClient.invalidateQueries(['chapterDiscussions']);
      setReplyContent('');
      toast.success('Reply posted!');
      // Track activity
      await trackActivity(currentUser.id, 'reply', 2);
    }
  });

  const handleCreateDiscussion = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    createDiscussionMutation.mutate({
      user_id: currentUser.id,
      book,
      chapter: parseInt(chapter),
      translation,
      title: title.trim(),
      content: content.trim(),
      verse_reference: verseRef.trim() || null
    });
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;

    createReplyMutation.mutate({
      discussion_id: selectedDiscussion.id,
      user_id: currentUser.id,
      content: replyContent.trim()
    });
  };

  if (selectedDiscussion) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedDiscussion(null)} className="mb-2">
          ← Back to discussions
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{selectedDiscussion.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{getUserName(selectedDiscussion.user_id)}</span>
                  {selectedDiscussion.verse_reference && (
                    <Badge variant="outline">{selectedDiscussion.verse_reference}</Badge>
                  )}
                  {selectedDiscussion.is_resolved && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none mb-6">
              <ReactMarkdown>{selectedDiscussion.content}</ReactMarkdown>
            </div>

            {/* Replies */}
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-sm">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h4>
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-indigo-600">
                      {getUserName(reply.user_id).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{getUserName(reply.user_id)}</p>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <div className="border-t pt-4">
              <Textarea
                placeholder="Add your thoughts..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleReply} disabled={!replyContent.trim()}>
                Post Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          Chapter Discussions
        </h3>
        <Button onClick={() => setShowNewDiscussion(!showNewDiscussion)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          New Discussion
        </Button>
      </div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Discussion title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Verse reference (optional, e.g., v5-8)"
              value={verseRef}
              onChange={(e) => setVerseRef(e.target.value)}
            />
            <Textarea
              placeholder="What would you like to discuss or ask about this chapter?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateDiscussion}>Start Discussion</Button>
              <Button variant="outline" onClick={() => setShowNewDiscussion(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      {discussions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm">
              No discussions yet for {book} {chapter}.
              <br />
              Start one to share questions or insights!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {discussions.map((discussion) => (
            <Card
              key={discussion.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedDiscussion(discussion)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{discussion.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{discussion.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{getUserName(discussion.user_id)}</span>
                      {discussion.verse_reference && (
                        <Badge variant="outline" className="text-xs">{discussion.verse_reference}</Badge>
                      )}
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {discussion.replies_count || 0}
                      </span>
                      {discussion.is_resolved && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Resolved</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}