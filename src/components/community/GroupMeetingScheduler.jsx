import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function GroupMeetingScheduler({ groupId, user, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_type: 'virtual',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    location: '',
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data) => {
      const scheduledDateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}`);
      return base44.entities.GroupMeeting.create({
        group_id: groupId,
        title: data.title,
        description: data.description,
        meeting_type: data.meeting_type,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: data.duration_minutes,
        location: data.location,
        organizer_id: user.id,
        organizer_name: user.full_name,
        attendees: [],
        status: 'scheduled',
      });
    },
    onSuccess: async (meeting) => {
      toast.success('Meeting scheduled successfully!');
      
      // Notify group members
      const members = await base44.entities.GroupMember.filter({ group_id: groupId });
      const notifications = members
        .filter(m => m.user_id !== user.id)
        .map(m => ({
          user_id: m.user_id,
          group_id: groupId,
          notification_type: 'meeting_scheduled',
          title: `New meeting: ${formData.title}`,
          message: `${user.full_name} scheduled a meeting in the group`,
          related_entity_id: meeting.id,
          related_entity_type: 'meeting',
          triggered_by_user_id: user.id,
          triggered_by_name: user.full_name,
        }));
      
      if (notifications.length > 0) {
        await base44.entities.GroupNotification.bulkCreate(notifications);
      }
      
      queryClient.invalidateQueries(['group-meetings', groupId]);
      setFormData({
        title: '',
        description: '',
        meeting_type: 'virtual',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60,
        location: '',
      });
      onClose();
    },
    onError: () => toast.error('Failed to schedule meeting'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMeetingMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Bible Study"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What will you discuss?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-20"
            />
          </div>

          <div>
            <Label htmlFor="meeting_type">Meeting Type *</Label>
            <Select value={formData.meeting_type} onValueChange={(value) => setFormData({ ...formData, meeting_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="location">
              {formData.meeting_type === 'virtual' ? 'Meeting Link' : 'Location'}
            </Label>
            <Input
              id="location"
              placeholder={formData.meeting_type === 'virtual' ? 'e.g., https://zoom.us/...' : 'e.g., 123 Main St, City'}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMeetingMutation.isPending} className="bg-indigo-600">
              {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}