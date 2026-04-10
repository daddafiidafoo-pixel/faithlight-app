import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function PrayerRequestCard({ request, onPrayedFor }) {
  const createdTime = new Date(request.created_date);
  const now = new Date();
  const diffMs = now - createdTime;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = '';
  if (diffDays > 0) {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours}h ago`;
  } else {
    timeAgo = 'Just now';
  }

  const categoryColors = {
    health: 'bg-red-50 border-red-200',
    family: 'bg-blue-50 border-blue-200',
    work: 'bg-green-50 border-green-200',
    faith: 'bg-purple-50 border-purple-200',
    relationships: 'bg-pink-50 border-pink-200',
    finances: 'bg-yellow-50 border-yellow-200',
    other: 'bg-gray-50 border-gray-200',
  };

  return (
    <Card className={`border ${categoryColors[request.category]}`}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white border capitalize">
                {request.category}
              </span>
              <span className="text-xs text-gray-600">{timeAgo}</span>
              {request.is_anonymous && (
                <span className="text-xs text-gray-500">Anonymous</span>
              )}
            </div>
            <CardTitle className="text-base">{request.content.substring(0, 100)}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {request.content.length > 100 && (
          <p className="text-sm text-gray-700 mb-4">{request.content}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1 text-sm font-medium text-red-600">
            <Heart className="w-4 h-4 fill-red-500" />
            <span>{request.prayer_count || 0} prayers</span>
          </div>

          <Button
            onClick={onPrayedFor}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Heart className="w-4 h-4" />
            Prayed for this
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}