import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Clock, Users, Music, Bell, Ticket, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import TicketPurchaseModal from '../live/TicketPurchaseModal';

export default function LiveEventCard({ event, isLive, isScheduled, isPast, isHosted }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        // Not logged in
      }
    };
    getUser();
  }, []);

  const isPaidEvent = event.is_paid && Number(event.ticket_price) > 0;
  const isHost = user?.id === event.host_id;

  const { data: ticket, refetch: refetchTicket } = useQuery({
    queryKey: ['event-ticket', event.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const tickets = await base44.entities.EventTicket.filter(
        { event_id: event.id, user_id: user.id, status: 'paid' },
        '-created_date',
        1
      );
      return tickets[0] || null;
    },
    enabled: !!user?.id && isPaidEvent && !isHost,
  });

  const { data: registration } = useQuery({
    queryKey: ['event-reg-card', event.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const regs = await base44.entities.EventRegistration.filter(
        { event_id: event.id, user_id: user.id },
        '-created_date',
        1
      );
      return regs[0] || null;
    },
    enabled: !!user?.id && isScheduled && !isPaidEvent,
  });

  const hasAccess = !isPaidEvent || isHost || !!ticket;
  const isRegistered = registration && registration.status === 'registered';

  const handleJoinClick = (e) => {
    if (isPaidEvent && !hasAccess && isLive) {
      e.preventDefault();
      setShowTicketModal(true);
    }
  };

  const startTime = event.start_time || event.scheduled_start;

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
            <div className="flex flex-col gap-1 items-end flex-shrink-0">
              {isLive && (
                <Badge className="bg-red-600 text-white animate-pulse">
                  <Play className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              )}
              {isPaidEvent && (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Ticket className="w-3 h-3 mr-1" />
                  ${Number(event.ticket_price).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          )}

          <div className="space-y-2">
            {startTime && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>{format(new Date(startTime), 'MMM d, yyyy')}</span>
              </div>
            )}
            {startTime && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>{format(new Date(startTime), 'h:mm a')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>{event.participant_count || 0} listeners</span>
            </div>
          </div>

          {/* Access badges */}
          {isPaidEvent && !isHost && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded ${
              hasAccess ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {hasAccess ? (
                <><Ticket className="w-4 h-4" /> Ticket purchased</>
              ) : (
                <><Lock className="w-4 h-4" /> Paid event · ${Number(event.ticket_price).toFixed(2)} to join</>
              )}
            </div>
          )}

          {isScheduled && isRegistered && !isPaidEvent && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
              <Bell className="w-4 h-4" />
              You're registered
            </div>
          )}

          {isPast && event.audio_url && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded">
              <Music className="w-4 h-4" />
              Recording available
            </div>
          )}

          {/* Action Button */}
          {isLive && isPaidEvent && !hasAccess ? (
            <Button
              className="w-full gap-2 mt-4 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowTicketModal(true)}
            >
              <Ticket className="w-4 h-4" />
              Buy Ticket · ${Number(event.ticket_price).toFixed(2)}
            </Button>
          ) : (
            <Link
              to={isLive ? `${createPageUrl('LiveRoom')}?roomId=${event.id}` : `${createPageUrl('LiveEventDetail')}?id=${event.id}`}
              onClick={handleJoinClick}
            >
              <Button className="w-full gap-2 mt-4" variant={isLive ? 'default' : 'outline'}>
                {isLive ? (
                  <><Play className="w-4 h-4" />Join Now</>
                ) : isScheduled && isPaidEvent && !hasAccess ? (
                  <><Ticket className="w-4 h-4" />Buy Ticket · ${Number(event.ticket_price).toFixed(2)}</>
                ) : isPast ? (
                  event.audio_url ? 'Listen Recording' : 'View Details'
                ) : (
                  'View Details'
                )}
              </Button>
            </Link>
          )}

          {/* Buy ticket for upcoming paid events */}
          {isScheduled && isPaidEvent && !hasAccess && !isHost && (
            <Button
              variant="outline"
              className="w-full gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setShowTicketModal(true)}
            >
              <Ticket className="w-4 h-4" />
              Buy Ticket · ${Number(event.ticket_price).toFixed(2)}
            </Button>
          )}
        </CardContent>
      </Card>

      <TicketPurchaseModal
        open={showTicketModal}
        onOpenChange={setShowTicketModal}
        event={event}
        onTicketPurchased={() => {
          refetchTicket();
          setShowTicketModal(false);
        }}
      />
    </>
  );
}