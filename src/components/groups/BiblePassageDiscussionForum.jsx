import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Heart, Reply, Loader2, BookOpen, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function BiblePassageDiscussionForum({ groupId, user, isAdmin }) {
  const [selectedPassage, setSelectedPassage] = useState('John 3:16');
  const [newTopic, setNewTopic] = useState('');
  const [newTopicPassage, setNewTopicPassage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [replies, setReplies] = useState({});
  const queryClient = useQueryClient();

  const { data: topics = [] } = useQuery({
    queryKey: ['discussion-topics', groupId],
    queryFn: () => base44.entities.GroupForumPost?.filter?.({ group_id: groupId }, '-created_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  const createTopicMutation = useMutation({
    mutationFn: async () => {
      if (!newTopic.trim() || !newTopicPassage.trim()) return;
      return base44.entities.GroupForumPost?.create?.({
        group_id: groupId,
        author_id: user.id,
        author_name: user.full_name,
        title: newTopic,
        bible_passage: newTopicPassage,
        content: newTopic,
        created_at: new Date().toISOString(),
        replies_count: 0,
      });
    },
    onSuccess: () => {
      toast.success('Discussion started!');
      setNewTopic('');
      setNewTopicPassage('');
      setOpenDialog(false);
      queryClient.invalidateQueries(['discussion-topics', groupId]);
    },
    onError: () => toast.error('Failed to create discussion'),
  });

  const mockTopics = [
    {
      id: 'topic-1',
      title: 'What does this verse mean to you personally?',
      passage: 'John 3:16',
      author: 'Sarah Johnson',
      authorId: '1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      views: 24,
      replies: 8,
      likes: 5,
      excerpt: 'I\'ve been reflecting on this verse and wondering what it truly means in our modern context...',
    },
    {
      id: 'topic-2',
      title: 'Theological implications of sacrifice',
      passage: '1 Corinthians 13:1-13',
      author: 'Michael Chen',
      authorId: '2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      views: 18,
      replies: 12,
      likes: 3,
      excerpt: 'Let\'s discuss how Paul\'s definition of love compares to worldly definitions...',
    },
  ];

  const mockReplies = {
    'topic-1': [
      { id: 'r-1', author: 'John Doe', text: 'This verse reminds me of God\'s unconditional love for us.', likes: 2, time: '1 day ago' },
      { id: 'r-2', author: 'Emma Davis', text: 'The sacrifice aspect really stands out to me in this passage.', likes: 1, time: '18 hours ago' },
    ],
    'topic-2': [
      { id: 'r-3', author: 'Pastor Mike', text: 'Great point! Love is the foundation of all Christian virtues.', likes: 3, time: '2 days ago' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Passage Discussion Forum
        </h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Start Discussion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Bible Passage</label>
                <Input
                  placeholder="e.g., John 3:16 or Romans 1:1-5"
                  value={newTopicPassage}
                  onChange={e => setNewTopicPassage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Discussion Topic</label>
                <Input
                  placeholder="What would you like to discuss about this passage?"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => createTopicMutation.mutate()}
                disabled={createTopicMutation.isPending}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {createTopicMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Start Discussion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Passage Filter */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Filter by passage</p>
          <div className="flex gap-2 flex-wrap">
            {['John 3:16', '1 Corinthians 13', 'Psalm 23', 'Matthew 5-7', 'Romans 8'].map(passage => (
              <Badge
                key={passage}
                variant={selectedPassage === passage ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedPassage(passage)}
              >
                {passage}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topics List */}
      <div className="space-y-3">
        {mockTopics.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <p className="text-gray-500">No discussions yet. Be the first to start one!</p>
          </Card>
        ) : (
          mockTopics.map(topic => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <Badge variant="secondary" className="text-xs font-mono">{topic.passage}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{topic.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">By <strong>{topic.author}</strong> • {topic.createdAt.toLocaleDateString()}</p>
                </div>

                {/* Excerpt */}
                <p className="text-sm text-gray-700 mb-3 italic">"{topic.excerpt}"</p>

                {/* Stats */}
                <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200 flex-wrap">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {topic.views} views
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {topic.replies} replies
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> {topic.likes} likes
                  </div>
                </div>

                {/* Recent Replies */}
                {mockReplies[topic.id]?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                    <p className="text-xs font-bold text-gray-600 uppercase">Recent replies</p>
                    {mockReplies[topic.id].slice(0, 2).map(reply => (
                      <div key={reply.id} className="text-sm">
                        <p className="font-medium text-gray-900">{reply.author}</p>
                        <p className="text-gray-700 text-xs">{reply.text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{reply.time}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Reply className="w-4 h-4" />
                    Reply
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2">
                    <Heart className="w-4 h-4" />
                    Like
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}