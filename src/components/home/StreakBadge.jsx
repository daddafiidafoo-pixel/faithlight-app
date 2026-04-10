import React from 'react';
import { Flame } from 'lucide-react';
import { useI18n } from '../I18nProvider';

export default function StreakBadge({ streak = 0 }) {
  const { t } = useI18n();

  if (streak === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200 flex items-center gap-3 shadow-sm">
      <div className="text-2xl">🔥</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">
          {streak} {t('streak.dayStreak', 'Day Streak')}
        </p>
        <p className="text-xs text-gray-600">
          {t('streak.keepGoing', 'Keep going! Come back tomorrow.')}
        </p>
      </div>
    </div>
  );
}