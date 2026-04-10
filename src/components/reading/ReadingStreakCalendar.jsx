import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ReadingStreakCalendar({ planId, bookCode }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [planId, bookCode]);

  const loadProgress = async () => {
    try {
      const user = await base44.auth.me();
      const records = await base44.entities.ReadingPlanProgress.filter({
        userEmail: user.email,
        planId,
        bookCode
      });
      
      if (records.length > 0) {
        setProgress(records[0]);
      }
    } catch (error) {
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading progress...</div>;
  if (!progress) return <div className="text-center py-8 text-gray-500">No progress yet</div>;

  // Build calendar
  const startDate = new Date(progress.startDate);
  const today = new Date();
  const daysTotal = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const readingDatesSet = new Set(progress.readingDates || []);

  // Calendar weeks
  let weeks = [];
  let currentWeek = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < daysTotal; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isRead = readingDatesSet.has(dateStr);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push({ date: dateStr, isRead, dayOfWeek: date.getDay() });
  }

  if (currentWeek.length > 0) weeks.push(currentWeek);

  const milestoneIcons = {
    'Week Warrior': '⚔️',
    'Fortnight Faithful': '📖',
    'Month Master': '👑',
    'Bible Champion': '🏆'
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{progress.currentStreak}</p>
          <p className="text-xs text-gray-600">Current Streak</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{progress.longestStreak}</p>
          <p className="text-xs text-gray-600">Longest Streak</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{progress.completedChapters?.length || 0}</p>
          <p className="text-xs text-gray-600">Chapters Read</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(progress.completionPercentage)}%</p>
          <p className="text-xs text-gray-600">Completed</p>
        </Card>
      </div>

      {/* Reading Calendar */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Reading Calendar</h3>
        <div className="space-y-3">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex gap-1.5">
              {dayLabels.map((label, dIdx) => {
                const day = week.find(d => d.dayOfWeek === dIdx);
                return (
                  <div key={dIdx} className="flex-1 text-center">
                    {day ? (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">{label}</p>
                        <div className={`h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                          day.isRead
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {new Date(day.date).getDate()}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">{label}</p>
                        <div className="h-10 bg-gray-50 rounded-lg" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Milestones */}
      {progress.milestonesAchieved && progress.milestonesAchieved.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-gray-900 mb-3">🎉 Milestones Achieved</h3>
          <div className="flex flex-wrap gap-2">
            {progress.milestonesAchieved.map((milestone, idx) => (
              <Badge key={idx} className="bg-amber-200 text-amber-900 text-base py-2 px-3">
                {milestoneIcons[milestone]} {milestone}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}