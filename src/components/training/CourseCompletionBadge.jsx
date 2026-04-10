import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Share2, Download } from 'lucide-react';

export default function CourseCompletionBadge({
  courseTitle,
  badgesEarned,
  pointsEarned,
  onShare,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-8 text-center rounded-t-xl">
          {/* Animated Badge */}
          <div className="inline-block animate-bounce mb-4">
            <Award className="w-16 h-16 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-white/90">You completed</p>
          <p className="text-lg font-semibold text-white">{courseTitle}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Rewards */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {badgesEarned || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Badges Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                +{pointsEarned || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Points</p>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center">
            Your progress has been recorded. Keep up the great work on your
            spiritual journey!
          </p>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t">
            <Button
              onClick={onShare}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Share2 className="w-4 h-4" />
              Share Achievement
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Continue Learning
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}