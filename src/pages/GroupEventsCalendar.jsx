import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Plus } from 'lucide-react';
import EventCalendar from '../components/community/EventCalendar';
import EventDetailsPanel from '../components/community/EventDetailsPanel';
import CreateGroupEventModal from '../components/community/CreateGroupEventModal';

export default function GroupEventsCalendar() {
  const [user, setUser] = useState(null);
  const [viewType, setViewType] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, []);

  // Get user's group memberships
  const { data: userGroupMemberships = [] } = useQuery({
    queryKey: ['user-group-memberships', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const memberships = await base44.entities.GroupMember.filter({ user_id: user.id });
      return memberships;
    },
    enabled: !!user?.id,
  });

  // Get groups the user is a member of
  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-groups', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const groupIds = userGroupMemberships.map(m => m.group_id);
      if (groupIds.length === 0) return [];
      
      const groups = await Promise.all(
        groupIds.map(id => base44.entities.Group.filter({ id }))
      );
      return groups.flat();
    },
    enabled: userGroupMemberships.length > 0,
  });

  // Get all events for user's groups
  const { data: events = [] } = useQuery({
    queryKey: ['group-events', userGroups.map(g => g.id)],
    queryFn: async () => {
      if (userGroups.length === 0) return [];
      
      const groupIds = userGroups.map(g => g.id);
      const allEvents = await Promise.all(
        groupIds.map(id => base44.entities.GroupEvent.filter({ 
          group_id: id, 
          status: 'scheduled' 
        }))
      );
      
      return allEvents.flat().sort((a, b) => 
        new Date(a.event_date) - new Date(b.event_date)
      );
    },
    enabled: userGroups.length > 0,
  });

  // Get events for selected date
  const selectedDateEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const handleEventCreated = () => {
    setShowCreateModal(false);
    queryClient.invalidateQueries(['group-events']);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Group Events</h1>
                <p className="text-gray-600 mt-1">View and manage upcoming events in your groups</p>
              </div>
            </div>
            {user && (
              <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-5 h-5" />
                Create Event
              </Button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewType === 'month' ? 'default' : 'outline'}
              onClick={() => setViewType('month')}
            >
              Month
            </Button>
            <Button
              variant={viewType === 'week' ? 'default' : 'outline'}
              onClick={() => setViewType('week')}
            >
              Week
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <EventCalendar
              events={events}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              viewType={viewType}
            />
          </div>

          {/* Events for Selected Date */}
          <div className="space-y-4">
            <Card className="bg-white p-6 border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No events scheduled</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(event.event_date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-600 truncate">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white p-6 border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.slice(0, 10).map(event => {
                  const eventDate = new Date(event.event_date);
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsPanel
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onEventUpdated={handleEventCreated}
        />
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateGroupEventModal
          user={user}
          userGroups={userGroups}
          onClose={() => setShowCreateModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}