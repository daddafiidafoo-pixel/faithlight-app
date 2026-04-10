import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Plus, Users, ExternalLink, CheckCircle, MapPin, Link as LinkIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';

export default function GroupVideoMeeting({ groupId, group, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    meeting_type: 'virtual',
    scheduled_date: '',
    duration_minutes: 60,
    location: '',
    focus_topic: '',
    passage: '',
    study_questions: [''],
  });

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['group-meetings', groupId],
    queryFn: () => base44.entities.GroupMeeting.filter({ group_id: groupId }, '-scheduled_date', 20).catch(() => []),
    enabled: !!groupId,
  });

  const createMeeting = useMutation({
    mutationFn: () => base44.entities.GroupMeeting.create({
      ...form,
      group_id: groupId,
      organizer_id: user.id,
      organizer_name: user.full_name,
      attendees: [],
      study_questions: form.study_questions.filter(q => q.trim()),
      scheduled_date: new Date(form.scheduled_date).toISOString(),
      status: 'scheduled',
    }),
    onSuccess: () => {
      toast.success('Meeting scheduled!');
      setShowForm(false);
      setForm({ title: '', description: '', meeting_type: 'virtual', scheduled_date: '', duration_minutes: 60, location: '', focus_topic: '', passage: '', study_questions: [''] });
      queryClient.invalidateQueries(['group-meetings', groupId]);
    },
    onError: () => toast.error('Failed to schedule meeting'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.GroupMeeting.update(id, { status }),
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries(['group-meetings', groupId]); },
  });

  const rsvp = useMutation({
    mutationFn: async (meeting) => {
      const already = meeting.attendees?.includes(user.id);
      const attendees = already
        ? meeting.attendees.filter(a => a !== user.id)
        : [...(meeting.attendees || []), user.id];
      return base44.entities.GroupMeeting.update(meeting.id, { attendees });
    },
    onSuccess: () => { toast.success('RSVP updated!'); queryClient.invalidateQueries(['group-meetings', groupId]); },
  });

  const now = new Date();
  const upcoming = meetings.filter(m => new Date(m.scheduled_date) >= now && m.status !== 'cancelled');
  const past = meetings.filter(m => new Date(m.scheduled_date) < now || m.status === 'completed');

  const StatusBadge = ({ status }) => {
    const map = { scheduled: 'bg-blue-100 text-blue-700', ongoing: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-600' };
    return <Badge className={`text-xs ${map[status] || ''}`}>{status}</Badge>;
  };

  const MeetingCard = ({ meeting }) => {
    const isAttending = meeting.attendees?.includes(user?.id);
    const isOrganizer = meeting.organizer_id === user?.id;
    const meetingDate = new Date(meeting.scheduled_date);
    const isPast = meetingDate < now;

    return (
      <Card className={`border ${isPast ? 'border-gray-200 opacity-75' : 'border-indigo-200'}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-semibold text-gray-900 text-sm">{meeting.title}</h4>
                <StatusBadge status={meeting.status} />
                <Badge variant="outline" className="text-xs">
                  {meeting.meeting_type === 'virtual' ? <Video className="w-3 h-3 mr-1 inline" /> : <MapPin className="w-3 h-3 mr-1 inline" />}
                  {meeting.meeting_type === 'virtual' ? 'Virtual' : 'In Person'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mt-1">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(meetingDate, 'MMM d, yyyy h:mm a')}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.duration_minutes} min</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{meeting.attendees?.length || 0} attending</span>
              </div>
              {meeting.focus_topic && <p className="text-xs text-indigo-600 mt-1 font-medium">📖 {meeting.focus_topic}</p>}
              {meeting.passage && <p className="text-xs text-gray-500 mt-0.5">Scripture: {meeting.passage}</p>}
              {meeting.study_questions?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Study Questions:</p>
                  <ul className="space-y-0.5">
                    {meeting.study_questions.slice(0, 2).map((q, i) => (
                      <li key={i} className="text-xs text-gray-600">• {q}</li>
                    ))}
                    {meeting.study_questions.length > 2 && <li className="text-xs text-gray-400">+{meeting.study_questions.length - 2} more...</li>}
                  </ul>
                </div>
              )}
              {meeting.location && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />{meeting.location}
                </p>
              )}
            </div>
            {user && (
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {!isPast && meeting.status === 'scheduled' && (
                  <Button size="sm" variant={isAttending ? 'outline' : 'default'}
                    className={`text-xs gap-1 h-7 ${isAttending ? 'border-green-300 text-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    onClick={() => rsvp.mutate(meeting)}>
                    {isAttending ? <><CheckCircle className="w-3 h-3" />Going</> : 'RSVP'}
                  </Button>
                )}
                {meeting.meeting_type === 'virtual' && !isPast && (
                  <Link to={createPageUrl('LiveEvents')}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7 text-green-700 border-green-300 w-full">
                      <ExternalLink className="w-3 h-3" />Join
                    </Button>
                  </Link>
                )}
                {isAdmin && !isPast && (
                  <Button size="sm" variant="ghost" className="text-xs text-gray-500 h-7"
                    onClick={() => updateStatus.mutate({ id: meeting.id, status: 'cancelled' })}>
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">Group Meetings</h3>
        </div>
        {(isAdmin || true) && (
          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Schedule Meeting
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-semibold text-gray-900">Schedule New Meeting</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Meeting title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <input type="datetime-local" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.scheduled_date} onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))} />
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.meeting_type} onChange={e => setForm(p => ({ ...p, meeting_type: e.target.value }))}>
                <option value="virtual">Virtual</option>
                <option value="in_person">In Person</option>
              </select>
              <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Duration (minutes)" type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} />
              <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Location or meeting link" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Focus topic" value={form.focus_topic} onChange={e => setForm(p => ({ ...p, focus_topic: e.target.value }))} />
              <input className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Scripture passage (e.g. John 3:1-21)" value={form.passage} onChange={e => setForm(p => ({ ...p, passage: e.target.value }))} />
              <textarea className="border rounded-lg px-3 py-2 text-sm col-span-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => createMeeting.mutate()} disabled={!form.title || !form.scheduled_date || createMeeting.isPending}>
                {createMeeting.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />} Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-green-600" />Upcoming</h4>
          <div className="space-y-3">{upcoming.map(m => <MeetingCard key={m.id} meeting={m} />)}</div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Past Meetings</h4>
          <div className="space-y-2">{past.slice(0, 3).map(m => <MeetingCard key={m.id} meeting={m} />)}</div>
        </div>
      )}

      {meetings.length === 0 && !isLoading && (
        <Card className="border-dashed border-gray-300">
          <CardContent className="py-12 text-center">
            <Video className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No meetings scheduled. Schedule the first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}