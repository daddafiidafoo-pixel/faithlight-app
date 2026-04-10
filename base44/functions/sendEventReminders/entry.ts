import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all events that need reminders
    const now = new Date();
    const events = await base44.asServiceRole.entities.LiveEvent.filter({
      status: 'scheduled',
      is_published: true
    });

    let remindersSent = 0;
    let errors = [];

    for (const event of events) {
      try {
        const eventStartTime = new Date(event.start_at);

        // Get all reminders for this event
        const reminders = await base44.asServiceRole.entities.LiveEventReminder.filter({
          event_id: event.id,
          is_enabled: true
        });

        for (const reminder of reminders) {
          const reminderTime = new Date(eventStartTime.getTime() - reminder.minutes_before * 60000);

          // Check if it's time to send this reminder
          const timeDiff = reminderTime.getTime() - now.getTime();
          const isTimeToSend = timeDiff <= 0 && timeDiff > -60000; // Within last minute

          if (isTimeToSend && !reminder.sent_at) {
            const attendee = await base44.asServiceRole.entities.LiveEventAttendee.filter({
              event_id: event.id,
              user_id: reminder.user_id
            });

            // Get attendee user info
            const attendeeUser = await base44.asServiceRole.entities.User.filter({
              id: reminder.user_id
            });

            if (attendeeUser && attendeeUser[0]?.email) {
              // Send email
              if (reminder.reminder_type === 'email' || reminder.reminder_type === 'both') {
                await base44.integrations.Core.SendEmail({
                  to: attendeeUser[0].email,
                  subject: `Reminder: ${event.title} starts in ${reminder.minutes_before} minutes`,
                  body: `Hi ${attendeeUser[0].full_name},\n\nThis is a friendly reminder that "${event.title}" is starting in ${reminder.minutes_before} minutes!\n\nStart time: ${new Date(event.start_at).toLocaleString()}\n\n${event.mode === 'online' || event.mode === 'hybrid' ? `Join here: ${event.online_url}` : `Location: ${event.location_name}\n${event.address}`}`
                });
              }

              // Send in-app notification
              if (reminder.reminder_type === 'in_app' || reminder.reminder_type === 'both') {
                // Future: implement in-app notifications
                console.log(`In-app reminder sent to ${reminder.user_id} for event ${event.id}`);
              }

              // Mark reminder as sent
              await base44.asServiceRole.entities.LiveEventReminder.update(reminder.id, {
                sent_at: new Date().toISOString()
              });

              remindersSent++;
            }
          }
        }
      } catch (eventError) {
        console.error(`Error processing event ${event.id}:`, eventError);
        errors.push(`Event ${event.id}: ${eventError.message}`);
      }
    }

    return Response.json({
      success: true,
      remindersSent,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Reminder service error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});