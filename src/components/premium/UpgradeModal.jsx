import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '../I18nProvider';
import { Sparkles, Check, Lock } from 'lucide-react';
import { shouldShowPaymentsUI } from '../lib/billing/paymentsGuard';
import ReaderModeMembershipCard from '../billing/ReaderModeMembershipCard';

/**
 * UpgradeModal
 * 
 * Premium upgrade upsell modal
 * Shows benefits and pricing
 */
export default function UpgradeModal({ open, onClose, onUpgradeClick, me }) {
  const { t } = useI18n();

  if (!shouldShowPaymentsUI()) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <ReaderModeMembershipCard me={me} />
        </DialogContent>
      </Dialog>
    );
  }

  const benefits = [
    { label: t('premium.unlimitedBible', 'Unlimited Bible Reading'), icon: Sparkles },
    { label: t('premium.unlimitedAudio', 'Unlimited Audio Streaming'), icon: Sparkles },
    { label: t('premium.unlimitedAI', 'Unlimited AI Tools'), icon: Sparkles },
    { label: t('premium.advancedAudioFeatures', 'Speed Control & Sleep Timer'), icon: Check },
    { label: t('premium.certTheology', 'Certificate in Theology & Leadership'), icon: Lock },
    { label: t('premium.advancedSermon', 'Advanced Sermon Tools'), icon: Sparkles },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('premium.upgradeTitle', 'Upgrade to Premium')}
          </DialogTitle>
          <DialogDescription>
            {t('premium.upgradeDesc', 'Unlock unlimited AI and exclusive features')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <div className="space-y-2">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-700">{benefit.label}</span>
                </div>
              );
            })}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">$10</p>
                <p className="text-xs text-gray-600 mt-1">Monthly</p>
                <p className="text-xs text-amber-600 font-semibold mt-0.5">30-day free trial</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-indigo-600 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">$96</p>
                <p className="text-xs text-indigo-600 mt-1">Yearly (Save 20%)</p>
                <p className="text-xs text-gray-400 mt-0.5">$8/mo billed yearly</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Button
            onClick={onUpgradeClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-10"
          >
            Start Free 30-Day Trial
          </Button>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            {t('premium.cancelAnytime', 'Cancel anytime. No refunds on partial months.')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}