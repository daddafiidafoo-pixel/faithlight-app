import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function BookProgressBar({ user, book, totalChapters, isDarkMode }) {
  const { data: progress = [] } = useQuery({
    queryKey: ['readingProgress', user?.id, book],
    queryFn: () => base44.entities.ReadingProgress.filter(
      { user_id: user.id, book }, 'chapter', 300
    ).catch(() => []),
    enabled: !!user?.id && !!book,
    staleTime: 30000,
  });

  if (!user || !book || !totalChapters) return null;

  const completed = new Set(progress.map(p => p.chapter)).size;
  const percent = Math.min(100, Math.round((completed / totalChapters) * 100));

  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const barBg = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const barFill = percent === 100 ? '#22C55E' : (isDarkMode ? '#8FB996' : '#6B8E6E');

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: mutedColor }}>
          {book}
        </span>
        <span className="text-xs font-semibold" style={{ color: textColor }}>
          {completed}/{totalChapters} {percent === 100 ? '✓' : ''}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: barBg }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: barFill }}
        />
      </div>
    </div>
  );
}