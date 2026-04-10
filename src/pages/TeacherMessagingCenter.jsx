import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Loader2, MessageSquare } from 'lucide-react';
import TeacherMessagingHub from '../components/teacher/TeacherMessagingHub';

export default function TeacherMessagingCenter() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!['teacher', 'admin'].includes(currentUser.user_role)) {
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

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: () => base44.entities.Course.filter({ teacher_id: user.id }),
    enabled: !!user,
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Messaging Center</h1>
          </div>
          <p className="text-gray-600">Send messages to your students</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No courses found. Create a course to send messages.</p>
          </div>
        ) : (
          <TeacherMessagingHub teacherId={user.id} courses={courses} />
        )}
      </div>
    </div>
  );
}