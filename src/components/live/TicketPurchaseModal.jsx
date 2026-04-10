import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, Ticket, Calendar, Clock, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TicketPurchaseModal({ open, onOpenChange, event, onTicketPurchased }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // Block checkout in iframe (Base44 editor)
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the app in a full browser window.');
      return;
    }

    setLoading(true);
    try {
      const currentUrl = window.location.href;
      const successUrl = `${window.location.origin}/LiveEvents?ticket_success=1&event_id=${event.id}`;
      const cancelUrl = currentUrl;

      const res = await base44.functions.invoke('createEventTicketCheckout', {
        event_id: event.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      if (res.data.already_purchased) {
        toast.success('You already have a ticket for this event!');
        onTicketPurchased?.();
        onOpenChange(false);
        return;
      }

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error(error);
      toast.error('Payment setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const startTime = event.start_time || event.scheduled_start;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            Get Your Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Event Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {startTime && (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {format(new Date(startTime), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    {format(new Date(startTime), 'h:mm a')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between border rounded-xl p-4">
            <div>
              <p className="text-sm text-gray-500">Ticket Price</p>
              <p className="text-2xl font-bold text-gray-900">${Number(event.ticket_price).toFixed(2)}</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700 border-0">
              <Lock className="w-3 h-3 mr-1" />
              Full Access
            </Badge>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
            🔒 Secure payment via Stripe. Use test card <strong>4242 4242 4242 4242</strong> (any future date & CVC).
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Ticket className="w-4 h-4 mr-2" />
              )}
              Pay ${Number(event.ticket_price).toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}