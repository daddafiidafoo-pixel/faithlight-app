import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Loader2, MessageSquare } from 'lucide-react';
import StudentMessageInbox from '../components/student/StudentMessageInbox';

export default function StudentMessageInboxPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          </div>
          <p className="text-gray-600">View messages from your teachers</p>
        </div>

        <StudentMessageInbox studentId={user.id} />
      </div>
    </div>
  );
}