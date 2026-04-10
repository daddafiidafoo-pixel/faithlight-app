import React from "react";
import { Flame, Target, Award } from "lucide-react";

export default function StreakDisplay({
  streak,
  milestones,
  onRecordActivity,
  streakType,
}) {
  const handleRecordActivity = async () => {
    if (onRecordActivity) {
      await onRecordActivity(streakType);
    }
  };

  if (!streak) {
    return (
      <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Start Your {streakType} Streak!</h3>
            <p className="mt-1 text-white/80">
              Build consistent spiritual habits and earn rewards
            </p>
          </div>
          <button
            onClick={handleRecordActivity}
            className="rounded-xl bg-white px-4 py-2 font-semibold text-violet-600 hover:bg-white/90"
          >
            Start Now
          </button>
        </div>
      </div>
    );
  }

  const nextMilestoneIndex = milestones.findIndex(
    (m) => m.milestone_day > streak.current_streak
  );
  const nextMilestone =
    nextMilestoneIndex >= 0
      ? milestones[nextMilestoneIndex]
      : milestones[milestones.length - 1];

  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((streak.current_streak / nextMilestone.milestone_day) * 100))
    : 100;

  return (
    <div className="space-y-4">
      {/* Main Streak Card */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Flame className="h-12 w-12" />
            <div>
              <p className="text-sm text-white/80">Current Streak</p>
              <h3 className="text-4xl font-bold">{streak.current_streak}</h3>
              <p className="text-sm text-white/80">days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Best Streak</p>
            <p className="text-2xl font-bold">{streak.longest_streak}</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Next Milestone</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {nextMilestone.milestone_name}
              </p>
              <p className="text-sm text-slate-500">
                {nextMilestone.milestone_day - streak.current_streak} days to go
              </p>
            </div>
            <Award className="h-10 w-10 text-amber-500" />
          </div>
          <div className="mt-4 h-3 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {progressToNext}% progress • +{nextMilestone.reward_points} points
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-600">Total Days</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {streak.total_days_completed}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-600">Points Earned</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {streak.points_earned}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-600">Last Activity</p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {new Date(streak.last_activity_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Record Activity Button */}
      <button
        onClick={handleRecordActivity}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg"
      >
        ✓ Record Today's {streakType === "prayer" ? "Prayer" : "Bible Study"}
      </button>
    </div>
  );
}