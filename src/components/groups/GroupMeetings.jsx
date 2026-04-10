import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Video, MapPin, Plus, Loader2, Clock, Users, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format, isFuture, isPast } from 'date-fns';

const TYPE_CONFIG = {
  virtual: { label: 'Virtual', icon: Video, color: 'bg-blue-100 text-blue-700' },
  in_person: { label: 'In-Person', icon: MapPin, color: 'bg-green-100 text-green-700' },
  hybrid: { label: 'Hybrid', icon: Users, color: 'bg-purple-100 text-purple-700' },
};

function MeetingCard({ meeting, user, onRSVP }) {
  const cfg = TYPE_CONFIG[meeting.meeting_type] || TYPE_CONFIG.virtual;
  const Icon = cfg.icon;
  const upcoming = meeting.scheduled_at ? isFuture(new Date(meeting.scheduled_at)) : false;
  const rsvps = meeting.rsvp_user_ids || [];
  const hasRSVPd = rsvps.includes(user?.id);

  return (
    <Card className={`border ${upcoming ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100 opacity-80'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{meeting.title}</h3>
              <Badge className={`text-xs flex-shrink-0 ${cfg.color}`}>
                <Icon className="w-2.5 h-2.5 mr-0.5" />{cfg.label}
              </Badge>
            </div>
            {meeting.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{meeting.description}</p>}
            <div className="space-y-1">
              {meeting.scheduled_at && (
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  {format(new Date(meeting.scheduled_at), 'EEE, MMM d · h:mm a')}
                </p>
              )}
              {meeting.duration_minutes && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 flex-shrink-0" /> {meeting.duration_minutes} min
                </p>
              )}
              {meeting.location && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {meeting.location}
                </p>
              )}
              {meeting.meeting_link && (
                <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Join Link
                </a>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> {rsvps.length} attending
            </p>
          </div>
          {upcoming && user && (
            <Button
              size="sm"
              variant={hasRSVPd ? 'outline' : 'default'}
              onClick={() => onRSVP(meeting, hasRSVPd)}
              className={hasRSVPd ? 'border-green-300 text-green-600 text-xs' : 'bg-indigo-600 hover:bg-indigo-700 text-xs'}
            >
              {hasRSVPd ? '✓ Going' : 'RSVP'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function GroupMeetings({ groupId, user, isAdmin }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', meeting_type: 'virtual', scheduled_at: '', duration_minutes: 60, location: '', meeting_link: '' });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['group-meetings', groupId],
    queryFn: () => base44.entities.GroupMeeting.filter({ group_id: groupId }, '-scheduled_at', 20).catch(() => []),
    enabled: !!groupId,
  });

  const createMeeting = async () => {
    if (!form.title.trim() || !form.scheduled_at) { toast.error('Title and date are required'); return; }
    setSaving(true);
    await base44.entities.GroupMeeting.create({
      group_id: groupId,
      created_by: user.id,
      creator_name: user.full_name,
      rsvp_user_ids: [],
      ...form,
    });
    queryClient.invalidateQueries(['group-meetings', groupId]);
    toast.success('Meeting scheduled!');
    setShowCreate(false);
    setForm({ title: '', description: '', meeting_type: 'virtual', scheduled_at: '', duration_minutes: 60, location: '', meeting_link: '' });
    setSaving(false);
  };

  const handleRSVP = async (meeting, hasRSVPd) => {
    const ids = meeting.rsvp_user_ids || [];
    const updated = hasRSVPd ? ids.filter(id => id !== user.id) : [...ids, user.id];
    await base44.entities.GroupMeeting.update(meeting.id, { rsvp_user_ids: updated });
    queryClient.invalidateQueries(['group-meetings', groupId]);
  };

  const upcoming = meetings.filter(m => m.scheduled_at && isFuture(new Date(m.scheduled_at)));
  const past = meetings.filter(m => m.scheduled_at && isPast(new Date(m.scheduled_at)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /> Meetings</h3>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs">
            <Plus className="w-3.5 h-3.5" /> Schedule Meeting
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No meetings scheduled yet.</p>
          {isAdmin && <p className="text-xs mt-1">Schedule a virtual or in-person meeting for the group.</p>}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upcoming</p>
              <div className="space-y-2">{upcoming.map(m => <MeetingCard key={m.id} meeting={m} user={user} onRSVP={handleRSVP} />)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Past</p>
              <div className="space-y-2">{past.map(m => <MeetingCard key={m.id} meeting={m} user={user} onRSVP={handleRSVP} />)}</div>
            </div>
          )}
        </>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule a Meeting</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <Input placeholder="Meeting title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Select value={form.meeting_type} onValueChange={v => setForm(p => ({ ...p, meeting_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">🎥 Virtual</SelectItem>
                <SelectItem value="in_person">📍 In-Person</SelectItem>
                <SelectItem value="hybrid">🔀 Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Date & Time *</label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Duration (minutes)</label>
              <Input type="number" min={15} max={480} value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} className="w-28" />
            </div>
            {(form.meeting_type === 'in_person' || form.meeting_type === 'hybrid') && (
              <Input placeholder="Location / address" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            )}
            {(form.meeting_type === 'virtual' || form.meeting_type === 'hybrid') && (
              <Input placeholder="Meeting link (Zoom, Meet, etc.)" value={form.meeting_link} onChange={e => setForm(p => ({ ...p, meeting_link: e.target.value }))} />
            )}
            <div className="flex gap-2 pt-1">
              <Button onClick={createMeeting} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}