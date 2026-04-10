import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PullToRefresh from '@/components/PullToRefresh';
import StreakDashboard from '@/components/gamification/StreakDashboard';
import OfflineDownloadManager from '@/components/offline/OfflineDownloadManager';
import SocialPrayerWall from '@/components/prayer/SocialPrayerWall';
import { BarChart3, Download, Heart } from 'lucide-react';

export default function DailyProgressDashboard() {
  const [activeTab, setActiveTab] = useState('streak');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-b from-purple-600 to-indigo-600 text-white p-6 safe-area-top">
          <h1 className="text-3xl font-bold mb-2">Daily Progress</h1>
          <p className="text-indigo-100">Track your reading journey & community prayers</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 bg-white sticky top-0 z-10 border-b border-slate-200">
          {[
            { id: 'streak', label: 'Streak & XP', icon: BarChart3 },
            { id: 'offline', label: 'Offline', icon: Download },
            { id: 'prayer', label: 'Prayer Wall', icon: Heart },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'streak' && <StreakDashboard />}
          {activeTab === 'offline' && <OfflineDownloadManager />}
          {activeTab === 'prayer' && <SocialPrayerWall />}
        </div>
      </div>
    </PullToRefresh>
  );
}