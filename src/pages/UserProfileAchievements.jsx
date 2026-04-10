import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MilestonesSection from '@/components/profile/MilestonesSection';

export default function UserProfileAchievements() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Achievements</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user?.full_name || user?.email}</p>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <MilestonesSection />
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-900 mb-2">💡 Tip</p>
          <p className="text-sm text-blue-800">
            Badges are awarded automatically as you engage with the app. Complete reading plans, pray daily, take quizzes, and listen to verses to unlock more achievements!
          </p>
        </div>
      </div>
    </div>
  );
}