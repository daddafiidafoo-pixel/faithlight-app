import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';
import EventManager from '@/components/events/EventManager';
import EventRSVPManager from '@/components/events/EventRSVPManager';

export default function EventCalendarPage() {
  const [user, setUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['all-events'],
    queryFn: async () => {
      const allEvents = await base44.entities.Event.list();
      return allEvents.filter(e => e.visibility !== 'private' || e.creator_user_id === user?.id);
    },
    enabled: !!user,
  });

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 min-h-24 border rounded-lg ${
            isToday ? 'bg-indigo-50 border-indigo-300' : 'bg-white'
          }`}
        >
          <p className={`font-semibold text-sm mb-1 ${isToday ? 'text-indigo-600' : ''}`}>
            {day}
          </p>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate w-full text-left hover:bg-blue-200"
              >
                {event.title}
              </button>
            ))}
            {dayEvents.length > 2 && (
              <p className="text-xs text-gray-500">+{dayEvents.length - 2} more</p>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (!user) return <div className="p-12 text-center">Loading...</div>;

  const isVerifiedLeader = ['AMBASSADOR', 'TRAINER', 'PASTOR', 'ADMIN'].includes(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-indigo-600" />
            Event Calendar
          </h1>
          <p className="text-gray-600 mt-2">View and RSVP to upcoming events</p>
        </div>

        {/* Event Manager (For Verified Leaders) */}
        {isVerifiedLeader && (
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle>Create Events</CardTitle>
            </CardHeader>
            <CardContent>
              <EventManager
                userId={user.id}
                userRole={user.role}
                userName={user.full_name}
                userEmail={user.email}
              />
            </CardContent>
          </Card>
        )}

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  variant="outline"
                  size="sm"
                >
                  ← Previous
                </Button>
                <Button
                  onClick={() => setCurrentMonth(new Date())}
                  variant="outline"
                  size="sm"
                >
                  Today
                </Button>
                <Button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  variant="outline"
                  size="sm"
                >
                  Next →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.filter(e => new Date(e.start_date) > new Date()).length === 0 ? (
              <p className="text-gray-500 text-center py-6">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {events
                  .filter(e => new Date(e.start_date) > new Date())
                  .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                  .slice(0, 10)
                  .map(event => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left p-4 border rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{event.description?.substring(0, 100)}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.start_date).toLocaleString()}
                            </Badge>
                            {event.is_virtual ? (
                              <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="mt-1">{selectedEvent.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Date & Time
                    </p>
                    <p className="mt-1">{new Date(selectedEvent.start_date).toLocaleString()}</p>
                    {selectedEvent.end_date && (
                      <p className="text-sm text-gray-600">
                        to {new Date(selectedEvent.end_date).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {selectedEvent.location && (
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Location
                      </p>
                      <p className="mt-1">{selectedEvent.location}</p>
                    </div>
                  )}
                </div>

                {selectedEvent.meeting_link && (
                  <div>
                    <a
                      href={selectedEvent.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-2"
                    >
                      Join Virtual Meeting
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {selectedEvent.is_recurring && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Recurring {selectedEvent.recurrence_pattern}
                  </Badge>
                )}
              </div>

              {/* RSVP Section */}
              {selectedEvent.rsvp_required && (
                <EventRSVPManager
                  eventId={selectedEvent.id}
                  event={selectedEvent}
                  userId={user.id}
                  userName={user.full_name}
                  userEmail={user.email}
                  isCreator={selectedEvent.creator_user_id === user.id}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}