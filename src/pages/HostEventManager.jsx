import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Clock, Play, CheckCircle, Pencil, Trash2, Radio, RotateCcw, Calendar, Users, ChevronRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ScheduleLiveEventModal from '@/components/community/ScheduleLiveEventModal';
import EditLiveEventModal from '@/components/live/EditLiveEventModal';

const CATEGORY_LABELS = {
  bible_study: { label: 'Bible Study', emoji: '📖' },
  qa_session: { label: 'Q&A', emoji: '❓' },
  prayer_meeting: { label: 'Prayer', emoji: '🙏' },
  sermon: { label: 'Sermon', emoji: '⛪' },
  workshop: { label: 'Workshop', emoji: '🎓' },
  webinar: { label: 'Webinar', emoji: '💻' },
  small_group: { label: 'Small Group', emoji: '👥' },
  broadcast_service: { label: 'Broadcast', emoji: '📡' },
  bible_study_room: { label: 'Bible Study', emoji: '📖' },
};

function StatusBadge({ status }) {
  if (status === 'live') return <Badge className="bg-red-600 text-white gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE</Badge>;
  if (status === 'scheduled') return <Badge className="bg-blue-100 text-blue-800 gap-1"><Clock className="w-3 h-3" />Scheduled</Badge>;
  return <Badge className="bg-gray-100 text-gray-600 gap-1"><CheckCircle className="w-3 h-3" />Ended</Badge>;
}

