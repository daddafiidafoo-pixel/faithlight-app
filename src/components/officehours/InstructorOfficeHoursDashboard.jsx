import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader, Plus, Edit2, Trash2, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function InstructorOfficeHoursDashboard({ instructor }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    day_of_week: 'monday',
    start_time: '10:00',
    end_time: '11:00',
    session_type: 'one_on_one',
    max_participants: 1,
    topics: '',
  });

  const { data: officeHours = [] } = useQuery({
    queryKey: ['office-hours', instructor.id],
    queryFn: () => base44.entities.OfficeHours.filter({ instructor_user_id: instructor.id }, '-created_date'),
  });

  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['office-hours-sessions', instructor.id],
    queryFn: async () => {
      const sessions = await base44.entities.OfficeHoursSession.filter(
        { instructor_user_id: instructor.id, status: ['scheduled', 'in_progress'] },
        'start_time'
      );
      return sessions.slice(0, 5);
    },
  });

  const createSlot = useMutation({
    mutationFn: (data) =>
      base44.entities.OfficeHours.create({
        instructor_user_id: instructor.id,
        instructor_name: instructor.full_name,
        title: data.title,
        description: data.description,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        session_type: data.session_type,
        max_participants: parseInt(data.max_participants),
        topics: data.topics ? data.topics.split(',').map(t => t.trim()) : [],
        is_active: true,
        recurring: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      toast.success('Office hours created');
      resetForm();
    },
  });

  const updateSlot = useMutation({
    mutationFn: (data) =>
      base44.entities.OfficeHours.update(editingSlot.id, {
        title: data.title,
        description: data.description,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        session_type: data.session_type,
        max_participants: parseInt(data.max_participants),
        topics: data.topics ? data.topics.split(',').map(t => t.trim()) : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      toast.success('Office hours updated');
      resetForm();
    },
  });

  const deleteSlot = useMutation({
    mutationFn: (id) => base44.entities.OfficeHours.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-hours'] });
      toast.success('Office hours deleted');
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingSlot(null);
    setFormData({
      title: '',
      description: '',
      day_of_week: 'monday',
      start_time: '10:00',
      end_time: '11:00',
      session_type: 'one_on_one',
      max_participants: 1,
      topics: '',
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.start_time || !formData.end_time) {
      toast.error('Fill in required fields');
      return;
    }
    if (editingSlot) {
      updateSlot.mutate(formData);
    } else {
      createSlot.mutate(formData);
    }
  };

  const openEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      title: slot.title,
      description: slot.description,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      session_type: slot.session_type,
      max_participants: slot.max_participants,
      topics: slot.topics?.join(', ') || '',
    });
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="grid w-full max-w-md gap-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Office Hours
          </Button>

          <div className="grid gap-4">
            {officeHours.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-600">
                  No office hours scheduled yet
                </CardContent>
              </Card>
            ) : (
              officeHours.map(slot => (
                <Card key={slot.id} className="hover:shadow-md transition">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{slot.title}</h3>
                        {slot.description && (
                          <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.day_of_week.charAt(0).toUpperCase() + slot.day_of_week.slice(1)} {slot.start_time}-{slot.end_time}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Users className="w-3 h-3" />
                            {slot.session_type === 'one_on_one' ? '1-on-1' : `Up to ${slot.max_participants}`}
                          </Badge>
                          {slot.topics?.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {slot.topics[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(slot)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSlot.mutate(slot.id)}
                          disabled={deleteSlot.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-600">No upcoming sessions</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="p-3 border rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {session.session_type === 'one_on_one' ? session.booked_by_name : 'Group Session'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(session.start_time).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={session.status === 'in_progress' ? 'default' : 'outline'}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSlot ? 'Edit' : 'Create'} Office Hours</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Bible Basics Q&A"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will be covered?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Day *</label>
                <Select value={formData.day_of_week} onValueChange={(val) => setFormData({ ...formData, day_of_week: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day} value={day}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Session Type *</label>
                <Select value={formData.session_type} onValueChange={(val) => setFormData({ ...formData, session_type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_on_one">1-on-1</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Start Time *</label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">End Time *</label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Max Participants</label>
                <Input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Topics (comma-separated)</label>
              <Input
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                placeholder="e.g., Bible Study, Theology, Leadership"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createSlot.isPending || updateSlot.isPending}
                className="flex-1 gap-2"
              >
                {(createSlot.isPending || updateSlot.isPending) && <Loader className="w-4 h-4 animate-spin" />}
                {editingSlot ? 'Update' : 'Create'} Office Hours
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}