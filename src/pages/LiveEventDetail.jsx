import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Clock, MapPin, Link as LinkIcon, Users, Share2, Edit, ArrowLeft, Play, Square, Flag, Shield } from 'lucide-react';
import { format, parseISO, isPast, isBefore, addMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import AttendanceCheckIn from '../components/live/AttendanceCheckIn';
import EventReportForm from '../components/live/EventReportForm';
import EventModerationPanel from '../components/live/EventModerationPanel';
import ReminderSettings from '../components/live/ReminderSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LiveEventDetail() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const eventData = await base44.entities.LiveEvent.list(1, 1);
        const event = eventData?.find(e => e.id === eventId);
        
        if (!event) {
          setError('Event not found');
          return;
        }

        setEvent(event);

        const eventAttendees = await base44.entities.LiveEventAttendee.filter({
          event_id: eventId
        });
        setAttendees(eventAttendees || []);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleStartLive = async () => {
    if (!canStartLive()) return;

    try {
      setLoading(true);
      await base44.entities.LiveEvent.update(event.id, {
        status: 'live',
        started_at: new Date().toISOString()
      });
      setEvent(prev => ({
        ...prev,
        status: 'live',
        started_at: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error starting live:', err);
      setError('Failed to start live stream');
    } finally {
      setLoading(false);
    }
  };

  const handleEndLive = async () => {
    if (event.status !== 'live') return;

    try {
      setLoading(true);
      await base44.entities.LiveEvent.update(event.id, {
        status: 'ended',
        ended_at: new Date().toISOString()
      });
      setEvent(prev => ({
        ...prev,
        status: 'ended',
        ended_at: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error ending live:', err);
      setError('Failed to end live stream');
    } finally {
      setLoading(false);
    }
  };

  const isHost = user && event && user.id === event.created_by;
  const userAttendee = attendees.find(a => a.user_id === user?.id);

  const canStartLive = () => {
    if (!event || event.status !== 'scheduled') return false;
    const startTime = parseISO(event.start_at);
    const now = new Date();
    const thirtyMinBefore = new Date(startTime.getTime() - 30 * 60000);
    return now >= thirtyMinBefore && now < startTime;
  };

  const getAttendanceReport = () => {
    const attended = attendees.filter(a => a.attended).length;
    const checkedIn = attendees.filter(a => a.checked_in_at).length;
    const joined = attendees.filter(a => a.actual_join_time).length;
    return { attended, checkedIn, joined };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading event...</div>;
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg text-gray-700">{error || 'Event not found'}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const startTime = parseISO(event.start_at);
  const endTime = event.end_at ? parseISO(event.end_at) : addMinutes(startTime, event.duration_minutes);
  const formattedStart = formatInTimeZone(startTime, event.timezone, 'EEE MMM d, yyyy h:mm a zzz');
  const formattedEnd = formatInTimeZone(endTime, event.timezone, 'h:mm a zzz');

  const statusBadgeColor = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    live: 'bg-red-100 text-red-800',
    ended: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusEmoji = {
    draft: '📝',
    scheduled: '⏰',
    live: '🔴',
    ended: '✓',
    cancelled: '❌'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--faith-light-bg)] to-[var(--faith-light-bg-secondary)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* BACK BUTTON */}
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* HEADER */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[var(--faith-light-primary-dark)]">{event.title}</h1>
              <Badge className={statusBadgeColor[event.status]}>
                {statusEmoji[event.status]} {event.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            {event.description && (
              <p className="text-gray-600">{event.description}</p>
            )}
          </div>
          
          {isHost && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = createPageUrl(`CreateLiveEvent?edit=${event.id}`)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          )}
        </div>

        {/* LIVE CONTROLS */}
        {isHost && event.status === 'scheduled' && canStartLive() && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-800 mb-3">Event is ready to go live!</p>
              <Button
                onClick={handleStartLive}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                <Play className="w-4 h-4" />
                {loading ? 'Starting...' : 'Start Live Now'}
              </Button>
            </CardContent>
          </Card>
        )}

        {isHost && event.status === 'live' && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                Event is currently LIVE
              </p>
              <Button
                onClick={handleEndLive}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white gap-2"
              >
                <Square className="w-4 h-4" />
                {loading ? 'Ending...' : 'End Live Stream'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* EVENT TYPE & MODE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold">{event.event_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mode</p>
                  <p className="font-semibold capitalize">{event.mode.replace('_', ' ')}</p>
                </div>
              </CardContent>
            </Card>

            {/* SCHEDULE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Start Time</p>
                  <p className="font-semibold">{formattedStart}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Time</p>
                  <p className="font-semibold">{formattedEnd}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">{event.duration_minutes} minutes</p>
                </div>
              </CardContent>
            </Card>

            {/* ONLINE LINK */}
            {(event.mode === 'online' || event.mode === 'hybrid') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Join Online
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="font-semibold capitalize">{event.online_provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Stream Link</p>
                    <Button
                      onClick={() => window.open(event.online_url, '_blank')}
                      className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
                    >
                      Join Stream
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* LOCATION */}
            {(event.mode === 'in_person' || event.mode === 'hybrid') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">{event.location_name}</p>
                    <p className="font-semibold">{event.address}</p>
                    {event.city && <p className="text-gray-600">{event.city}, {event.country}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* HOST INFO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Host</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{event.created_by}</p>
              </CardContent>
            </Card>

            {/* VISIBILITY */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold capitalize">
                  {event.visibility === 'group_only' ? '👥 Group Only' : event.visibility === 'private' ? '🔒 Private' : '🌍 Public'}
                </p>
              </CardContent>
            </Card>

            {/* SETTINGS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Chat enabled</span>
                  <span>{event.allow_chat ? '✓' : '✗'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reactions enabled</span>
                  <span>{event.allow_reactions ? '✓' : '✗'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recording enabled</span>
                  <span>{event.recording_enabled ? '✓' : '✗'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reminders enabled</span>
                  <span>{event.reminders_enabled ? '✓' : '✗'}</span>
                </div>
              </CardContent>
            </Card>

            {/* ATTENDEES */}
            {!isHost && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Attendees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{attendees.length}</p>
                  <p className="text-sm text-gray-500 mt-1">people RSVP'd</p>
                </CardContent>
              </Card>
            )}

            {/* CHECK-IN (In-person only) */}
            {!isHost && userAttendee && event.mode === 'in_person' && event.status !== 'ended' && (
              <div>
                <AttendanceCheckIn
                  eventId={eventId}
                  attendeeRecord={userAttendee}
                  onCheckedIn={() => setAttendees(prev => prev.map(a => a.id === userAttendee.id ? { ...a, checked_in_at: new Date().toISOString() } : a))}
                />
              </div>
            )}

            {/* REMINDER SETTINGS */}
            {!isHost && (
              <ReminderSettings eventId={eventId} onReminderSet={() => {}} />
            )}

            {/* REPORT USER */}
            {!isHost && (
              <div>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Flag className="w-4 h-4" />
                  Report This Event
                </Button>
              </div>
            )}

          </div>

          {/* HOST MODERATION TAB */}
          {isHost && (
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Moderation & Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="attendance" className="w-full">
                    <TabsList>
                      <TabsTrigger value="attendance">Attendance</TabsTrigger>
                      <TabsTrigger value="moderation">Moderation</TabsTrigger>
                    </TabsList>

                    {/* ATTENDANCE TAB */}
                    <TabsContent value="attendance" className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-2xl font-bold">{attendees.length}</p>
                            <p className="text-xs text-gray-600 mt-1">Total RSVP'd</p>
                          </CardContent>
                        </Card>
                        {event.mode === 'in_person' && (
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-2xl font-bold">{getAttendanceReport().checkedIn}</p>
                              <p className="text-xs text-gray-600 mt-1">Checked In</p>
                            </CardContent>
                          </Card>
                        )}
                        {event.mode !== 'in_person' && (
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-2xl font-bold">{getAttendanceReport().joined}</p>
                              <p className="text-xs text-gray-600 mt-1">Joined</p>
                            </CardContent>
                          </Card>
                        )}
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-2xl font-bold">{getAttendanceReport().attended}</p>
                            <p className="text-xs text-gray-600 mt-1">Attended</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-3">Attendee Details</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {attendees.map(attendee => (
                            <div key={attendee.id} className="p-2 bg-gray-50 rounded text-sm flex items-center justify-between">
                              <div>
                                <p className="font-medium">{attendee.user_id}</p>
                                <p className="text-xs text-gray-600">
                                  {attendee.checked_in_at && '✓ Checked in'}
                                  {attendee.actual_join_time && '✓ Joined'}
                                  {!attendee.checked_in_at && !attendee.actual_join_time && '○ Not attended'}
                                </p>
                              </div>
                              <Badge variant={attendee.attended ? 'default' : 'secondary'}>
                                {attendee.attended ? 'Attended' : 'No-show'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* MODERATION TAB */}
                    <TabsContent value="moderation">
                      <EventModerationPanel eventId={eventId} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}