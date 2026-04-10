/**
 * UpsellModal — High-converting trial upsell
 *
 * Version A (AI_LIMIT, SERMON_ATTEMPT, READING_5): Limitation-based
 * Version B (STREAK_7): Positive reinforcement / celebration
 */

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, Mic2, Award, Download, RotateCcw, LogIn } from 'lucide-react';
import { shouldShowPaymentsUI } from '../lib/billing/paymentsGuard';
import ReaderModeMembershipCard from '../billing/ReaderModeMembershipCard';
import { base44 } from '@/api/base44Client';

// ── Config per trigger reason ─────────────────────────────────────────────────
const REASON_CONFIG = {
  AI_LIMIT: {
    variant: 'A',
    emoji: '🚀',
    headline: "You're growing fast",
    subheadline: 'Continue unlimited AI study with Premium.',
    highlightText: 'Start your 30-day free trial today.',
    highlightSub: 'Then only $10/month — or save 20% with yearly.',
  },
  SERMON_ATTEMPT: {
    variant: 'A',
    emoji: '✍️',
    headline: 'Sermon Builder is Premium',
    subheadline: 'Unlock the full Advanced Sermon Builder with Premium.',
    highlightText: 'Start your 30-day free trial today.',
    highlightSub: 'Then only $10/month — or save 20% with yearly.',
  },
  READING_5: {
    variant: 'A',
    emoji: '📖',
    headline: "You're building a habit",
    subheadline: 'Keep going without limits with Premium.',
    highlightText: 'Start your 30-day free trial today.',
    highlightSub: 'Then only $10/month — or save 20% with yearly.',
  },
  STREAK_7: {
    variant: 'B',
    emoji: '🎉',
    headline: '7-Day Streak!',
    subheadline: 'Keep building your momentum with Premium tools.',
    highlightText: 'Unlock 30 days free',
    highlightSub: 'Then only $10/month. No charge today.',
  },
  DEFAULT: {
    variant: 'A',
    emoji: '✨',
    headline: 'Unlock unlimited Bible study tools',
    subheadline: 'Premium gives you everything you need to go deeper.',
    highlightText: 'Start your 30-day free trial today.',
    highlightSub: 'Then only $10/month — or save 20% with yearly.',
  },
};

const BENEFITS = [
  { icon: Sparkles, text: 'Unlimited AI explanations' },
  { icon: Mic2,     text: 'Advanced Sermon Builder' },
  { icon: Award,    text: 'Theology & Leadership Certificate' },
  { icon: Download, text: 'Offline downloads' },
];

export default function UpsellModal({ open, onClose, reason = 'DEFAULT' }) {
  const navigate = useNavigate();
  const config = REASON_CONFIG[reason] || REASON_CONFIG.DEFAULT;
  const isStreakVariant = config.variant === 'B';
  const inApp = !shouldShowPaymentsUI();

  const handleUpgrade = () => {
    onClose();
    navigate(createPageUrl('UpgradePremium'));
  };

  // Reader-app model: no pricing or upgrade flow inside native wrapper
  if (inApp) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <ReaderModeMembershipCard />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0">

        {/* Header — different gradient for streak variant */}
        <div className={`px-6 pt-8 pb-6 text-white text-center ${
          isStreakVariant
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : 'bg-gradient-to-br from-indigo-600 to-purple-700'
        }`}>
          <div className="text-4xl mb-3">{config.emoji}</div>
          <h2 className="text-xl font-bold mb-1">{config.headline}</h2>
          <p className={`text-sm leading-snug ${isStreakVariant ? 'text-amber-100' : 'text-indigo-100'}`}>
            {config.subheadline}
          </p>
        </div>

        {/* Highlight box */}
        <div className="mx-5 mt-5 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-center">
          <p className="font-bold text-indigo-800 text-sm">{config.highlightText}</p>
          <p className="text-xs text-indigo-500 mt-0.5">{config.highlightSub}</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4 space-y-2.5 bg-white">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-2 bg-white border-t border-gray-100 pt-3">
          <Button
            onClick={handleUpgrade}
            className={`w-full h-11 font-bold text-sm rounded-xl ${
              isStreakVariant
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
          >
            {isStreakVariant ? 'Unlock 30 Days Free' : 'Start Free Trial'}
          </Button>
          <button
            onClick={onClose}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 transition-colors"
          >
            Not now
          </button>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>No charge today. Cancel anytime.</span>
            <button className="flex items-center gap-1 text-indigo-500 hover:underline">
              <RotateCcw className="w-3 h-3" /> Restore Purchases
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}