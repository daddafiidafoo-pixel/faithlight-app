import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PremiumPaywall({ isOpen, onClose, reason = 'feature' }) {
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // Redirect to pricing/trial page
      window.location.href = '/PremiumFeatures';
    } catch (err) {
      console.error('Error starting trial:', err);
      setLoading(false);
    }
  };

  const reasonText = {
    'video': 'Host video calls with up to 10 participants',
    'speak': 'Request to speak in live Bible studies',
    'raise_hand': 'Raise your hand to participate'
  };

  const reasonTitle = {
    'video': 'Video Calls',
    'speak': 'Speaking Requests',
    'raise_hand': 'Participation'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <DialogTitle className="text-xl">FaithLight Premium</DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DialogDescription className="pt-2">
            Unlock deeper learning and community features
          </DialogDescription>
        </DialogHeader>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-[var(--faith-light-primary)] mb-3">
              Go Deeper with Premium
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Video study with friends (up to 10)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Request to speak in live Bible studies</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Offline learning tools & advanced courses</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3 mt-4">
          <Button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-dark)]"
            size="lg"
          >
            {loading ? 'Loading...' : 'Start 30-Day Free Trial'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-gray-600 text-center mt-4">
          Core Bible reading and listening remains free for everyone.
        </p>
      </DialogContent>
    </Dialog>
  );
}