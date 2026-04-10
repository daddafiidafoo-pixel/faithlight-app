import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users } from 'lucide-react';
import InstructorOfficeHoursDashboard from '@/components/officehours/InstructorOfficeHoursDashboard';
import OfficeHoursBrowser from '@/components/officehours/OfficeHoursBrowser';

export default function OfficeHours() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  if (!user) return null;

  const isInstructor = ['teacher', 'pastor', 'admin'].includes(user.user_role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-indigo-600" />
            Office Hours
          </h1>
          <p className="text-gray-600 mt-2">Connect with instructors for 1-on-1 or group sessions</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="browser" className="space-y-6">
          <TabsList className="grid w-full max-w-md gap-4">
            <TabsTrigger value="browser" className="gap-2">
              <Users className="w-4 h-4" />
              Find Sessions
            </TabsTrigger>
            {isInstructor && (
              <TabsTrigger value="manage" className="gap-2">
                <Calendar className="w-4 h-4" />
                My Schedule
              </TabsTrigger>
            )}
          </TabsList>

          {/* Browser Tab */}
          <TabsContent value="browser">
            <OfficeHoursBrowser user={user} />
          </TabsContent>

          {/* Instructor Management Tab */}
          {isInstructor && (
            <TabsContent value="manage">
              <InstructorOfficeHoursDashboard instructor={user} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}