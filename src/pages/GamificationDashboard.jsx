import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import StreakDisplay from "@/components/gamification/StreakDisplay";
import { getStreakData, updateDailyStreak } from "@/lib/streakService";

export default function GamificationDashboard() {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState({ prayer: null, bible_study: null });
  const [milestones, setMilestones] = useState({
    prayer: [],
    bible_study: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) loadStreaks();
  }, [user?.email]);

  const loadStreaks = async () => {
    setLoading(true);
    try {
      const prayerData = await getStreakData(user.email, "prayer");
      const studyData = await getStreakData(user.email, "bible_study");

      setStreaks({
        prayer: prayerData.streak,
        bible_study: studyData.streak,
      });
      setMilestones({
        prayer: prayerData.milestones,
        bible_study: studyData.milestones,
      });
    } catch (error) {
      console.error("Error loading streaks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordActivity = async (streakType) => {
    try {
      const result = await updateDailyStreak(user.email, streakType);

      if (result.milestone) {
        // Show celebration
        setTimeout(() => {
          alert(`🎉 Milestone Unlocked: ${result.milestone.name}! +${result.milestone.points} points`);
        }, 500);
      } else if (!result.alreadyRecorded) {
        alert("✅ Activity recorded! Keep the streak going!");
      }

      await loadStreaks();
    } catch (error) {
      console.error("Error recording activity:", error);
      alert("Failed to record activity. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-48 rounded-3xl bg-slate-200" />
            <div className="h-48 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Spiritual Streaks</h1>
          <p className="mt-2 text-slate-600">
            Build consistent habits and unlock rewards through daily commitment
          </p>
        </div>

        {/* Prayer Streak */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">🙏 Prayer</h2>
          <StreakDisplay
            streak={streaks.prayer}
            milestones={milestones.prayer}
            onRecordActivity={handleRecordActivity}
            streakType="prayer"
          />
        </div>

        {/* Bible Study Streak */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">📖 Bible Study</h2>
          <StreakDisplay
            streak={streaks.bible_study}
            milestones={milestones.bible_study}
            onRecordActivity={handleRecordActivity}
            streakType="bible_study"
          />
        </div>

        {/* Combined Stats */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Overall Progress</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-violet-600">
                {(streaks.prayer?.points_earned || 0) +
                  (streaks.bible_study?.points_earned || 0)}
              </p>
              <p className="text-sm text-slate-600 mt-1">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {(milestones.prayer?.length || 0) + (milestones.bible_study?.length || 0)}
              </p>
              <p className="text-sm text-slate-600 mt-1">Milestones Unlocked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {(streaks.prayer?.total_days_completed || 0) +
                  (streaks.bible_study?.total_days_completed || 0)}
              </p>
              <p className="text-sm text-slate-600 mt-1">Days Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}