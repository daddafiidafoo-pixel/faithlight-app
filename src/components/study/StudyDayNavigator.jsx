import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DailyGoalsPanel from './DailyGoalsPanel';
import StudyDayNotepad from './StudyDayNotepad';
import { base44 } from '@/api/base44Client';

export default function StudyDayNavigator({ plan, progress, onDayChange, currentDay = 0, studyPlanId, userId }) {
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  
  const totalDays = plan?.plan_items?.length || plan?.duration_days || 0;
  const completedDays = progress?.completed_days || [];

  // Fetch goals for current day
  useEffect(() => {
    if (studyPlanId && userId) {
      fetchDailyGoals();
    }
  }, [selectedDay, studyPlanId, userId]);

  const fetchDailyGoals = async () => {
    setGoalsLoading(true);
    try {
      const goals = await base44.entities.DailyStudyGoal.filter({
        study_plan_id: studyPlanId,
        day_index: selectedDay,
        user_id: userId,
      });
      setDailyGoals(goals);
    } catch (error) {
      console.error('Error fetching daily goals:', error);
    } finally {
      setGoalsLoading(false);
    }
  };
  
  const handlePrevious = () => {
    if (selectedDay > 0) {
      setSelectedDay(selectedDay - 1);
      onDayChange?.(selectedDay - 1);
    }
  };

  const handleNext = () => {
    if (selectedDay < totalDays - 1) {
      setSelectedDay(selectedDay + 1);
      onDayChange?.(selectedDay + 1);
    }
  };

  if (!plan || totalDays === 0) return null;

  const currentDayData = plan.plan_items?.[selectedDay] || {};
  const dayLabel = currentDayData.label || `Day ${selectedDay + 1}`;
  const isCompleted = completedDays.includes(selectedDay);
  const percentComplete = ((completedDays.length / totalDays) * 100).toFixed(0);
  const goalsCompleted = dailyGoals.filter(g => g.completed).length;
  const goalsPercent = dailyGoals.length > 0 ? Math.round((goalsCompleted / dailyGoals.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Day Progress Bar */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{dayLabel}</h3>
            <p className="text-sm text-gray-600">
              Day {selectedDay + 1} of {totalDays}
            </p>
          </div>
          <div className="flex gap-2">
            {isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Day Complete</span>
              </div>
            )}
            {dailyGoals.length > 0 && goalsPercent === 100 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Goals Met</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Study Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{percentComplete}% Complete</p>
          </div>
          
          {dailyGoals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Daily Goals ({goalsCompleted}/{dailyGoals.length})</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goalsPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{goalsPercent}% Goals Complete</p>
            </div>
          )}
        </div>
      </div>

      {/* Day Content Preview */}
      {currentDayData && (
        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-3">Today's Study</h4>
          
          {currentDayData.book && currentDayData.chapter && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-indigo-700 font-medium">Reading:</span>{' '}
                <span className="text-indigo-900">
                  {currentDayData.book} {currentDayData.chapter}
                  {currentDayData.verse && `:${currentDayData.verse}`}
                </span>
              </p>
            </div>
          )}

          {currentDayData.scripture_reading && (
            <p className="text-sm text-indigo-800 mt-3 italic">
              "{currentDayData.scripture_reading}"
            </p>
          )}

          {currentDayData.focus && (
            <p className="text-sm mt-3">
              <span className="text-indigo-700 font-medium">Focus:</span>{' '}
              {currentDayData.focus}
            </p>
          )}
        </div>
      )}

      {/* Daily Goals and Notes */}
      {studyPlanId && userId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyGoalsPanel
            studyPlanId={studyPlanId}
            dayIndex={selectedDay}
            userId={userId}
          />
          <StudyDayNotepad
            studyPlanId={studyPlanId}
            dayIndex={selectedDay}
            userId={userId}
          />
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrevious}
          disabled={selectedDay === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Day
        </Button>

        {/* Day Indicator */}
        <div className="text-sm font-medium text-gray-600">
          {selectedDay + 1} / {totalDays}
        </div>

        <Button
          onClick={handleNext}
          disabled={selectedDay === totalDays - 1}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          Next Day
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      </div>
      );
      }