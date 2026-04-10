import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EventRegistrationButton({ event, user }) {
  const queryClient = useQueryClient();

  const { data: registration, isLoading } = useQuery({
    queryKey: ['event-registration', event.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const regs = await base44.entities.EventRegistration.filter({
        event_id: event.id,
        user_id: user.id,
      }, '-created_date', 1);
      return regs[0] || null;
    },
    enabled: !!user?.id && !!event.id,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      return base44.entities.EventRegistration.create({
        event_id: event.id,
        user_id: user.id,
        status: 'registered',
      });
    },
    onSuccess: async () => {
      // Generate calendar invite
      const generateCalendarInvite = () => {
        const startDate = new Date(event.start_time);
        const endDate = new Date(startDate.getTime() + (event.duration_minutes || 60) * 60000);
        
        const formatDate = (date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.video_url || window.location.origin + '/LiveEventDetail?id=' + event.id)}`;
        
        return calendarUrl;
      };

      const calendarLink = event.send_calendar_invite !== false ? generateCalendarInvite() : null;

      // Send confirmation email with calendar invite
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `You're registered for: ${event.title}`,
          body: `
<h2>Registration Confirmed! 🎉</h2>

<p>Hi ${user.display_name || user.full_name},</p>

<p>You're registered for <strong>${event.title}</strong></p>

<p><strong>Event Details:</strong></p>
<ul>
  <li>📅 Date: ${new Date(event.start_time).toLocaleDateString()}</li>
  <li>🕐 Time: ${new Date(event.start_time).toLocaleTimeString()}</li>
  <li>⏱️ Duration: ${event.duration_minutes || 60} minutes</li>
  <li>📝 Description: ${event.description || 'N/A'}</li>
</ul>

${calendarLink ? `<p><a href="${calendarLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">📅 Add to Google Calendar</a></p>` : ''}

${event.video_url ? `<p><strong>Join Link:</strong> <a href="${event.video_url}">${event.video_url}</a></p>` : ''}

<p>We'll send you a reminder before the event starts. See you there!</p>

<p>Best regards,<br>FaithLight Team</p>
          `
        });
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
      }
      
      toast.success('Registered! Calendar invite sent to your email.');
      queryClient.invalidateQueries(['event-registration']);
      queryClient.invalidateQueries(['user-registrations']);
    },
    onError: () => {
      toast.error('Failed to register for event');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!registration) throw new Error('No registration found');
      return base44.entities.EventRegistration.update(registration.id, {
        status: 'cancelled',
      });
    },
    onSuccess: () => {
      toast.success('Registration cancelled');
      queryClient.invalidateQueries(['event-registration']);
      queryClient.invalidateQueries(['user-registrations']);
    },
    onError: () => {
      toast.error('Failed to cancel registration');
    },
  });

  if (isLoading) {
    return <Button disabled variant="outline"><Loader2 className="w-4 h-4 animate-spin" /></Button>;
  }

  const isRegistered = registration && registration.status === 'registered';

  if (event.status === 'ended') {
    return null;
  }

  return (
    <Button
      onClick={() => isRegistered ? cancelMutation.mutate() : registerMutation.mutate()}
      disabled={registerMutation.isPending || cancelMutation.isPending}
      variant={isRegistered ? 'outline' : 'default'}
      className={isRegistered ? 'gap-2' : 'gap-2 bg-indigo-600 hover:bg-indigo-700'}
    >
      {registerMutation.isPending || cancelMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRegistered ? (
        <>
          <Check className="w-4 h-4" />
          Registered
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Register & Get Reminders
        </>
      )}
    </Button>
  );
}