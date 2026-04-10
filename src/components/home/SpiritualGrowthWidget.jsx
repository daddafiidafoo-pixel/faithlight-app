import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Flame, TrendingUp, BookOpen } from 'lucide-react';

export default function SpiritualGrowthWidget() {
  const [user, setUser] = useState(null);
  const [streaks, setStreaks] = useState({ reading: 0, prayer: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setStreaks({
        reading: currentUser?.reading_streak || 0,
        prayer: currentUser?.prayer_streak || 0,
      });
    } catch (err) {
      console.error('Failed to load streaks:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Your Spiritual Growth
        </h3>
        <Flame className="w-6 h-6 text-orange-300" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/20 rounded-lg p-3">
          <p className="text-sm text-indigo-100">Reading Streak</p>
          <p className="text-2xl font-bold">{streaks.reading}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <p className="text-sm text-indigo-100">Prayer Streak</p>
          <p className="text-2xl font-bold">{streaks.prayer}</p>
        </div>
      </div>

      <p className="text-sm text-indigo-100 mb-4">
        Stay consistent in your daily reading and prayer to unlock milestones and badges!
      </p>

      <div className="flex gap-2">
        <Link to={createPageUrl('SpiritualGrowthDashboard')} className="flex-1">
          <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-semibold gap-2">
            <TrendingUp className="w-4 h-4" />
            View Dashboard
          </Button>
        </Link>
        <Link to={createPageUrl('CustomStudyPlanBuilder')} className="flex-1">
          <Button className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold gap-2">
            <BookOpen className="w-4 h-4" />
            Create Plan
          </Button>
        </Link>
      </div>
    </div>
  );
}