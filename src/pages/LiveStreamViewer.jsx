import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Radio, Clock, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import LiveStreamPlayer from '../components/livestream/LiveStreamPlayer';
import LiveChatPanel from '../components/livestream/LiveChatPanel';
import { toast } from 'sonner';

export default function LiveStreamViewer() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['live-streams-public'],
    queryFn: async () => {
      return await base44.entities.LiveStream.list('-scheduled_start', 50);
    },
  });

  const liveStreams = streams.filter(s => s.status === 'live');
  const upcomingStreams = streams.filter(s => s.status === 'scheduled');
  const recordedStreams = streams.filter(s => s.status === 'ended' && s.recording_url);

  const getStreamTypeIcon = (type) => {
    switch (type) {
      case 'service': return '⛪';
      case 'sermon': return '📖';
      case 'worship': return '🎵';
      case 'prayer': return '🙏';
      case 'bible_study': return '📚';
      case 'conference': return '🎤';
      default: return '🎥';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="w-10 h-10 text-red-600" />
            Live Streaming
          </h1>
          <p className="text-gray-600 mt-2">Join live services and watch recordings</p>
        </div>

        {/* Live Now */}
        {liveStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-600 animate-pulse" />
              Live Now
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {liveStreams.map(stream => (
                <Card key={stream.id} className="hover:shadow-lg transition-shadow cursor-pointer border-red-200" onClick={() => setSelectedStream(stream)}>
                  {stream.thumbnail_url && (
                    <div className="relative">
                      <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-48 object-cover rounded-t-lg" />
                      <Badge className="absolute top-3 left-3 bg-red-600 animate-pulse">
                        ● LIVE
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{getStreamTypeIcon(stream.stream_type)}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{stream.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{stream.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {stream.viewer_count} watching
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Streams */}
        {upcomingStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Coming Up
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingStreams.map(stream => (
                <Card key={stream.id} className="hover:shadow-lg transition-shadow">
                  {stream.thumbnail_url && (
                    <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-32 object-cover rounded-t-lg" />
                  )}
                  <CardContent className="p-4">
                    <Badge className="bg-blue-600 mb-2">Scheduled</Badge>
                    <h3 className="font-bold mb-2">{stream.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{stream.description}</p>
                    <div className="text-sm text-gray-600">
                      <div>📅 {format(parseISO(stream.scheduled_start), 'PPP')}</div>
                      <div>🕐 {format(parseISO(stream.scheduled_start), 'p')}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recordings */}
        {recordedStreams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Recordings</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordedStreams.map(stream => (
                <Card key={stream.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedStream(stream)}>
                  {stream.thumbnail_url && (
                    <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-32 object-cover rounded-t-lg" />
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">{stream.title}</h3>
                    <div className="text-sm text-gray-600">
                      <div>📅 {format(parseISO(stream.scheduled_start), 'PPP')}</div>
                      <div>👁 {stream.total_views} views</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {liveStreams.length === 0 && upcomingStreams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No live streams at the moment. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedStream && (
        <LiveStreamPlayer
          stream={selectedStream}
          user={user}
          onClose={() => setSelectedStream(null)}
        />
      )}
    </div>
  );
}