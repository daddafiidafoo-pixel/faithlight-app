import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, BarChart3 } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import FeedbackViewer from '@/components/feedback/FeedbackViewer';
import FeedbackAggregator from '@/components/feedback/FeedbackAggregator';
import FeedbackResponseManager from '@/components/feedback/FeedbackResponseManager';

export default function InstructorFeedbackDashboard() {
  const [user, setUser] = useState(null);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const isAuthorized = ['admin', 'teacher', 'pastor'].includes(currentUser.user_role);
        if (!isAuthorized) {
          window.location.href = '/Home';
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-indigo-600" />
            Feedback Management
          </h1>
          <p className="text-gray-600 mt-2">Manage course feedback and improvements</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-feedback" className="space-y-6">
          <TabsList className="grid w-full max-w-md gap-4">
            <TabsTrigger value="my-feedback">My Feedback</TabsTrigger>
            {isAdmin && <TabsTrigger value="manage">Manage & Respond</TabsTrigger>}
            {isAdmin && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          {/* My Feedback Tab */}
          <TabsContent value="my-feedback" className="space-y-6">
            <FeedbackViewer />
            <Card>
              <CardHeader>
                <CardTitle>Submit New Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setFeedbackFormOpen(true)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Submit Feedback
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin: Manage & Respond */}
          {isAdmin && (
            <TabsContent value="manage">
              <FeedbackResponseManager />
            </TabsContent>
          )}

          {/* Admin: Analytics */}
          {isAdmin && (
            <TabsContent value="analytics">
              <FeedbackAggregator />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Feedback Form Dialog */}
      <FeedbackForm
        open={feedbackFormOpen}
        onOpenChange={setFeedbackFormOpen}
        user={user}
      />
    </div>
  );
}