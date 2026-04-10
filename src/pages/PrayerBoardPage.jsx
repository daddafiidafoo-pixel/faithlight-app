import React from 'react';
import CommunityPrayerBoard from '@/components/prayer/CommunityPrayerBoard';

export default function PrayerBoardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Prayer Board</h1>
          <p className="text-gray-600">Share and support prayer requests in our community</p>
        </div>

        <CommunityPrayerBoard />
      </div>
    </div>
  );
}