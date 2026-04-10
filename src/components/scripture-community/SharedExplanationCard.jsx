import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bookmark, MessageCircle, ThumbsUp, Share2, Lock, Globe } from 'lucide-react';

export default function SharedExplanationCard({ explanation, onComment, onUpvote }) {
  const [showFull, setShowFull] = useState(false);

  return (
    <Card className="bg-white border-indigo-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{explanation.question}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600">By {explanation.user_name}</span>
              {explanation.privacy === 'public' && (
                <Globe className="w-3 h-3 text-green-600" />
              )}
              {explanation.privacy === 'private' && (
                <Lock className="w-3 h-3 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Scripture Reference */}
        {explanation.scripture_reference && (
          <div className="mb-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
            📖 {explanation.scripture_reference}
          </div>
        )}

        {/* Category Badge */}
        <div className="mb-3">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {explanation.category}
          </span>
        </div>

        {/* Content Preview */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 line-clamp-3">
            {explanation.ai_response}
          </p>
          {explanation.ai_response.length > 200 && !showFull && (
            <button
              onClick={() => setShowFull(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
            >
              Read more...
            </button>
          )}
        </div>

        {/* Personal Notes */}
        {explanation.personal_notes && (
          <div className="mb-3 p-2 bg-amber-50 border-l-2 border-amber-300 rounded">
            <p className="text-xs text-gray-700 italic">💭 {explanation.personal_notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            onClick={() => onUpvote(explanation.id)}
            variant="ghost"
            size="sm"
            className="flex-1 text-xs gap-1"
          >
            <ThumbsUp className="w-3 h-3" />
            {explanation.upvotes}
          </Button>
          <Button
            onClick={() => onComment(explanation.id)}
            variant="ghost"
            size="sm"
            className="flex-1 text-xs gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            {explanation.comment_count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs gap-1"
          >
            <Share2 className="w-3 h-3" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
}