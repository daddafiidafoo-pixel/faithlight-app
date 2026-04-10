import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Radio, Video, Users, Search, Plus, AlertCircle, ChevronDown } from 'lucide-react';
import { format, isPast, isBefore, addMinutes } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LiveEventsPage() {
  const [user, setUser] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('soonest');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const rooms = await base44.entities.LiveRoom.list('-created_date', 100);
        setAllRooms(rooms);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setLoading(false);
      }
    };

    fetchRooms();

    // Subscribe to new events
    const unsub = base44.entities.LiveRoom.subscribe(event => {
      if (event.type === 'create') {
        setAllRooms(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setAllRooms(prev => prev.map(r => r.id === event.id ? event.data : r));
      }
    });

    return unsub;
  }, []);

  // Categorize rooms
  const liveRooms = allRooms.filter(r => r.status === 'live');
  const upcomingRooms = allRooms.filter(r => {
    const scheduledTime = new Date(r.scheduled_start);
    return r.status === 'scheduled' && !isPast(scheduledTime);
  });
  const pastRooms = allRooms.filter(r => r.status === 'ended');

  // Filter & sort rooms
  const filterAndSortRooms = (rooms) => {
    let filtered = rooms.filter(r =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.host_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(r => r.visibility === visibilityFilter);
    }

    // Sort
    if (sortBy === 'soonest') {
      filtered.sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return filtered;
  };

  const RoomCard = ({ room, isHost }) => {
    const scheduledTime = new Date(room.scheduled_start);
    const isLive = room.status === 'live';
    const isEnded = room.status === 'ended';
    const canJoin = isLive || (room.status === 'scheduled' && !isPast(scheduledTime));

    const handleJoin = () => {
      window.location.href = createPageUrl(`LiveRoom?id=${room.id}`);
    };

    const handleViewDetails = () => {
      window.location.href = createPageUrl(`LiveEventDetail?id=${room.id}`);
    };

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={isLive ? 'bg-red-500 animate-pulse' : isEnded ? 'bg-gray-600' : 'bg-amber-500'}>
              {isLive ? '🔴 LIVE' : isEnded ? '✓ ENDED' : '📅 UPCOMING'}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {room.type === 'audio_stage' ? '🎙️ Audio' : '📹 Video'}
            </Badge>
          </div>
          <CardTitle className="text-lg line-clamp-2">{room.title}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">by {room.host_name}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {format(scheduledTime, 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {format(scheduledTime, 'p')}
            </div>
          </div>

          {room.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{room.description}</p>
          )}

          <div className="flex gap-2">
            {canJoin && (
              <Button
                size="sm"
                className="flex-1 gap-2 bg-[var(--faith-light-primary)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoin();
                }}
              >
                <span>{isLive ? '▶️ Join Live' : '📍 Join'}</span>
              </Button>
            )}
            {isEnded && room.recording_url && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(room.recording_url);
                }}
              >
                <span>🎥 Watch</span>
              </Button>
            )}
            {!isLive && !canJoin && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                disabled
              >
                Event Started
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--faith-light-bg)] to-[var(--faith-light-bg-secondary)] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--faith-light-primary-dark)]">Live Events</h1>
            <p className="text-gray-600 mt-1">Join or schedule live audio and video sessions</p>
          </div>
          <Button
            onClick={() => window.location.href = createPageUrl('CreateLiveEvent')}
            className="gap-2 bg-[var(--faith-light-primary)]"
          >
            <Plus className="w-5 h-5" />
            Schedule Event
          </Button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search events by title or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="audio_stage">🎙️ Audio</SelectItem>
                <SelectItem value="video">📹 Video</SelectItem>
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="group">My Groups</SelectItem>
                <SelectItem value="invite_only">Invite Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soonest">Soonest</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Now ({liveRooms.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              📅 Upcoming ({upcomingRooms.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              ✓ Past ({pastRooms.length})
            </TabsTrigger>
          </TabsList>

          {/* LIVE TAB */}
          <TabsContent value="live" className="mt-6">
            {filterAndSortRooms(liveRooms).length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No live events right now</p>
                <Button
                  onClick={() => window.location.href = createPageUrl('CreateLiveEvent')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start an Event
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterAndSortRooms(liveRooms).map(room => (
                  <RoomCard key={room.id} room={room} isHost={user?.id === room.host_id} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* UPCOMING TAB */}
          <TabsContent value="upcoming" className="mt-6">
            {filterAndSortRooms(upcomingRooms).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No upcoming events scheduled</p>
                <Button
                  onClick={() => window.location.href = createPageUrl('CreateLiveEvent')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Event
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterAndSortRooms(upcomingRooms).map(room => (
                  <RoomCard key={room.id} room={room} isHost={user?.id === room.host_id} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* PAST TAB */}
          <TabsContent value="past" className="mt-6">
            {filterAndSortRooms(pastRooms).length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No past events yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterAndSortRooms(pastRooms).map(room => (
                  <RoomCard key={room.id} room={room} isHost={user?.id === room.host_id} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}