function EventRow({ event, onEdit, onDelete, onStartNow }) {
  const cat = CATEGORY_LABELS[event.event_type || event.room_type] || { label: 'Event', emoji: '📅' };
  const startTime = event.scheduled_start || event.start_time;
  const isPast = event.status === 'ended';
  const isLive = event.status === 'live';
  const isScheduled = event.status === 'scheduled';

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Category icon */}
      <div className="text-2xl w-10 text-center flex-shrink-0">{cat.emoji}</div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 truncate">{event.title}</p>
          <StatusBadge status={event.status} />
          {event.is_recurring && <Badge variant="outline" className="text-xs gap-1"><RotateCcw className="w-2.5 h-2.5" />Recurring</Badge>}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {startTime ? format(new Date(startTime), 'MMM d, yyyy · h:mm a') : 'Time not set'}
          </span>
          {event.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.duration_minutes}m
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {event.type === 'video' ? `Up to ${event.max_participants || 10}` : `${event.max_audience || 500} cap`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isLive && (
          <Link to={`${createPageUrl('LiveRoom')}?roomId=${event.id}`}>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 gap-1"><Radio className="w-3.5 h-3.5" />Enter</Button>
          </Link>
        )}
        {isScheduled && (
          <>
            <Button size="sm" variant="outline" className="gap-1 text-green-700 border-green-300 hover:bg-green-50" onClick={() => onStartNow(event)}>
              <Play className="w-3.5 h-3.5" />Start Now
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(event)}><Pencil className="w-4 h-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
                <AlertDialogDescription>This will delete the scheduled event. This action cannot be undone.</AlertDialogDescription>
                <div className="flex gap-3">
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(event.id)} className="bg-red-600 hover:bg-red-700">Yes, cancel it</AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        {isPast && (
          <Link to={`${createPageUrl('LiveEventDetail')}?id=${event.id}`}>
            <Button size="sm" variant="ghost" className="gap-1 text-gray-500"><ChevronRight className="w-4 h-4" /></Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function HostEventManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl('Home')));
  }, []);

  const { data: myEvents = [] } = useQuery({
    queryKey: ['my-hosted-events', user?.id],
    queryFn: () => base44.entities.LiveRoom.filter({ host_id: user.id }, '-created_date', 200),
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  const liveEvents = myEvents.filter(e => e.status === 'live');
  const scheduledEvents = myEvents.filter(e => e.status === 'scheduled').sort((a, b) => {
    const ta = a.scheduled_start || a.start_time;
    const tb = b.scheduled_start || b.start_time;
    return new Date(ta) - new Date(tb);
  });
  const pastEvents = myEvents.filter(e => e.status === 'ended').sort((a, b) => {
    const ta = a.ended_at || a.actual_start;
    const tb = b.ended_at || b.actual_start;
    return new Date(tb) - new Date(ta);
  });

  const handleDelete = async (id) => {
    await base44.entities.LiveRoom.delete(id);
    toast.success('Event cancelled');
    queryClient.invalidateQueries(['my-hosted-events']);
  };

  const handleStartNow = async (event) => {
    await base44.entities.LiveRoom.update(event.id, {
      status: 'live',
      actual_start: new Date().toISOString(),
    });
    toast.success('Event started!');
    navigate(`${createPageUrl('LiveRoom')}?roomId=${event.id}`);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries(['my-hosted-events']);
    queryClient.invalidateQueries(['live-events']);
  };

  // Upcoming this week
  const now = new Date();
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeek = scheduledEvents.filter(e => {
    const t = e.scheduled_start || e.start_time;
    return t && new Date(t) >= now && new Date(t) <= oneWeek;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="text-gray-500 mt-1">Manage your scheduled and live sessions</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('CreateLiveRoom')}>
              <Button variant="outline" className="gap-2"><Radio className="w-4 h-4" />Go Live Now</Button>
            </Link>
            <Button onClick={() => setShowScheduleModal(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" />Schedule Event
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Live Now', value: liveEvents.length, color: 'text-red-600', bg: 'bg-red-50', icon: Radio },
            { label: 'Upcoming', value: scheduledEvents.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
            { label: 'Total Hosted', value: myEvents.length, color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle },
          ].map(stat => (
            <Card key={stat.label} className={`${stat.bg} border-0`}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* This week highlight */}
        {thisWeek.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700 font-semibold uppercase tracking-wide">Coming Up This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {thisWeek.slice(0, 3).map(e => {
                const t = e.scheduled_start || e.start_time;
                return (
                  <div key={e.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{e.title}</p>
                      <p className="text-xs text-gray-500">{t ? formatDistanceToNow(new Date(t), { addSuffix: true }) : ''}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleStartNow(e)} className="gap-1 text-green-700 border-green-300">
                      <Play className="w-3 h-3" />Start
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Main tabs */}
        <Tabs defaultValue="scheduled">
          <TabsList className="mb-4">
            <TabsTrigger value="live" className="gap-1.5">
              <Radio className="w-4 h-4" />Live {liveEvents.length > 0 && `(${liveEvents.length})`}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-1.5">
              <Clock className="w-4 h-4" />Scheduled {scheduledEvents.length > 0 && `(${scheduledEvents.length})`}
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5">
              <CheckCircle className="w-4 h-4" />Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-3">
            {liveEvents.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-500">No live events right now.</CardContent></Card>
            ) : liveEvents.map(e => (
              <EventRow key={e.id} event={e} onEdit={setEditingEvent} onDelete={handleDelete} onStartNow={handleStartNow} />
            ))}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-3">
            {scheduledEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">No scheduled events yet</p>
                  <Button onClick={() => setShowScheduleModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    Schedule Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : scheduledEvents.map(e => (
              <EventRow key={e.id} event={e} onEdit={setEditingEvent} onDelete={handleDelete} onStartNow={handleStartNow} />
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {pastEvents.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-500">No past events yet.</CardContent></Card>
            ) : pastEvents.slice(0, 20).map(e => (
              <EventRow key={e.id} event={e} onEdit={setEditingEvent} onDelete={handleDelete} onStartNow={handleStartNow} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <ScheduleLiveEventModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        onEventScheduled={handleSaved}
      />

      <EditLiveEventModal
        open={!!editingEvent}
        onOpenChange={open => { if (!open) setEditingEvent(null); }}
        event={editingEvent}
        onSaved={handleSaved}
      />
    </div>
  );
}