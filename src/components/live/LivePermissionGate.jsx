import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Sparkles, Ticket } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import TicketPurchaseModal from './TicketPurchaseModal';

export default function LivePermissionGate({ type, onDismiss, event }) {
  const [showTicketModal, setShowTicketModal] = useState(false);

  const messages = {
    ticket: {
      icon: <Ticket className="w-8 h-8 text-emerald-500" />,
      title: 'Ticket Required',
      body: `This is a paid event. Purchase a ticket to join.`,
      cta: `Buy Ticket · $${event ? Number(event.ticket_price).toFixed(2) : ''}`,
      color: 'emerald',
      action: () => setShowTicketModal(true),
    },
    video: {
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      title: 'Premium Feature',
      body: 'Video study is a Premium feature (up to 10 participants). Start your 30-day free trial.',
      cta: 'Start Free Trial',
      href: createPageUrl('Pricing'),
      color: 'purple',
    },
    speak: {
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      title: 'Upgrade to Speak',
      body: 'Upgrade to Premium to request speaking access in live audio sessions.',
      cta: 'View Plans',
      href: createPageUrl('Pricing'),
      color: 'amber',
    },
    host_audio: {
      icon: <Lock className="w-8 h-8 text-indigo-500" />,
      title: 'Verified Leader Required',
      body: 'Hosting a 500-listener Audio Live session requires Verified Leader status (Level 4+ and approved).',
      cta: 'Learn More',
      href: createPageUrl('ApplyForVerification'),
      color: 'indigo',
    },
  };

  const msg = messages[type] || messages.video;
  const colors = {
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    emerald: 'bg-emerald-50 border-emerald-200',
  };

  return (
    <>
      <div className={`rounded-xl border p-6 text-center ${colors[msg.color]}`}>
        <div className="flex justify-center mb-3">{msg.icon}</div>
        <h3 className="font-bold text-gray-900 mb-2">{msg.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{msg.body}</p>
        <div className="flex gap-2 justify-center">
          {msg.action ? (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={msg.action}>
              {msg.cta}
            </Button>
          ) : (
            <Link to={msg.href}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">{msg.cta}</Button>
            </Link>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>Dismiss</Button>
          )}
        </div>
      </div>

      {event && (
        <TicketPurchaseModal
          open={showTicketModal}
          onOpenChange={setShowTicketModal}
          event={event}
          onTicketPurchased={() => {
            setShowTicketModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}