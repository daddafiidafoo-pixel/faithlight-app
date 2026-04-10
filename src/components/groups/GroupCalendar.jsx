import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, MapPin, Users, Trash2, X } from 'lucide-react';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { toast } from 'sonner';

export default function GroupCalendar({ groupId, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', event_type: 'meeting', start_time: '', end_time: '', location: '' });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['group-events', groupId],
    queryFn: () => base44.entities.GroupEvent.filter({ group_id: groupId }, '-updated_date', 50).catch(() => []),
    enabled: !!groupId,
    retry: false,
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ['group-event-rsvps', groupId, user?.id],
    queryFn: () => base44.entities.GroupEventRSVP.filter({ user_id: user.id }, '-updated_date', 100).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const createEvent = useMutation({
    mutationFn: (data) => base44.entities.GroupEvent.create({ ...data, group_id: groupId, creator_id: user.id, creator_name: user.full_name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['group-events', groupId]);
      setShowForm(false);
      setForm({ title: '', description: '', event_type: 'meeting', start_time: '', end_time: '', location: '' });
      toast.success('Event created!');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id) => base44.entities.GroupEvent.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['group-events', groupId]); toast.success('Event deleted'); },
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }) => {
      const existing = rsvps.find(r => r.event_id === eventId);
      if (existing) return base44.entities.GroupEventRSVP.update(existing.id, { status });
      return base44.entities.GroupEventRSVP.create({ event_id: eventId, user_id: user.id, user_name: user.full_name, group_id: groupId, status });
    },
    onSuccess: () => queryClient.invalidateQueries(['group-event-rsvps', groupId, user?.id]),
  });

  const upcoming = events.filter(e => e.start_time && isFuture(parseISO(e.start_time))).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const past = events.filter(e => !e.start_time || isPast(parseISO(e.start_time))).sort((a, b) => new Date(b.start_time) - new Date(a.start_time)).slice(0, 5);

  const EVENT_TYPES = { meeting: { label: 'Meeting', color: 'bg-blue-100 text-blue-700' }, prayer: { label: 'Prayer', color: 'bg-purple-100 text-purple-700' }, study: { label: 'Study', color: 'bg-green-100 text-green-700' }, social: { label: 'Social', color: 'bg-amber-100 text-amber-700' } };

  const getUserRSVP = (eventId) => rsvps.find(r => r.event_id === eventId)?.status;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-gray-900">Group Calendar</h3>
        </div>
        {(isAdmin || user) && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-3.5 h-3.5" /> Add Event
          </Button>
        )}
      </div>

      {/* Create Event Form */}
      {showForm && (
        <Card className="border-indigo-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-gray-900">New Event</h4>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <Input placeholder="Event title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(EVENT_TYPES).map(([key, val]) => (
                <button key={key} onClick={() => setForm(p => ({ ...p, event_type: key }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.event_type === key ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                  {val.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start</label>
                <Input type="datetime-local" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End</label>
                <Input type="datetime-local" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
              </div>
            </div>
            <Input placeholder="Location or meeting link (optional)" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-20" />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-indigo-600" onClick={() => { if (!form.title || !form.start_time) { toast.error('Title and start time required'); return; } createEvent.mutate(form); }} disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Upcoming</p>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No upcoming events</p>
            <p className="text-xs text-gray-400">Schedule a prayer meeting, study session, or group gathering</p>
          </div>
        ) : upcoming.map(event => {
          const typeConfig = EVENT_TYPES[event.event_type] || EVENT_TYPES.meeting;
          const myRSVP = getUserRSVP(event.id);
          return (
            <Card key={event.id} className="border-gray-200 hover:border-indigo-200 transition-colors mb-3">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={`${typeConfig.color} border-0 text-xs`}>{typeConfig.label}</Badge>
                      <h4 className="font-semibold text-sm text-gray-900">{event.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {event.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(event.start_time), 'MMM d, yyyy · h:mm a')}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>}
                    {/* RSVP */}
                    {user && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs text-gray-400">RSVP:</span>
                        {['going', 'maybe', 'not_going'].map(status => (
                          <button key={status}
                            onClick={() => rsvpMutation.mutate({ eventId: event.id, status })}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${myRSVP === status ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:border-indigo-300'}`}>
                            {status === 'going' ? '✓ Going' : status === 'maybe' ? '? Maybe' : '✗ No'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {(isAdmin || event.creator_id === user?.id) && (
                    <button onClick={() => { if (confirm('Delete this event?')) deleteEvent.mutate(event.id); }} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Past Events */}
      {past.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Past Events</p>
          <div className="space-y-2">
            {past.map(event => (
              <div key={event.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-500 flex-1 truncate">{event.title}</span>
                {event.start_time && <span className="text-xs text-gray-400">{format(parseISO(event.start_time), 'MMM d')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}