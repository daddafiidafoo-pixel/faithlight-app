import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Users, Clock, Video, MapPin, ChevronDown, ChevronUp, ExternalLink, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const FOCUS_OPTIONS = [
  'Genesis', 'Psalms', 'Proverbs', 'Isaiah', 'Matthew', 'Mark', 'Luke', 'John',
  'Acts', 'Romans', 'Ephesians', 'Philippians', 'Hebrews', 'James', 'Revelation',
  'Prayer & Fasting', 'Discipleship', 'Evangelism', 'Spiritual Gifts',
];

export default function GroupStudySession({ groupId, group, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', focus_topic: '', scheduled_date: '', duration_minutes: 60, meeting_type: 'virtual', meeting_link: '', study_questions: '', passage: '' });

  const { data: sessions = [] } = useQuery({
    queryKey: ['group-study-sessions', groupId],
    queryFn: () => base44.entities.GroupMeeting.filter({ group_id: groupId }, 'scheduled_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  const createSession = useMutation({
    mutationFn: () => base44.entities.GroupMeeting.create({
      group_id: groupId,
      title: form.title.trim(),
      description: form.description.trim(),
      focus_topic: form.focus_topic,
      scheduled_date: new Date(form.scheduled_date).toISOString(),
      duration_minutes: Number(form.duration_minutes),
      meeting_type: form.meeting_type,
      location: form.meeting_link.trim(),
      study_questions: form.study_questions.trim() ? form.study_questions.trim().split('\n').filter(Boolean) : [],
      passage: form.passage.trim(),
      organizer_id: user.id,
      organizer_name: user.full_name,
      attendees: [user.id],
      status: 'scheduled',
    }),
    onSuccess: () => {
      toast.success('Study session scheduled!');
      queryClient.invalidateQueries(['group-study-sessions', groupId]);
      setShowCreate(false);
      setForm({ title: '', description: '', focus_topic: '', scheduled_date: '', duration_minutes: 60, meeting_type: 'virtual', meeting_link: '', study_questions: '', passage: '' });
    },
    onError: () => toast.error('Failed to create session'),
  });

  const toggleRSVP = useMutation({
    mutationFn: (session) => {
      const attending = session.attendees?.includes(user.id);
      return base44.entities.GroupMeeting.update(session.id, {
        attendees: attending ? session.attendees.filter(id => id !== user.id) : [...(session.attendees || []), user.id],
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['group-study-sessions', groupId]),
  });

  const deleteSession = useMutation({
    mutationFn: (id) => base44.entities.GroupMeeting.delete(id),
    onSuccess: () => { toast.success('Session removed'); queryClient.invalidateQueries(['group-study-sessions', groupId]); },
  });

  const upcoming = sessions.filter(s => new Date(s.scheduled_date) >= new Date());
  const past = sessions.filter(s => new Date(s.scheduled_date) < new Date());

  const SessionCard = ({ session }) => {
    const attending = session.attendees?.includes(user?.id);
    const isPast = new Date(session.scheduled_date) < new Date();
    const expanded = expandedId === session.id;
    return (
      <Card className={`border ${isPast ? 'border-gray-100 opacity-70' : attending ? 'border-green-200' : 'border-indigo-200'} hover:shadow-md transition-shadow`}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900 text-sm">{session.title}</h4>
                {session.focus_topic && <Badge variant="secondary" className="text-xs">{session.focus_topic}</Badge>}
                {attending && !isPast && <Badge className="bg-green-100 text-green-700 text-xs border-green-200 border">Going ✓</Badge>}
              </div>
              {session.description && <p className="text-sm text-gray-600 mt-1">{session.description}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(session.scheduled_date), 'EEE, MMM d · h:mm a')}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.duration_minutes} min</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.attendees?.length || 0} attending</span>
                <span className="flex items-center gap-1">{session.meeting_type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{session.meeting_type}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {!isPast && (
                <Button size="sm" className={`h-8 text-xs ${attending ? 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`} onClick={() => toggleRSVP.mutate(session)}>
                  {attending ? 'Cancel RSVP' : 'Join Session'}
                </Button>
              )}
              {session.location && (
                <a href={session.location.startsWith('http') ? session.location : `https://${session.location}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><ExternalLink className="w-3 h-3" />Link</Button>
                </a>
              )}
              {isAdmin && !isPast && (
                <button onClick={() => { if (confirm('Delete session?')) deleteSession.mutate(session.id); }} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              )}
            </div>
          </div>

          {(session.study_questions?.length > 0 || session.passage) && (
            <>
              <button className="flex items-center gap-1 text-xs text-indigo-500 mt-3 hover:text-indigo-700" onClick={() => setExpandedId(expanded ? null : session.id)}>
                <BookOpen className="w-3 h-3" /> Study Guide {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {expanded && (
                <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100 space-y-2">
                  {session.passage && <p className="text-xs font-semibold text-indigo-700">📖 {session.passage}</p>}
                  {session.study_questions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-indigo-700 mb-1">Discussion Questions:</p>
                      <ol className="list-decimal list-inside space-y-1">{session.study_questions.map((q, i) => <li key={i} className="text-xs text-indigo-600">{q}</li>)}</ol>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        !showCreate ? (
          <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> Schedule Study Session
          </Button>
        ) : (
          <Card className="border-indigo-200">
            <div className="p-5 space-y-3">
              <Input placeholder="Session title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Textarea placeholder="Description (optional)..." className="h-16 resize-none text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.focus_topic} onValueChange={v => setForm(f => ({ ...f, focus_topic: v }))}>
                  <SelectTrigger><SelectValue placeholder="Focus topic (optional)" /></SelectTrigger>
                  <SelectContent>{FOCUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Scripture passage (e.g. Romans 8)" value={form.passage} onChange={e => setForm(f => ({ ...f, passage: e.target.value }))} />
              </div>
              <Textarea placeholder="Discussion questions (one per line)..." className="h-20 resize-none text-sm" value={form.study_questions} onChange={e => setForm(f => ({ ...f, study_questions: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input type="datetime-local" className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
                <Input type="number" min={15} max={240} placeholder="Duration (minutes)" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.meeting_type} onValueChange={v => setForm(f => ({ ...f, meeting_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">🎥 Virtual</SelectItem>
                    <SelectItem value="in_person">📍 In Person</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder={form.meeting_type === 'virtual' ? 'Meeting link (Zoom, etc.)' : 'Location address'} value={form.meeting_link} onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" className="bg-indigo-600" disabled={!form.title.trim() || !form.scheduled_date || createSession.isPending} onClick={() => createSession.mutate()}>
                  {createSession.isPending ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </div>
          </Card>
        )
      )}

      <div className="space-y-3">
        {upcoming.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-gray-400"><Calendar className="w-10 h-10 mx-auto mb-2 text-gray-200" />{isAdmin ? 'Schedule a session above!' : 'No upcoming sessions yet.'}</CardContent></Card>
        ) : upcoming.map(s => <SessionCard key={s.id} session={s} />)}
      </div>

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Past Sessions</p>
          {past.slice(0, 5).map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  );
}