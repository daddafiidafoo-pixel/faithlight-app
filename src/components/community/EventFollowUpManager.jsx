import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function EventFollowUpManager({ event, isHost }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [followUp, setFollowUp] = useState({
    type: 'thank_you',
    subject: '',
    message: '',
    survey_url: '',
    resources: [],
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ['event-followups', event.id],
    queryFn: () => base44.entities.EventFollowUp.filter({ event_id: event.id }, '-created_date', 50),
    enabled: !!event.id,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations-list', event.id],
    queryFn: () => base44.entities.EventRegistration.filter({ event_id: event.id, status: 'attended' }),
    enabled: !!event.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-resources'],
    queryFn: () => base44.entities.Course.filter({ published: true }, '-created_date', 20),
  });

  const createFollowUpMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.EventFollowUp.create({
        event_id: event.id,
        follow_up_type: followUp.type,
        subject: followUp.subject,
        message: followUp.message,
        survey_url: followUp.survey_url || null,
        resources: followUp.resources,
        scheduled_send_time: new Date().toISOString(),
        status: 'pending',
      });
    },
    onSuccess: () => {
      toast.success('Follow-up created!');
      queryClient.invalidateQueries(['event-followups']);
      setShowForm(false);
      setFollowUp({ type: 'thank_you', subject: '', message: '', survey_url: '', resources: [] });
    },
  });

  const sendFollowUpMutation = useMutation({
    mutationFn: async (followUpData) => {
      // Send to all attendees
      const attendeeUsers = await Promise.all(
        registrations.map(async (reg) => {
          const users = await base44.entities.User.filter({ id: reg.user_id }, '-created_date', 1);
          return users[0];
        })
      );

      // Send emails
      await Promise.all(
        attendeeUsers.filter(u => u).map(async (user) => {
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: followUpData.subject,
            body: `
<h2>${followUpData.subject}</h2>

<p>Hi ${user.display_name || user.full_name},</p>

<p>${followUpData.message.replace(/\n/g, '<br>')}</p>

${followUpData.survey_url ? `
<p><a href="${followUpData.survey_url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Take Survey</a></p>
` : ''}

${followUpData.resources && followUpData.resources.length > 0 ? `
<h3>Recommended Resources:</h3>
<ul>
${followUpData.resources.map(r => `<li><a href="${r.url}">${r.title}</a> - ${r.description || ''}</li>`).join('\n')}
</ul>
` : ''}

<p>Thank you for attending ${event.title}!</p>

<p>Best regards,<br>FaithLight Team</p>
            `
          });
        })
      );

      // Update status
      return base44.entities.EventFollowUp.update(followUpData.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success(`Follow-up sent to ${registrations.length} attendees!`);
      queryClient.invalidateQueries(['event-followups']);
    },
  });

  const suggestedResources = courses
    .filter(c => {
      const eventTopics = event.title.toLowerCase();
      const courseTitle = c.title.toLowerCase();
      return ['bible', 'prayer', 'theology', 'discipleship'].some(
        topic => eventTopics.includes(topic) && courseTitle.includes(topic)
      );
    })
    .slice(0, 3);

  if (!isHost) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Post-Event Follow-Up</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Follow-Up
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 border rounded-lg space-y-4 bg-blue-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select value={followUp.type} onValueChange={(v) => setFollowUp({ ...followUp, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thank_you">Thank You Message</SelectItem>
                  <SelectItem value="survey">Event Survey</SelectItem>
                  <SelectItem value="resources">Recommended Resources</SelectItem>
                  <SelectItem value="next_steps">Next Steps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <Input
                value={followUp.subject}
                onChange={(e) => setFollowUp({ ...followUp, subject: e.target.value })}
                placeholder={`e.g., "Thank you for attending ${event.title}"`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <Textarea
                value={followUp.message}
                onChange={(e) => setFollowUp({ ...followUp, message: e.target.value })}
                placeholder="Write your follow-up message..."
                className="h-32"
              />
            </div>

            {followUp.type === 'survey' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Survey URL</label>
                <Input
                  value={followUp.survey_url}
                  onChange={(e) => setFollowUp({ ...followUp, survey_url: e.target.value })}
                  placeholder="https://forms.google.com/..."
                />
              </div>
            )}

            {followUp.type === 'resources' && suggestedResources.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Resources (based on event topic)
                </label>
                <div className="space-y-2">
                  {suggestedResources.map((course) => (
                    <label key={course.id} className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const resource = {
                            title: course.title,
                            url: `/CourseDetail?id=${course.id}`,
                            description: course.description,
                          };
                          setFollowUp({
                            ...followUp,
                            resources: e.target.checked
                              ? [...followUp.resources, resource]
                              : followUp.resources.filter(r => r.title !== course.title)
                          });
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{course.title}</p>
                        <p className="text-xs text-gray-600">{course.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => createFollowUpMutation.mutate()}
                disabled={!followUp.subject || !followUp.message || createFollowUpMutation.isPending}
                size="sm"
              >
                {createFollowUpMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create & Send
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {followUps.length === 0 && !showForm ? (
          <p className="text-center text-gray-500 py-4">No follow-ups sent yet</p>
        ) : (
          <div className="space-y-3">
            {followUps.map((fu) => (
              <div key={fu.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{fu.subject}</h4>
                      <Badge variant={fu.status === 'sent' ? 'default' : 'secondary'}>
                        {fu.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{fu.message}</p>
                  </div>
                  {fu.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => sendFollowUpMutation.mutate(fu)}
                      disabled={sendFollowUpMutation.isPending}
                      className="gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      Send Now
                    </Button>
                  )}
                </div>
                {fu.status === 'sent' && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Sent to {registrations.length} attendees
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}