import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { MapPin, Clock, Users, X, Check, HelpCircle, FileText } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function EventDetailsPanel({ event, user, onClose, onEventUpdated }) {
  const queryClient = useQueryClient();
  const [rsvpStatus, setRsvpStatus] = useState(null);

  const { data: rsvp } = useQuery({
    queryKey: ['event-rsvp', event?.id, user?.id],
    queryFn: async () => {
      if (!event?.id || !user?.id) return null;
      const rsvps = await base44.entities.GroupEventRSVP.filter({
        event_id: event.id,
        user_id: user.id
      });
      return rsvps[0] || null;
    },
    enabled: !!event?.id && !!user?.id,
  });

  const { data: rsvpStats } = useQuery({
    queryKey: ['event-rsvp-stats', event?.id],
    queryFn: async () => {
      if (!event?.id) return null;
      const rsvps = await base44.entities.GroupEventRSVP.filter({
        event_id: event.id
      });
      return {
        yes: rsvps.filter(r => r.status === 'yes').length,
        no: rsvps.filter(r => r.status === 'no').length,
        maybe: rsvps.filter(r => r.status === 'maybe').length,
      };
    },
    enabled: !!event?.id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status) => {
      if (rsvp) {
        await base44.entities.GroupEventRSVP.update(rsvp.id, { status });
      } else {
        await base44.entities.GroupEventRSVP.create({
          event_id: event.id,
          user_id: user.id,
          status,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-rsvp', event?.id, user?.id]);
      queryClient.invalidateQueries(['event-rsvp-stats', event?.id]);
    },
  });

  const eventDate = new Date(event.event_date);
  const eventEnd = event.end_date ? new Date(event.end_date) : null;
  const isPastEvent = isPast(eventDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between border-b">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-indigo-100 text-indigo-800">{event.event_type}</Badge>
              {event.status && <Badge variant="outline">{event.status}</Badge>}
              {isPastEvent && <Badge className="bg-gray-100 text-gray-800">Past Event</Badge>}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-600">Date & Time</p>
                <p className="text-base">
                  {format(eventDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  {format(eventDate, 'h:mm a')}
                  {eventEnd && ` - ${format(eventEnd, 'h:mm a')}`}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-600">Location</p>
                  <p className="text-base">{event.location}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.event_type === 'virtual' ? '(Virtual Event)' : 
                     event.event_type === 'hybrid' ? '(In-person & Virtual)' : '(In-person)'}
                  </p>
                </div>
              </div>
            )}

            {event.description && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-600">Description</p>
                  <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                </div>
              </div>
            )}

            {event.max_capacity && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-600">Capacity</p>
                  <p className="text-base">
                    {event.rsvp_count || 0} / {event.max_capacity} attending
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RSVP Stats */}
          {rsvpStats && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-sm text-gray-700 mb-3">Attendees</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-lg text-green-600">{rsvpStats.yes}</span>
                  </div>
                  <p className="text-xs text-gray-600">Going</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-lg text-yellow-600">{rsvpStats.maybe}</span>
                  </div>
                  <p className="text-xs text-gray-600">Maybe</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-lg text-red-600">{rsvpStats.no}</span>
                  </div>
                  <p className="text-xs text-gray-600">Not Going</p>
                </div>
              </div>
            </div>
          )}

          {/* RSVP Buttons */}
          {user && !isPastEvent && (
            <div className="space-y-3 border-t pt-6">
              <p className="font-semibold text-sm text-gray-700">Your Response</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={rsvp?.status === 'yes' ? 'default' : 'outline'}
                  onClick={() => rsvpMutation.mutate('yes')}
                  disabled={rsvpMutation.isPending}
                  className={rsvp?.status === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Going
                </Button>
                <Button
                  variant={rsvp?.status === 'maybe' ? 'default' : 'outline'}
                  onClick={() => rsvpMutation.mutate('maybe')}
                  disabled={rsvpMutation.isPending}
                  className={rsvp?.status === 'maybe' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Maybe
                </Button>
                <Button
                  variant={rsvp?.status === 'no' ? 'default' : 'outline'}
                  onClick={() => rsvpMutation.mutate('no')}
                  disabled={rsvpMutation.isPending}
                  className={rsvp?.status === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <X className="w-4 h-4 mr-2" />
                  Can't Go
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}