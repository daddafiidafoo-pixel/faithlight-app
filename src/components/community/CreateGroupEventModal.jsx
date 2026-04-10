import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export default function CreateGroupEventModal({ user, userGroups, onClose, onEventCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [eventType, setEventType] = useState('in-person');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const eventDateTime = new Date(`${data.eventDate}T${data.eventTime}`);
      const endDateTime = data.endTime 
        ? new Date(`${data.eventDate}T${data.endTime}`)
        : null;

      await base44.entities.GroupEvent.create({
        group_id: data.groupId,
        title: data.title,
        description: data.description,
        event_date: eventDateTime.toISOString(),
        end_date: endDateTime?.toISOString() || null,
        location: data.location || null,
        event_type: data.eventType,
        organizer_id: data.userId,
        max_capacity: data.maxCapacity ? parseInt(data.maxCapacity) : null,
        status: 'scheduled',
      });
    },
    onSuccess: () => {
      onEventCreated();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !groupId || !eventDate || !eventTime) {
      alert('Please fill in required fields');
      return;
    }

    createEventMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      groupId,
      eventType,
      location: location.trim(),
      eventDate,
      eventTime,
      endTime,
      maxCapacity,
      userId: user.id,
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between border-b">
          <CardTitle>Create Group Event</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Group Selection */}
            <div>
              <Label htmlFor="group">Group *</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger id="group" className="mt-2">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bible Study, Prayer Meeting"
                className="mt-2"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event details and agenda..."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Event Type */}
            <div>
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="eventType" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid (In-Person & Virtual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            {eventType !== 'virtual' && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Event address or venue"
                  className="mt-2"
                />
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={getTodayDate()}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Max Capacity */}
            <div>
              <Label htmlFor="capacity">Max Capacity (Optional)</Label>
              <Input
                id="capacity"
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="Leave empty for unlimited"
                className="mt-2"
                min="1"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}