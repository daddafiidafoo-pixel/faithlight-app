import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Plus, Edit, Trash2, Eye, Radio } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import CreateStreamModal from '../components/livestream/CreateStreamModal';
import StreamControlPanel from '../components/livestream/StreamControlPanel';
import { toast } from 'sonner';

export default function LiveStreamAdmin() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.user_role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['live-streams-admin'],
    queryFn: async () => {
      return await base44.entities.LiveStream.list('-scheduled_start', 50);
    },
  });

  const deleteStreamMutation = useMutation({
    mutationFn: async (streamId) => {
      await base44.entities.LiveStream.delete(streamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['live-streams-admin']);
      toast.success('Stream deleted');
    },
  });

  const liveStreams = streams.filter(s => s.status === 'live');
  const scheduledStreams = streams.filter(s => s.status === 'scheduled');
  const endedStreams = streams.filter(s => s.status === 'ended');

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-red-600';
      case 'scheduled': return 'bg-blue-600';
      case 'ended': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Video className="w-10 h-10 text-red-600" />
              Live Stream Management
            </h1>
            <p className="text-gray-600 mt-2">Schedule and manage live streaming events</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Stream
          </Button>
        </div>

        {/* Live Now Section */}
        {liveStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-600 animate-pulse" />
              Live Now
            </h2>
            <div className="grid gap-4">
              {liveStreams.map(stream => (
                <Card key={stream.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-red-600 animate-pulse">● LIVE</Badge>
                          <h3 className="text-xl font-bold">{stream.title}</h3>
                        </div>
                        <p className="text-gray-700 mb-2">{stream.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>👁 {stream.viewer_count} watching</span>
                          <span>📈 Peak: {stream.peak_viewers}</span>
                          <span>Started: {format(parseISO(stream.actual_start), 'p')}</span>
                        </div>
                      </div>
                      <Button onClick={() => setSelectedStream(stream)} className="bg-red-600">
                        Manage Stream
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Streams */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Scheduled Streams</h2>
          {scheduledStreams.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No scheduled streams</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {scheduledStreams.map(stream => (
                <Card key={stream.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(stream.status)}>
                            {stream.status.toUpperCase()}
                          </Badge>
                          <h3 className="text-xl font-bold">{stream.title}</h3>
                        </div>
                        <p className="text-gray-700 mb-2">{stream.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📅 {format(parseISO(stream.scheduled_start), 'PPP p')}</span>
                          <span>🎥 {stream.stream_type}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStream(stream)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteStreamMutation.mutate(stream.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Streams */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Streams</h2>
          <div className="grid gap-4">
            {endedStreams.slice(0, 5).map(stream => (
              <Card key={stream.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{stream.title}</h3>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(stream.scheduled_start), 'PPP')} • {stream.total_views} views
                      </p>
                    </div>
                    {stream.recording_url && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Recording
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateStreamModal user={user} onClose={() => setShowCreateModal(false)} />
      )}

      {selectedStream && (
        <StreamControlPanel stream={selectedStream} onClose={() => setSelectedStream(null)} />
      )}
    </div>
  );
}