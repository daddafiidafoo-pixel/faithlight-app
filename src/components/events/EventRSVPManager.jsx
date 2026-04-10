import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function EventRSVPManager({ eventId, event, userId, userName, userEmail, isCreator }) {
  const queryClient = useQueryClient();
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState('attending');
  const [specialNotes, setSpecialNotes] = useState('');

  const { data: rsvps = [] } = useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: () => base44.entities.EventRSVP.filter({ event_id: eventId }),
  });

  const { data: userRsvp } = useQuery({
    queryKey: ['user-rsvp', eventId, userId],
    queryFn: async () => {
      const userRsvps = await base44.entities.EventRSVP.filter({
        event_id: eventId,
        user_id: userId,
      });
      return userRsvps[0];
    },
  });

  const createRsvpMutation = useMutation({
    mutationFn: async () => {
      if (userRsvp) {
        return await base44.entities.EventRSVP.update(userRsvp.id, {
          status: rsvpStatus,
          special_notes: specialNotes,
        });
      }
      return await base44.entities.EventRSVP.create({
        event_id: eventId,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        status: rsvpStatus,
        special_notes: specialNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-rsvps', eventId]);
      queryClient.invalidateQueries(['user-rsvp', eventId, userId]);
      toast.success(`RSVP updated to ${rsvpStatus}!`);
      setRsvpDialogOpen(false);
    },
  });

  const cancelRsvpMutation = useMutation({
    mutationFn: async () => {
      if (userRsvp) {
        return await base44.entities.EventRSVP.delete(userRsvp.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-rsvps', eventId]);
      queryClient.invalidateQueries(['user-rsvp', eventId, userId]);
      toast.success('RSVP cancelled');
    },
  });

  const attendingCount = rsvps.filter(r => r.status === 'attending').length;
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length;
  const notAttendingCount = rsvps.filter(r => r.status === 'not_attending').length;

  const isFull = event?.max_attendees && attendingCount >= event.max_attendees;

  const openRsvpDialog = (defaultStatus = 'attending') => {
    if (userRsvp) {
      setRsvpStatus(userRsvp.status);
      setSpecialNotes(userRsvp.special_notes || '');
    } else {
      setRsvpStatus(defaultStatus);
      setSpecialNotes('');
    }
    setRsvpDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* User RSVP Section */}
      {event?.rsvp_required && (
        <Card className={userRsvp ? 'border-green-200 bg-green-50' : 'border-blue-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userRsvp ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  You're {userRsvp.status}
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-blue-600" />
                  RSVP Required
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRsvp ? (
                <>
                  <p className="text-sm text-gray-600">{userRsvp.special_notes}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openRsvpDialog()}
                      variant="outline"
                      size="sm"
                    >
                      Change RSVP
                    </Button>
                    <Button
                      onClick={() => cancelRsvpMutation.mutate()}
                      variant="destructive"
                      size="sm"
                    >
                      Cancel RSVP
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => openRsvpDialog('attending')}
                    className={isFull ? 'opacity-50 cursor-not-allowed' : ''}
                    disabled={isFull}
                  >
                    {isFull ? 'Event Full' : 'I\'m Attending'}
                  </Button>
                  <Button onClick={() => openRsvpDialog('maybe')} variant="outline">
                    Maybe
                  </Button>
                  <Button onClick={() => openRsvpDialog('not_attending')} variant="outline">
                    Not Attending
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RSVP Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Attending
              </p>
              <p className="text-3xl font-bold text-green-600">{attendingCount}</p>
              {event?.max_attendees && (
                <p className="text-xs text-gray-500">/ {event.max_attendees}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                Maybe
              </p>
              <p className="text-3xl font-bold text-yellow-600">{maybeCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-600" />
                Not Attending
              </p>
              <p className="text-3xl font-bold text-red-600">{notAttendingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RSVP List (For Creator) */}
      {isCreator && (
        <Card>
          <CardHeader>
            <CardTitle>RSVP List</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="attending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="attending">Attending ({attendingCount})</TabsTrigger>
                <TabsTrigger value="maybe">Maybe ({maybeCount})</TabsTrigger>
                <TabsTrigger value="not_attending">Not Attending ({notAttendingCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="attending">
                <div className="space-y-2">
                  {rsvps
                    .filter(r => r.status === 'attending')
                    .map(rsvp => (
                      <RSVPItem key={rsvp.id} rsvp={rsvp} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="maybe">
                <div className="space-y-2">
                  {rsvps
                    .filter(r => r.status === 'maybe')
                    .map(rsvp => (
                      <RSVPItem key={rsvp.id} rsvp={rsvp} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="not_attending">
                <div className="space-y-2">
                  {rsvps
                    .filter(r => r.status === 'not_attending')
                    .map(rsvp => (
                      <RSVPItem key={rsvp.id} rsvp={rsvp} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* RSVP Dialog */}
      <Dialog open={rsvpDialogOpen} onOpenChange={setRsvpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSVP to {event?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your Response</Label>
              <Select value={rsvpStatus} onValueChange={setRsvpStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attending">I'm Attending</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="not_attending">Not Attending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Special Notes (optional)</Label>
              <Textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g., dietary restrictions, questions, etc."
                rows={3}
              />
            </div>

            <Button
              onClick={() => createRsvpMutation.mutate()}
              disabled={createRsvpMutation.isPending}
              className="w-full"
            >
              Confirm RSVP
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RSVPItem({ rsvp }) {
  return (
    <div className="p-3 border rounded-lg flex items-start justify-between">
      <div>
        <p className="font-semibold">{rsvp.user_name}</p>
        <p className="text-xs text-gray-500">{rsvp.user_email}</p>
        {rsvp.special_notes && (
          <p className="text-sm text-gray-600 mt-1">{rsvp.special_notes}</p>
        )}
      </div>
      <Badge className={
        rsvp.status === 'attending' ? 'bg-green-100 text-green-800' :
        rsvp.status === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }>
        {rsvp.status}
      </Badge>
    </div>
  );
}