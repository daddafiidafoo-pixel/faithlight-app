import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, Calendar, Users, MessageCircle, Eye, Video } from 'lucide-react';
import { format, parseISO, isFuture } from 'date-fns';
import LiveStreamPlayer from '../components/livestream/LiveStreamPlayer';
import LiveStreamChat from '../components/livestream/LiveStreamChat';
import { toast } from 'sonner';

export default function LiveStreamView() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: streams = [] } = useQuery({
    queryKey: ['live-streams-public'],
    queryFn: async () => {
      return await base44.entities.LiveStream.filter(
        { status: { $in: ['scheduled', 'live', 'ended'] } },
        '-scheduled_start',
        50
      );
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const liveStreams = streams.filter(s => s.status === 'live');
  const upcomingStreams = streams.filter(s => s.status === 'scheduled' && isFuture(parseISO(s.scheduled_start)));
  const recordedStreams = streams.filter(s => s.status === 'ended' && s.recording_url);

  const viewStreamMutation = useMutation({
    mutationFn: async (streamId) => {
      const stream = streams.find(s => s.id === streamId);
      if (stream) {
        await base44.entities.LiveStream.update(streamId, {
          viewer_count: (stream.viewer_count || 0) + 1,
          peak_viewers: Math.max(stream.peak_viewers || 0, (stream.viewer_count || 0) + 1),
          total_views: (stream.total_views || 0) + 1
        });
      }
    },
  });

  const handleWatchStream = (stream) => {
    setSelectedStream(stream);
    if (stream.status === 'live') {
      viewStreamMutation.mutate(stream.id);
    }
  };

  const getStatusBadge = (stream) => {
    if (stream.status === 'live') {
      return <Badge className="bg-red-600 text-white animate-pulse">🔴 LIVE</Badge>;
    }
    if (stream.status === 'scheduled') {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Recording</Badge>;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="w-10 h-10 text-red-600" />
            Live Streams
          </h1>
          <p className="text-gray-600 mt-2">Watch live services and events, or catch up on recordings</p>
        </div>

        {/* Selected Stream Player */}
        {selectedStream && (
          <div className="mb-8">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <LiveStreamPlayer stream={selectedStream} />
                  </div>
                  {selectedStream.chat_enabled && (
                    <div className="lg:col-span-1 border-l">
                      <LiveStreamChat stream={selectedStream} user={user} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stream Tabs */}
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList>
            <TabsTrigger value="live" className="gap-2">
              <Radio className="w-4 h-4" />
              Live Now ({liveStreams.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingStreams.length})</TabsTrigger>
            <TabsTrigger value="recordings">Recordings ({recordedStreams.length})</TabsTrigger>
          </TabsList>

          {/* Live Streams */}
          <TabsContent value="live" className="space-y-4">
            {liveStreams.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Radio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No live streams at the moment</p>
                  <p className="text-sm text-gray-500 mt-2">Check back soon or view upcoming streams</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {liveStreams.map(stream => (
                  <Card key={stream.id} className="hover:shadow-lg transition-shadow cursor-pointer border-red-200" onClick={() => handleWatchStream(stream)}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {stream.thumbnail_url && (
                          <img src={stream.thumbnail_url} alt={stream.title} className="w-48 h-32 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(stream)}
                            <h3 className="text-xl font-bold">{stream.title}</h3>
                          </div>
                          <p className="text-gray-600 mb-3">{stream.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {stream.viewer_count || 0} watching
                            </span>
                            <span>Started {format(parseISO(stream.actual_start), 'p')}</span>
                            {stream.chat_enabled && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                Chat enabled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Upcoming Streams */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingStreams.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming streams scheduled</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingStreams.map(stream => (
                  <Card key={stream.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {stream.thumbnail_url && (
                          <img src={stream.thumbnail_url} alt={stream.title} className="w-48 h-32 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(stream)}
                            <h3 className="text-xl font-bold">{stream.title}</h3>
                          </div>
                          <p className="text-gray-600 mb-3">{stream.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{format(parseISO(stream.scheduled_start), 'PPP p')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recordings */}
          <TabsContent value="recordings" className="space-y-4">
            {recordedStreams.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No recordings available yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recordedStreams.map(stream => (
                  <Card key={stream.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleWatchStream(stream)}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {stream.thumbnail_url && (
                          <img src={stream.thumbnail_url} alt={stream.title} className="w-48 h-32 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(stream)}
                            <h3 className="text-xl font-bold">{stream.title}</h3>
                          </div>
                          <p className="text-gray-600 mb-3">{stream.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{format(parseISO(stream.actual_start), 'PPP')}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {stream.total_views || 0} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}