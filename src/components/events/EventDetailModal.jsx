import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, Video, ExternalLink, CheckCircle, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function EventDetailModal({ event, user, hasRSVP, onClose }) {
  const queryClient = useQueryClient();
  const [guestsCount, setGuestsCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const rsvpMutation = useMutation({
    mutationFn: async (status) => {
      if (!user) {
        toast.error('Please log in to RSVP');
        return;
      }

      // Check if RSVP exists
      const existingRSVPs = await base44.entities.EventRSVP.filter(
        { event_id: event.id, user_id: user.id },
        '-created_date',
        1
      );

      if (existingRSVPs.length > 0) {
        // Update existing RSVP
        await base44.entities.EventRSVP.update(existingRSVPs[0].id, {
          status,
          guests_count: guestsCount,
          notes,
          notification_enabled: notificationEnabled,
        });
      } else {
        // Create new RSVP
        await base44.entities.EventRSVP.create({
          event_id: event.id,
          user_id: user.id,
          user_name: user.full_name || user.email,
          status,
          guests_count: guestsCount,
          notes,
          notification_enabled: notificationEnabled,
        });

        // Update event RSVP count
        await base44.entities.ChurchEvent.update(event.id, {
          rsvp_count: (event.rsvp_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['church-events']);
      queryClient.invalidateQueries(['my-rsvps']);
      toast.success('RSVP updated successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to RSVP');
    },
  });

  const cancelRSVPMutation = useMutation({
    mutationFn: async () => {
      const existingRSVPs = await base44.entities.EventRSVP.filter(
        { event_id: event.id, user_id: user.id },
        '-created_date',
        1
      );

      if (existingRSVPs.length > 0) {
        await base44.entities.EventRSVP.delete(existingRSVPs[0].id);
        await base44.entities.ChurchEvent.update(event.id, {
          rsvp_count: Math.max((event.rsvp_count || 1) - 1, 0)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['church-events']);
      queryClient.invalidateQueries(['my-rsvps']);
      toast.success('RSVP cancelled');
      onClose();
    },
  });

  const isFull = event.max_attendees && event.rsvp_count >= event.max_attendees;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.title}</DialogTitle>
        </DialogHeader>

        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        <div className="space-y-6">
          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">
                {format(parseISO(event.start_date), 'PPPP')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>
                {format(parseISO(event.start_date), 'p')}
                {event.end_date && ` - ${format(parseISO(event.end_date), 'p')}`}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>{event.location}</span>
              </div>
            )}

            {event.is_online && event.online_link && (
              <div className="flex items-center gap-2 text-gray-700">
                <Video className="w-5 h-5 text-indigo-600" />
                <a
                  href={event.online_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Join Online <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>
                {event.rsvp_count} {event.rsvp_count === 1 ? 'person' : 'people'} attending
                {event.max_attendees && ` (max ${event.max_attendees})`}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About This Event</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          {/* RSVP Section */}
          {user && !hasRSVP && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">RSVP to This Event</h3>
              
              {isFull ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">This event is full. No more spots available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guests">Number of Additional Guests (Optional)</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="0"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes or Questions (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any dietary restrictions, accessibility needs, or questions..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={notificationEnabled}
                      onChange={(e) => setNotificationEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="notifications" className="text-sm cursor-pointer">
                      Send me reminders about this event
                    </Label>
                  </div>

                  <Button
                    onClick={() => rsvpMutation.mutate('attending')}
                    disabled={rsvpMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {rsvpMutation.isPending ? 'Confirming...' : 'Confirm Attendance'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {hasRSVP && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">You're attending this event!</span>
              </div>
              <Button
                onClick={() => cancelRSVPMutation.mutate()}
                disabled={cancelRSVPMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {cancelRSVPMutation.isPending ? 'Cancelling...' : 'Cancel RSVP'}
              </Button>
            </div>
          )}

          {!user && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900">Please log in to RSVP to this event.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}