import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import EnhancedStudyPlanBuilder from '../components/ai/EnhancedStudyPlanBuilder';
import { Button } from '@/components/ui/button';

export default function AIStudyPlanBuilder() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign in Required</h2>
          <p className="text-gray-500 text-sm">Sign in to create personalized Bible study plans with AI.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Study Plan Builder</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Create personalized Bible study plans tailored to your audience, duration, and learning goals.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>AI-Generated Plans:</strong> All passages and schedules are AI-generated. Always verify Scripture references in your Bible and adapt plans to your group's needs.
          </div>
        </div>

        {/* Builder */}
        <EnhancedStudyPlanBuilder user={user} onComplete={() => {}} />
      </div>
    </div>
  );
}