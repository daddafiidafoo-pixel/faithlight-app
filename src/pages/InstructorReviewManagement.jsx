import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InstructorReviewDashboard from '../components/instructor/InstructorReviewDashboard';

export default function InstructorReviewManagement() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          window.location.href = '/';
          return;
        }

        if (!['teacher', 'pastor', 'admin'].includes(currentUser.user_role)) {
          window.location.href = '/';
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.log('Not logged in');
        window.location.href = '/';
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Review Management</h1>
          <p className="text-lg text-gray-600">
            Manage student reviews and respond to feedback on your courses
          </p>
        </div>

        {/* Dashboard */}
        <InstructorReviewDashboard instructorId={user.id} />
      </div>
    </div>
  );
}