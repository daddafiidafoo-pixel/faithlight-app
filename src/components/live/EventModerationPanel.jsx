import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Flag, Volume2, VolumeX, Trash2 } from 'lucide-react';

export default function EventModerationPanel({ eventId }) {
  const [reports, setReports] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventReports = await base44.entities.LiveEventReport.filter({
          event_id: eventId,
          status: 'pending'
        });
        setReports(eventReports || []);

        const eventAttendees = await base44.entities.LiveEventAttendee.filter({
          event_id: eventId
        });
        setAttendees(eventAttendees || []);
      } catch (err) {
        console.error('Error fetching moderation data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleMuteUser = async (attendeeId) => {
    try {
      await base44.entities.LiveEventAttendee.update(attendeeId, {
        is_muted: true
      });
      setAttendees(prev => prev.map(a => a.id === attendeeId ? { ...a, is_muted: true } : a));
    } catch (err) {
      console.error('Mute error:', err);
      setError('Failed to mute user');
    }
  };

  const handleUnmuteUser = async (attendeeId) => {
    try {
      await base44.entities.LiveEventAttendee.update(attendeeId, {
        is_muted: false
      });
      setAttendees(prev => prev.map(a => a.id === attendeeId ? { ...a, is_muted: false } : a));
    } catch (err) {
      console.error('Unmute error:', err);
      setError('Failed to unmute user');
    }
  };

  const handleBanUser = async (attendeeId) => {
    try {
      await base44.entities.LiveEventAttendee.update(attendeeId, {
        is_banned: true
      });
      setAttendees(prev => prev.map(a => a.id === attendeeId ? { ...a, is_banned: true } : a));
    } catch (err) {
      console.error('Ban error:', err);
      setError('Failed to ban user');
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await base44.entities.LiveEventReport.update(reportId, {
        status: 'resolved',
        action_taken: action
      });
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Resolve error:', err);
      setError('Failed to resolve report');
    }
  };

  if (loading) return <div className="text-sm text-gray-600">Loading moderation panel...</div>;

  const pendingReports = reports.filter(r => r.status === 'pending');
  const mutedUsers = attendees.filter(a => a.is_muted);
  const bannedUsers = attendees.filter(a => a.is_banned);

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* PENDING REPORTS */}
      {pendingReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Pending Reports ({pendingReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReports.map(report => (
              <div key={report.id} className="p-3 bg-amber-50 border border-amber-200 rounded">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{report.reported_user_name}</p>
                    <p className="text-xs text-gray-600 mt-1">{report.reason}</p>
                    {report.description && (
                      <p className="text-xs text-gray-700 mt-1 italic">"{report.description}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Reported by: {report.reporter_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveReport(report.id, 'none')}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleResolveReport(report.id, 'muted');
                        const attendee = attendees.find(a => a.user_id === report.reported_user_id);
                        if (attendee) handleMuteUser(attendee.id);
                      }}
                      className="text-xs bg-yellow-600 hover:bg-yellow-700"
                    >
                      Mute
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleResolveReport(report.id, 'banned');
                        const attendee = attendees.find(a => a.user_id === report.reported_user_id);
                        if (attendee) handleBanUser(attendee.id);
                      }}
                      className="text-xs bg-red-600 hover:bg-red-700"
                    >
                      Ban
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* MODERATION STATUS */}
      {(mutedUsers.length > 0 || bannedUsers.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mutedUsers.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <VolumeX className="w-4 h-4" />
                  Muted Users ({mutedUsers.length})
                </p>
                <div className="space-y-1">
                  {mutedUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{user.user_id}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnmuteUser(user.id)}
                        className="text-xs"
                      >
                        Unmute
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bannedUsers.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Banned Users ({bannedUsers.length})
                </p>
                <div className="space-y-1">
                  {bannedUsers.map(user => (
                    <div key={user.id} className="p-2 bg-red-50 rounded text-sm">
                      {user.user_id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {pendingReports.length === 0 && mutedUsers.length === 0 && bannedUsers.length === 0 && (
        <p className="text-sm text-gray-600 text-center p-4">No moderation actions needed</p>
      )}
    </div>
  );
}