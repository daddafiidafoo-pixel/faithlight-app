import React from 'react';
import ReadingPlanDashboard from '@/components/reading/ReadingPlanDashboard';

export default function ReadingPlanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reading Plans</h1>
          <p className="text-gray-600">Track your daily Bible reading progress</p>
        </div>

        <ReadingPlanDashboard />
      </div>
    </div>
  );
}