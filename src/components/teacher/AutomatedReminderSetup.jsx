import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Trash2, Power } from 'lucide-react';
import { createAutomatedReminder } from '../../functions/automationEngine';

export default function AutomatedReminderSetup({ courseId, teacherId }) {
  const queryClient = useQueryClient();
  const [reminderType, setReminderType] = useState('assignment_deadline');
  const [triggerValue, setTriggerValue] = useState('3');
  const [messageTemplate, setMessageTemplate] = useState('');

  const { data: reminders = [] } = useQuery({
    queryKey: ['course-reminders', courseId],
    queryFn: () =>
      base44.entities.AutomatedReminder.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAutomatedReminder({
        course_id: courseId,
        teacher_id: teacherId,
        reminder_type: reminderType,
        trigger_condition: 'days_before',
        trigger_value: parseInt(triggerValue),
        message_template: messageTemplate,
        target_students: 'all',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-reminders', courseId]);
      setReminderType('assignment_deadline');
      setTriggerValue('3');
      setMessageTemplate('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (reminderId) =>
      base44.entities.AutomatedReminder.update(reminderId, {
        is_active: !reminders.find((r) => r.id === reminderId)?.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-reminders', courseId]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reminderId) =>
      base44.entities.AutomatedReminder.delete(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-reminders', courseId]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageTemplate.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Reminder Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Set Up Automated Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reminder Type
              </label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment_deadline">Assignment Deadline</SelectItem>
                  <SelectItem value="announcement_notification">Announcement</SelectItem>
                  <SelectItem value="course_start">Course Start</SelectItem>
                  <SelectItem value="lesson_available">Lesson Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Send Reminder (days before event)
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                value={triggerValue}
                onChange={(e) => setTriggerValue(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Message
              </label>
              <Textarea
                placeholder="Type the reminder message. You can use {student_name}, {course_name}, {days_left}"
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">
                Placeholders: {'{student_name}'}, {'{course_name}'}, {'{days_left}'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={!messageTemplate.trim() || createMutation.isPending}
              className="w-full gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Create Reminder
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-6">No reminders set up yet</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-4 border rounded-lg bg-gray-50 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {reminder.reminder_type.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <Badge
                        variant={reminder.is_active ? 'default' : 'secondary'}
                      >
                        {reminder.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Trigger: {reminder.trigger_value} days before
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {reminder.message_template}
                    </p>
                    {reminder.last_sent && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last sent: {new Date(reminder.last_sent).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMutation.mutate(reminder.id)}
                    >
                      <Power className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}