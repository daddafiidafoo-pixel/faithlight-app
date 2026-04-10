import React, { useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ChapterProgressTracker({ user, book, chapter }) {
  const queryClient = useQueryClient();

  const { data: progress } = useQuery({
    queryKey: ['chapterProgress', user?.id, book, chapter],
    queryFn: async () => {
      if (!user || !book || !chapter) return null;
      const result = await base44.entities.ChapterProgress.filter({
        user_id: user.id,
        book,
        chapter
      }, '-created_date', 1);
      return result?.[0] || null;
    },
    enabled: !!user && !!book && !!chapter
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (progress) {
        await base44.entities.ChapterProgress.update(progress.id, {
          read_count: (progress.read_count || 1) + 1,
          completion_date: new Date().toISOString()
        });
      } else {
        await base44.entities.ChapterProgress.create({
          user_id: user.id,
          book,
          chapter,
          completed: true,
          completion_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chapterProgress', user.id, book, chapter]);
    }
  });

  // Auto-mark complete when chapter is viewed
  useEffect(() => {
    if (user && book && chapter && !progress) {
      const timer = setTimeout(() => {
        markCompleteMutation.mutate();
      }, 5000); // Mark complete after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [user, book, chapter, progress]);

  if (!user || !book || !chapter) return null;

  return (
    <div className="flex items-center gap-2">
      {progress ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Completed {progress.read_count > 1 ? `(${progress.read_count}x)` : ''}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-400">
          <Circle className="w-5 h-5" />
          <span className="text-sm">Reading...</span>
        </div>
      )}
    </div>
  );
}