import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Share2, Loader2 } from 'lucide-react';

/**
 * Daily personalized devotional widget
 * Shows AI-generated reflection prompt tailored to user
 */
export default function DailyDevotionalWidget({ userId }) {
  const [showResponse, setShowResponse] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const queryClient = useQueryClient();

  // Get today's devotional
  const { data: devotional, isLoading } = useQuery({
    queryKey: ['daily-devotional', userId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const devotionals = await base44.entities.PersonalizedDevotional.filter({
        user_id: userId,
        devotional_date: today,
      });

      if (devotionals.length > 0) {
        return devotionals[0];
      }

      // Generate new devotional if doesn't exist
      const response = await base44.functions.invoke('generatePersonalizedDevotional', {
        user_id: userId,
      });

      return response.data.devotional;
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async () => {
      if (!devotional) return;
      await base44.entities.PersonalizedDevotional.update(devotional.id, {
        is_read: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-devotional'] });
    },
  });

  // Save response mutation
  const saveResponseMutation = useMutation({
    mutationFn: async () => {
      if (!devotional) return;
      await base44.entities.PersonalizedDevotional.update(devotional.id, {
        user_response: userResponse,
      });
    },
    onSuccess: () => {
      setUserResponse('');
      setShowResponse(false);
      queryClient.invalidateQueries({ queryKey: ['daily-devotional'] });
    },
  });

  // Mark as read on open
  useEffect(() => {
    if (devotional && !devotional.is_read) {
      markReadMutation.mutate();
    }
  }, [devotional?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600" />
          <p className="text-sm text-gray-600 mt-2">Preparing your devotional...</p>
        </CardContent>
      </Card>
    );
  }

  if (!devotional) return null;

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <CardTitle className="text-lg">Today's Devotional</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scripture */}
        <div>
          <p className="text-sm font-semibold text-amber-900 mb-1">
            {devotional.scripture_reference}
          </p>
          <p className="text-sm text-gray-700 italic">"{devotional.scripture_text}"</p>
        </div>

        {/* Devotional Title */}
        <div>
          <h3 className="font-semibold text-gray-900">{devotional.title}</h3>
        </div>

        {/* Personalized Insight */}
        <div className="bg-white rounded-lg p-4 border border-amber-100">
          <p className="text-xs font-semibold text-gray-900 mb-2">For Your Journey:</p>
          <p className="text-sm text-gray-700">{devotional.personalized_insight}</p>
        </div>

        {/* Reflection Prompt */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-xs font-semibold text-gray-900 mb-2">Reflect & Respond:</p>
          <p className="text-sm text-gray-700 mb-3">{devotional.reflection_prompt}</p>

          {showResponse ? (
            <div className="space-y-2">
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Share your thoughts..."
                rows="3"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => saveResponseMutation.mutate()}
                  disabled={!userResponse.trim() || saveResponseMutation.isPending}
                >
                  Save Response
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowResponse(false);
                    setUserResponse('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setShowResponse(true)}
            >
              {devotional.user_response ? '✓ You responded' : 'Share Your Reflection'}
            </Button>
          )}
        </div>

        {/* Share Button */}
        <Button
          variant="ghost"
          className="w-full gap-2 text-amber-700 hover:bg-amber-100"
          onClick={() => {
            navigator.clipboard.writeText(
              `"${devotional.scripture_text}"\n${devotional.title}\n\n${devotional.personalized_insight}`
            );
            alert('Copied to clipboard!');
          }}
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </CardContent>
    </Card>
  );
}