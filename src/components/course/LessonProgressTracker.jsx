import React, { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startLesson,
  completeLessonProgress,
  updateLessonProgress,
  updateCourseProgress,
} from '../../functions/courseProgressManager';

export default function LessonProgressTracker({ userId, lessonId, courseId, onProgressUpdate }) {
  const queryClient = useQueryClient();
  const progressRef = useRef(null);
  const timerRef = useRef(null);

  const startLessonMutation = useMutation({
    mutationFn: () => startLesson(userId, lessonId, courseId),
    onSuccess: (progress) => {
      progressRef.current = progress;
      if (onProgressUpdate) onProgressUpdate(progress);
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ position, percentage }) =>
      updateLessonProgress(progressRef.current?.id, position, percentage),
  });

  const completeProgressMutation = useMutation({
    mutationFn: async () => {
      await completeLessonProgress(progressRef.current?.id);
      await updateCourseProgress(userId, courseId);
      queryClient.invalidateQueries(['user-course-progress']);
    },
    onSuccess: () => {
      if (onProgressUpdate) {
        onProgressUpdate({ ...progressRef.current, status: 'completed' });
      }
    },
  });

  // Start lesson on mount
  useEffect(() => {
    if (userId && lessonId && courseId) {
      startLessonMutation.mutate();
    }
  }, [userId, lessonId, courseId]);

  // Track time spent
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (progressRef.current) {
        progressRef.current.time_spent_seconds += 1;
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const updateProgress = (position, percentage) => {
    updateProgressMutation.mutate({ position, percentage });
  };

  const completeLesson = () => {
    completeProgressMutation.mutate();
  };

  const resume = (position) => {
    return progressRef.current?.last_position || position;
  };

  return {
    progress: progressRef.current,
    updateProgress,
    completeLesson,
    resume,
    isLoading: startLessonMutation.isPending || completeProgressMutation.isPending,
  };
}