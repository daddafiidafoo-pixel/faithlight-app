/**
 * PremiumGateModal
 * 
 * Universal upgrade modal for all premium-gated features.
 * Shows feature name, benefits, and clear upgrade path.
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Check, LogIn } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { shouldShowPaymentsUI } from '../lib/billing/paymentsGuard';
import ReaderModeMembershipCard from '../billing/ReaderModeMembershipCard';

export default function PremiumGateModal({
  open,
  onClose,
  featureName = 'Premium Feature',
  reason = 'premium_required',
}) {
  const inApp = !shouldShowPaymentsUI();

  const benefits = [
    '📖 Unlimited Bible insights',
    '🙏 Unlimited AI prayers',
    '🎙 Unlimited sermon generation',
    '💾 Save & download sermons',
    '🌍 Multi-language support',
  ];

  // ── Reader-app model: no pricing/upgrade inside native wrapper ──
  if (inApp) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Lock className="w-5 h-5 text-indigo-700" />
              </div>
              <DialogTitle className="text-lg">Members Only</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-600 mb-4">
            <strong>{featureName}</strong> is available to members. Sign in to access your membership benefits.
          </DialogDescription>
          <div className="space-y-3">
            <ReaderModeMembershipCard />
            <Button variant="outline" className="w-full" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Web: full upgrade modal ──
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <DialogTitle className="text-lg">Unlock FaithLight Premium ✨</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-base mb-4">
          You've reached your free limit 🙏<br />
          <span className="text-gray-500 text-sm">Unlock unlimited access with FaithLight Premium</span>
        </DialogDescription>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-indigo-900 mb-3">Premium includes:</p>
          <ul className="space-y-2">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-indigo-800">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">Monthly</div>
            <div className="text-xl font-bold text-gray-900">$4.99<span className="text-sm font-normal text-gray-500">/mo</span></div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-amber-600">Best Value ⭐</div>
            <div className="text-xl font-bold text-gray-900">$29.99<span className="text-sm font-normal text-gray-500">/yr</span></div>
            <div className="text-xs text-green-600 font-semibold">Save over 50%</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white gap-2"
            onClick={() => { window.location.href = '/SubscriptionPage'; }}
          >
            Upgrade to Premium <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="w-full text-gray-500" onClick={onClose}>
            Continue with Free (limited)
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-gray-400">Cancel anytime · No commitment · Secure payment</p>
      </DialogContent>
    </Dialog>
  );
}