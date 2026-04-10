import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, Pin, Lock, Search, Plus } from 'lucide-react';
import CreateTopicModal from './CreateTopicModal';

export default function CourseForumBrowser({ courseId, lessonId, onSelectTopic, userId, userRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const { data: topics = [], isLoading, refetch } = useQuery({
    queryKey: ['course-forum-topics', courseId, lessonId],
    queryFn: async () => {
      const query = { course_id: courseId };
      if (lessonId) query.lesson_id = lessonId;

      const result = await base44.entities.CourseForumTopic.filter(
        query,
        '-last_reply_at',
        100
      );
      return result || [];
    },
  });

  // Get all unique tags
  const allTags = [...new Set(topics.flatMap((t) => t.tags || []))];

  // Filter topics
  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (topic.tags && topic.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Sort: pinned first, then by last reply
  const sortedTopics = filteredTopics.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    return new Date(b.last_reply_at || b.created_date) - new Date(a.last_reply_at || a.created_date);
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">Loading discussions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Topic</span>
        </Button>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !selectedTag
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({topics.length})
          </button>
          {allTags.map((tag) => {
            const count = topics.filter((t) => t.tags?.includes(tag)).length;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-3">
        {sortedTopics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedTag
                  ? 'No discussions match your filter'
                  : 'No discussions yet. Start the conversation!'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create First Topic
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedTopics.map((topic) => (
            <Card
              key={topic.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectTopic(topic.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.is_pinned && (
                        <Pin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                      {topic.is_locked && (
                        <Lock className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <h3 className="font-semibold text-gray-900 truncate">
                        {topic.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {topic.content}
                    </p>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {topic.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>By {topic.author_name}</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {topic.reply_count} replies
                      </span>
                      <span>{topic.view_count} views</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {topic.is_locked && (
                    <Badge variant="destructive" className="flex-shrink-0">
                      Locked
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <CreateTopicModal
          courseId={courseId}
          lessonId={lessonId}
          userId={userId}
          onTopicCreated={() => {
            setShowCreateModal(false);
            refetch();
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}