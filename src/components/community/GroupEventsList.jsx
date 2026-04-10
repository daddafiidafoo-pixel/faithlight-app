import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, MapPin, Users, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function GroupEventsList({ groupId, user }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ['group-events', groupId],
    queryFn: async () => {
      const result = await base44.entities.GroupEvent.filter(
        { group_id: groupId, status: { $in: ['scheduled', 'live'] } },
        'event_date',
        100
      );
      return result;
    },
  });

  const { data: userRSVPs = {} } = useQuery({
    queryKey: ['user-rsvps', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      const rsvps = await base44.entities.GroupEventRSVP.filter(
        { user_id: user.id },
        '-created_date',
        200
      );
      const map = {};
      rsvps.forEach(r => map[r.event_id] = r);
      return map;
    },
    enabled: !!user?.id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }) => {
      const existingRSVP = userRSVPs[eventId];
      if (existingRSVP) {
        return base44.entities.GroupEventRSVP.update(existingRSVP.id, { status });
      } else {
        return base44.entities.GroupEventRSVP.create({
          event_id: eventId,
          user_id: user.id,
          status,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rsvps', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['group-events', groupId] });
    },
  });

  const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) <= new Date());

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Upcoming Events
          </h3>
          <div className="grid gap-4">
            {upcomingEvents.map((event, idx) => {
              const userRSVP = userRSVPs[event.id];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    setSelectedEvent(event);
                    setShowDetails(true);
                  }}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-base font-semibold text-gray-900 truncate">{event.title}</h4>
                            {event.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                              <span>{format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}</span>
                            </div>

                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}

                            {event.description && (
                              <p className="text-gray-600 line-clamp-2">{event.description}</p>
                            )}

                            <div className="flex items-center gap-4 pt-1">
                              <div className="flex items-center gap-1 text-gray-700">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-medium">{event.rsvp_count} going</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {event.event_type === 'in-person' ? '📍 In-Person' : event.event_type === 'virtual' ? '💻 Virtual' : '🎯 Hybrid'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* RSVP Status */}
                        <div className="flex flex-col gap-2 ml-4">
                          {!userRSVP ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                rsvpMutation.mutate({ eventId: event.id, status: 'yes' });
                              }}
                              disabled={rsvpMutation.isPending}
                              className="text-xs"
                            >
                              RSVP
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              <Check className="w-3 h-3" />
                              {userRSVP.status === 'yes' ? 'Going' : userRSVP.status === 'maybe' ? 'Maybe' : 'Not Going'}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Events</h3>
          <div className="grid gap-4">
            {pastEvents.slice(0, 3).map((event) => (
              <Card key={event.id} className="opacity-75">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-600">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No events yet</p>
            <p className="text-sm text-gray-500">Group members will see events here</p>
          </CardContent>
        </Card>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{format(new Date(selectedEvent.event_date), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-gray-600">{format(new Date(selectedEvent.event_date), 'h:mm a')} - {format(new Date(selectedEvent.end_date), 'h:mm a')}</p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <p className="text-gray-600">{selectedEvent.location}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <p className="text-gray-600">{selectedEvent.rsvp_count} attending{selectedEvent.max_capacity ? ` / ${selectedEvent.max_capacity}` : ''}</p>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline">{selectedEvent.event_type === 'in-person' ? '📍 In-Person' : selectedEvent.event_type === 'virtual' ? '💻 Virtual' : '🎯 Hybrid'}</Badge>
                </div>
              </div>

              {/* RSVP Options */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-900 mb-3">Your Response</p>
                <div className="flex gap-2">
                  {['yes', 'maybe', 'no'].map((status) => {
                    const userRSVP = userRSVPs[selectedEvent.id];
                    const isSelected = userRSVP?.status === status;
                    return (
                      <Button
                        key={status}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          rsvpMutation.mutate({ eventId: selectedEvent.id, status });
                          setShowDetails(false);
                        }}
                        className="flex-1"
                      >
                        {status === 'yes' ? '✓ Going' : status === 'maybe' ? '? Maybe' : '✗ Not Going'}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}