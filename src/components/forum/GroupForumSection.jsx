import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, Plus, ThumbsUp, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import CreateGroupForumTopicModal from './CreateGroupForumTopicModal';

const CATEGORY_OPTIONS = [
  'general', 'bible-study', 'prayer', 'theology', 'worship', 
  'youth', 'women', 'men', 'marriage', 'parenting', 'discipleship', 'missions'
];

const CATEGORY_COLORS = {
  'general': 'bg-gray-100 text-gray-800',
  'bible-study': 'bg-blue-100 text-blue-800',
  'prayer': 'bg-purple-100 text-purple-800',
  'theology': 'bg-indigo-100 text-indigo-800',
  'worship': 'bg-pink-100 text-pink-800',
  'youth': 'bg-green-100 text-green-800',
  'women': 'bg-rose-100 text-rose-800',
  'men': 'bg-cyan-100 text-cyan-800',
  'marriage': 'bg-amber-100 text-amber-800',
  'parenting': 'bg-orange-100 text-orange-800',
  'discipleship': 'bg-teal-100 text-teal-800',
  'missions': 'bg-lime-100 text-lime-800',
};

export default function GroupForumSection({ groupId, user, isGroupMember }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: topics = [], refetch } = useQuery({
    queryKey: ['group-forum-topics', groupId],
    queryFn: async () => {
      const allTopics = await base44.entities.ForumTopic.filter(
        { group_id: groupId, status: 'active' },
        '-created_date'
      );
      return allTopics.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
        return new Date(b.last_reply_date || b.created_date) - new Date(a.last_reply_date || a.created_date);
      });
    },
  });

  const { data: userUpvotes = [] } = useQuery({
    queryKey: ['user-forum-upvotes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return base44.entities.ForumUpvote.filter({ user_id: user.id });
    },
    enabled: !!user?.id,
  });

  const filteredTopics = useMemo(() => {
    let result = topics;

    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [topics, selectedCategory, searchQuery]);

  const upvoteMutation = useMutation({
    mutationFn: async (topicId) => {
      const existingUpvote = userUpvotes.find(u => u.topic_id === topicId && u.upvote_type === 'topic');
      
      if (existingUpvote) {
        // Remove upvote
        await base44.entities.ForumUpvote.delete(existingUpvote.id);
        await base44.entities.ForumTopic.update(topicId, {
          upvotes_count: Math.max(0, (topics.find(t => t.id === topicId)?.upvotes_count || 1) - 1)
        });
      } else {
        // Add upvote
        await base44.entities.ForumUpvote.create({
          user_id: user.id,
          topic_id: topicId,
          upvote_type: 'topic'
        });
        await base44.entities.ForumTopic.update(topicId, {
          upvotes_count: (topics.find(t => t.id === topicId)?.upvotes_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-forum-topics', groupId]);
      queryClient.invalidateQueries(['user-forum-upvotes', user?.id]);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Group Forum
          </h2>
          <p className="text-gray-600 mt-1">Discuss topics and share ideas</p>
        </div>
        {isGroupMember && user && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Topic
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Filter by Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No discussions yet. Start the conversation!</p>
              {isGroupMember && user && (
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Topic
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTopics.map(topic => {
            const hasUpvoted = userUpvotes.some(u => u.topic_id === topic.id && u.upvote_type === 'topic');
            
            return (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={CATEGORY_COLORS[topic.category]}>
                          {topic.category}
                        </Badge>
                        {topic.is_pinned && (
                          <Badge className="bg-yellow-100 text-yellow-800">Pinned</Badge>
                        )}
                      </div>
                      <Link to={createPageUrl(`GroupForumTopic?id=${topic.id}`)}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
                          {topic.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{topic.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>By {topic.author_name}</span>
                        <span>•</span>
                        <span>{new Date(topic.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      {user && (
                        <button
                          onClick={() => upvoteMutation.mutate(topic.id)}
                          disabled={upvoteMutation.isPending}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            hasUpvoted
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-medium">{topic.upvotes_count || 0}</span>
                        </button>
                      )}
                      <div className="flex items-center gap-1 text-gray-600">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">{topic.replies_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {isGroupMember && user && showCreateModal && (
        <CreateGroupForumTopicModal
          groupId={groupId}
          user={user}
          onClose={() => setShowCreateModal(false)}
          onTopicCreated={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}