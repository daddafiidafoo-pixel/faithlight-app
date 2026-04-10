import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Users } from 'lucide-react';
import MentorshipProgressTracker from '../components/mentorship/MentorshipProgressTracker';
import { createPageUrl } from '../utils';

export default function MentorshipDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const connectionId = searchParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    getUser();
  }, []);

  const { data: connection, isLoading } = useQuery({
    queryKey: ['mentorship-connection', connectionId],
    queryFn: async () => {
      const connections = await base44.entities.MentorshipConnection.filter({ id: connectionId }, '-created_date', 1);
      return connections[0];
    },
    enabled: !!connectionId,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 mb-4">Mentorship not found</p>
          <Button onClick={() => navigate('/FindMentor')}>
            Back to Mentorships
          </Button>
        </div>
      </div>
    );
  }

  const isMentor = connection.mentor_id === user.id;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={() => navigate('/FindMentor')}
          variant="ghost"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Mentorship Details
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    {connection.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Role</h3>
                  <p className="text-gray-900">{isMentor ? 'Mentor' : 'Mentee'}</p>
                </div>

                {connection.focus_areas && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Focus Areas</h3>
                    <div className="flex gap-2 flex-wrap">
                      {connection.focus_areas.map((area, idx) => (
                        <Badge key={idx} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {connection.goals && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Goals</h3>
                    <p className="text-gray-700">{connection.goals}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <MentorshipProgressTracker connection={connection} isMentor={isMentor} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full gap-2"
                  onClick={() => window.location.href = createPageUrl('DirectMessages')}
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-700">
                  {isMentor ? '• Meet regularly and be consistent' : '• Come prepared with questions'}
                </p>
                <p className="text-sm text-gray-700">
                  {isMentor ? '• Listen actively and ask questions' : '• Be open and honest'}
                </p>
                <p className="text-sm text-gray-700">
                  {isMentor ? '• Share your experiences' : '• Apply what you learn'}
                </p>
                <p className="text-sm text-gray-700">
                  {isMentor ? '• Pray for your mentee' : '• Set specific goals'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}