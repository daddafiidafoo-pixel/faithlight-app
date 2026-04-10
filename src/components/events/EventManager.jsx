import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { checkPermission } from '@/components/permissions';

export default function EventManager({ groupId, userId, userRole, userName, userEmail }) {
  const queryClient = useQueryClient();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'prayer_meeting',
    start_date: '',
    end_date: '',
    location: '',
    is_virtual: false,
    meeting_link: '',
    is_recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_end_date: '',
    max_attendees: '',
    rsvp_required: true,
    send_reminder: true,
    reminder_hours_before: 24,
    visibility: groupId ? 'group_only' : 'public',
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', groupId],
    queryFn: async () => {
      if (groupId) {
        return await base44.entities.Event.filter({ group_id: groupId });
      }
      return await base44.entities.Event.list();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async () => {
      const permission = checkPermission('SESSION_CREATE', {
        role: userRole,
        email_verified: true,
        verification_status: 'VERIFIED',
      }, { group_role: 'OWNER' });

      if (!permission.allowed) {
        throw new Error(permission.reason);
      }

      const eventData = {
        creator_user_id: userId,
        creator_name: userName,
        group_id: groupId,
        ...newEvent,
        max_attendees: newEvent.max_attendees ? Number(newEvent.max_attendees) : undefined,
      };

      if (editingEvent) {
        return await base44.entities.Event.update(editingEvent.id, eventData);
      }
      return await base44.entities.Event.create(eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events', groupId]);
      toast.success(editingEvent ? 'Event updated!' : 'Event created!');
      setEventDialogOpen(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'prayer_meeting',
        start_date: '',
        end_date: '',
        location: '',
        is_virtual: false,
        meeting_link: '',
        is_recurring: false,
        recurrence_pattern: 'weekly',
        recurrence_end_date: '',
        max_attendees: '',
        rsvp_required: true,
        send_reminder: true,
        reminder_hours_before: 24,
        visibility: groupId ? 'group_only' : 'public',
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      return await base44.entities.Event.delete(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events', groupId]);
      toast.success('Event deleted');
    },
  });

  const openEditDialog = (event) => {
    setEditingEvent(event);
    setNewEvent(event);
    setEventDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setEventDialogOpen(true);
  };

  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date());
  const pastEvents = events.filter(e => new Date(e.start_date) <= new Date());

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
          </TabsList>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>

        {/* Upcoming Events */}
        <TabsContent value="upcoming">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No upcoming events
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => openEditDialog(event)}
                  onDelete={() => deleteEventMutation.mutate(event.id)}
                  canEdit={event.creator_user_id === userId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Events */}
        <TabsContent value="past">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No past events
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => openEditDialog(event)}
                  onDelete={() => deleteEventMutation.mutate(event.id)}
                  canEdit={event.creator_user_id === userId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <Label>Title</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event details"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Event Type</Label>
                <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prayer_meeting">Prayer Meeting</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="worship">Worship</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Visibility</Label>
                <Select value={newEvent.visibility} onValueChange={(value) => setNewEvent({ ...newEvent, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    {groupId && <SelectItem value="group_only">Group Only</SelectItem>}
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_date}
                  onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Switch
                  checked={newEvent.is_virtual}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_virtual: checked })}
                />
                <Label>Virtual Event</Label>
              </div>
              {newEvent.is_virtual ? (
                <Input
                  value={newEvent.meeting_link}
                  onChange={(e) => setNewEvent({ ...newEvent, meeting_link: e.target.value })}
                  placeholder="Meeting link (Zoom, Google Meet, etc.)"
                />
              ) : (
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Physical location"
                />
              )}
            </div>

            {/* Recurring */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Switch
                  checked={newEvent.is_recurring}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, is_recurring: checked })}
                />
                <Label>Recurring Event</Label>
              </div>
              {newEvent.is_recurring && (
                <div className="grid md:grid-cols-2 gap-2">
                  <Select value={newEvent.recurrence_pattern} onValueChange={(value) => setNewEvent({ ...newEvent, recurrence_pattern: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={newEvent.recurrence_end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, recurrence_end_date: e.target.value })}
                    placeholder="End date"
                  />
                </div>
              )}
            </div>

            {/* RSVP & Notifications */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label>RSVP Required</Label>
                <Switch
                  checked={newEvent.rsvp_required}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, rsvp_required: checked })}
                />
              </div>
              {newEvent.rsvp_required && (
                <Input
                  type="number"
                  value={newEvent.max_attendees}
                  onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}
                  placeholder="Max attendees (optional)"
                  min="0"
                />
              )}
              <div className="flex items-center justify-between">
                <Label>Send Reminders</Label>
                <Switch
                  checked={newEvent.send_reminder}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, send_reminder: checked })}
                />
              </div>
              {newEvent.send_reminder && (
                <Input
                  type="number"
                  value={newEvent.reminder_hours_before}
                  onChange={(e) => setNewEvent({ ...newEvent, reminder_hours_before: Number(e.target.value) })}
                  placeholder="Hours before event"
                  min="1"
                />
              )}
            </div>

            <Button
              onClick={() => createEventMutation.mutate()}
              disabled={createEventMutation.isPending || !newEvent.title || !newEvent.start_date}
              className="w-full"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventCard({ event, onEdit, onDelete, canEdit }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{event.description?.substring(0, 100)}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">{event.event_type}</Badge>
              <Badge>{new Date(event.start_date).toLocaleDateString()} {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>
              {event.is_virtual && <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>}
              {event.is_recurring && <Badge className="bg-purple-100 text-purple-800">Recurring</Badge>}
            </div>

            {event.location && !event.is_virtual && (
              <p className="text-sm text-gray-500 mt-2">📍 {event.location}</p>
            )}
            {event.meeting_link && event.is_virtual && (
              <a
                href={event.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline mt-2 block"
              >
                Join Meeting →
              </a>
            )}
          </div>

          {canEdit && (
            <div className="flex flex-col gap-2">
              <Button onClick={onEdit} size="sm" variant="outline">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button onClick={onDelete} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}