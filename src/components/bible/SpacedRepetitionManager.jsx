import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SpacedRepetitionManager({ book, chapter, verse, endVerse, verseText, translation, currentUser, isDarkMode }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: memItem } = useQuery({
    queryKey: ['memorizationItem', currentUser?.id, book, chapter, verse],
    queryFn: async () => {
      if (!currentUser) return null;
      const result = await base44.entities.MemorizationItem.filter({
        user_id: currentUser.id,
        book,
        chapter,
        verse
      }, '-created_date', 1);
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!currentUser
  });

  const addToMemo = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      return base44.entities.MemorizationItem.create({
        user_id: currentUser.id,
        book,
        chapter,
        verse,
        end_verse: endVerse || verse,
        verse_text: verseText,
        translation,
        status: 'learning',
        next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        added_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorizationItem'] });
      setIsAdding(false);
    }
  });

  const recordReview = useMutation({
    mutationFn: async (difficulty) => {
      if (!memItem) return;
      
      // Calculate next review based on spaced repetition algorithm
      const reviewCount = (memItem.review_count || 0) + 1;
      let daysUntilNextReview = 1;
      
      if (difficulty === 'easy') {
        daysUntilNextReview = reviewCount === 1 ? 3 : reviewCount === 2 ? 7 : 14;
      } else if (difficulty === 'medium') {
        daysUntilNextReview = reviewCount === 1 ? 2 : reviewCount === 2 ? 5 : 10;
      } else {
        daysUntilNextReview = 1;
      }

      const nextReview = new Date(Date.now() + daysUntilNextReview * 24 * 60 * 60 * 1000);
      const newStatus = reviewCount >= 3 ? 'mastered' : 'reviewing';

      return base44.entities.MemorizationItem.update(memItem.id, {
        review_count: reviewCount,
        last_reviewed: new Date().toISOString(),
        next_review_date: nextReview.toISOString(),
        status: newStatus,
        difficulty
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorizationItem'] });
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'learning': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'mastered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return (
      <p className="text-xs text-gray-500">Login to save verses for memorization</p>
    );
  }

  return (
    <div className="space-y-2">
      {!memItem ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => addToMemo.mutate()}
          disabled={addToMemo.isPending}
          className="gap-2 w-full"
        >
          <Plus className="w-4 h-4" />
          Add to Memorization
        </Button>
      ) : (
        <Card style={{
          backgroundColor: isDarkMode ? '#1A1F1C' : '#F9FAFB',
          borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB'
        }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Memorization
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(memItem.status)}`}>
                {memItem.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs space-y-1">
              <p><strong>Reviews:</strong> {memItem.review_count || 0}/3 completed</p>
              {memItem.next_review_date && (
                <p><strong>Next review:</strong> {new Date(memItem.next_review_date).toLocaleDateString()}</p>
              )}
            </div>

            {memItem.status !== 'mastered' && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">How well did you know it?</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => recordReview.mutate('hard')}
                    disabled={recordReview.isPending}
                    className="flex-1"
                  >
                    Hard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => recordReview.mutate('medium')}
                    disabled={recordReview.isPending}
                    className="flex-1"
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => recordReview.mutate('easy')}
                    disabled={recordReview.isPending}
                    className="flex-1"
                  >
                    Easy
                  </Button>
                </div>
              </div>
            )}

            {memItem.status === 'mastered' && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                <CheckCircle2 className="w-4 h-4" />
                <span>You've mastered this verse!</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}