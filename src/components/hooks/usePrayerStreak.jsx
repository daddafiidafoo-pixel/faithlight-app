import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Fetches user's prayer streak data from UserStreak entity
 * This is the source of truth for streak calculations
 */
export function usePrayerStreak(userEmail) {
  const { data: streakData, isLoading, error } = useQuery({
    queryKey: ['userStreak', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const results = await base44.entities.UserStreak.filter({
        userEmail
      });
      return results.length > 0 ? results[0] : null;
    },
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5 // 5 minute cache
  });

  return {
    currentStreak: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
    lastStreakDate: streakData?.lastStreakDate || null,
    lastPrayerDate: streakData?.lastPrayerDate || null,
    totalPrayerDays: streakData?.totalPrayerDays || 0,
    loading: isLoading,
    error
  };
}