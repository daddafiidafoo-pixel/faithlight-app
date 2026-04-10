import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import Skeleton from '@/components/ui/skeleton';

export default function PrayerStreakBadge({ currentStreak, loading }) {
  if (loading) {
    return <Skeleton className="h-9 w-12 rounded-full" />;
  }

  if (!currentStreak || currentStreak === 0) {
    return (
      <div className="px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-1">
        <span>🙏 Start</span>
      </div>
    );
  }

  // Dynamic color based on streak length
  let bgColor = 'bg-orange-100 text-orange-700'; // 1-6 days
  let borderColor = 'border-orange-300';

  if (currentStreak >= 7 && currentStreak < 14) {
    bgColor = 'bg-red-100 text-red-700'; // 7-13 days
    borderColor = 'border-red-300';
  } else if (currentStreak >= 14 && currentStreak < 30) {
    bgColor = 'bg-purple-100 text-purple-700'; // 14-29 days
    borderColor = 'border-purple-300';
  } else if (currentStreak >= 30) {
    bgColor = 'bg-yellow-100 text-yellow-700'; // 30+ days
    borderColor = 'border-yellow-300';
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-3 py-2 rounded-full ${bgColor} border ${borderColor} text-xs font-bold flex items-center gap-1.5 shadow-sm`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Flame size={14} />
      </motion.div>
      {currentStreak}
    </motion.div>
  );
}