import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Eye, TrendingUp, User, BookOpen, Target, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FollowButton from './FollowButton';
import ReportButton from '../moderation/ReportButton';

export default function EnhancedTopicCard({ topic, currentUser, showFollow = true }) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sermon': return BookOpen;
      case 'study_plan': return Target;
      case 'theological': return MessageCircle;
      default: return MessageCircle;
    }
  };

  const CategoryIcon = getCategoryIcon(topic.category);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon className="w-4 h-4 text-indigo-600" />
              <Badge variant="outline">{topic.category}</Badge>
              {topic.is_pinned && (
                <Badge className="bg-yellow-100 text-yellow-800">Pinned</Badge>
              )}
            </div>
            <Link to={createPageUrl('ForumTopic') + `?id=${topic.id}`}>
              <h3 className="font-bold text-lg text-gray-900 hover:text-indigo-600 mb-1">
                {topic.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 line-clamp-2">{topic.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{topic.author_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{topic.reply_count || 0} replies</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{topic.view_count || 0} views</span>
          </div>
        </div>

        {topic.tags && topic.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {topic.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {topic.related_sermon_id && (
          <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>Related to sermon discussion</span>
          </div>
        )}

        {topic.related_study_plan_id && (
          <div className="bg-green-50 p-2 rounded text-xs text-green-800 flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>Part of study plan discussion</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link to={createPageUrl('ForumTopic') + `?id=${topic.id}`}>
            <Button size="sm" variant="outline">
              View Discussion
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {currentUser && (
              <ReportButton
                contentId={topic.id}
                contentType="forum_topic"
                contentPreview={topic.description || topic.title}
                authorId={topic.author_id}
                authorName={topic.author_name}
              />
            )}
            {showFollow && currentUser && (
              <FollowButton
                currentUser={currentUser}
                followingType="topic"
                followingId={topic.id}
                followingName={topic.title}
                variant="outline"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}