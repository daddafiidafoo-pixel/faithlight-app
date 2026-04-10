import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import LessonEditor from '../components/course/LessonEditor';

export default function CreateLesson() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!['teacher', 'admin', 'pastor'].includes(currentUser.user_role)) {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, [navigate]);

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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyCourses'))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create a New Lesson</h1>
            <p className="text-gray-600">Build engaging lessons with text, videos, and more</p>
          </div>
        </div>

        <LessonEditor
          onLessonCreated={() => navigate(createPageUrl('MyCourses'))}
        />
      </div>
    </div>
  );
}