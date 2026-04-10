import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Clock } from 'lucide-react';

export default function StartServiceRoom() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goLiveNow, setGoLiveNow] = useState(true);
  const [scheduledStart, setScheduledStart] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        navigate('/');
      }
    };
    getUser();
  }, [navigate]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a service title');
      return;
    }

    try {
      setLoading(true);
      const room = await base44.entities.ServiceRoom.create({
        title: title.trim(),
        host_id: user.id,
        host_name: user.full_name,
        description: description.trim(),
        status: goLiveNow ? 'live' : 'scheduled',
        scheduled_start: goLiveNow ? null : scheduledStart,
        actual_start: goLiveNow ? new Date().toISOString() : null,
        video_limit: 6,
        max_audio_participants: 500,
        chat_enabled: true,
        prayer_requests_enabled: true,
        reactions_enabled: true,
      });

      navigate(`/ServiceRoom?roomId=${room.id}`);
    } catch (error) {
      console.error('Failed to start service:', error);
      alert('Failed to start service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Start Service</h1>
          <p className="text-gray-600">Go live with your Sunday service or gathering</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Service Title *
                </label>
                <Input
                  placeholder="e.g., Sunday Service – Cornerstone Church"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="What's today's service about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  When?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={goLiveNow}
                      onChange={() => setGoLiveNow(true)}
                    />
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        Go Live Now
                      </div>
                      <p className="text-xs text-gray-500">Start immediately</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={!goLiveNow}
                      onChange={() => setGoLiveNow(false)}
                    />
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Schedule
                      </div>
                      <p className="text-xs text-gray-500">Set a start time</p>
                    </div>
                  </label>
                </div>

                {!goLiveNow && (
                  <div className="mt-4">
                    <input
                      type="datetime-local"
                      value={scheduledStart}
                      onChange={(e) => setScheduledStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              {goLiveNow ? '🔴 Go Live Now' : '📅 Schedule Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}