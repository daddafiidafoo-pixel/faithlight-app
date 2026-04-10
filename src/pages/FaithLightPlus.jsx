import React, { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { Sparkles, Check, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FaithLightPlus() {
  const { t, isRTL } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const premiumFeatures = [
    { key: 'upgrade.features.aiExplanations', default: 'AI verse explanations' },
    { key: 'upgrade.features.sermonOutlines', default: 'Sermon outline generator' },
    { key: 'upgrade.features.devotionals', default: 'Devotional generator' },
    { key: 'upgrade.features.aiPrayer', default: 'AI prayer generator' },
    { key: 'upgrade.features.unlimitedHighlights', default: 'Unlimited highlights & collections' },
    { key: 'upgrade.features.offlineAudio', default: 'Offline audio Bible' },
    { key: 'upgrade.features.studyPlans', default: 'Personalized AI study plans' },
  ];

  return (
    <div 
      className="min-h-screen px-4 sm:px-6 py-8 pb-24"
      style={{
        background: 'var(--faith-light-bg)',
        color: 'var(--faith-light-text-primary)',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <div className="flex justify-center mb-4">
            <div className="bg-[var(--faith-light-primary)] p-3 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--faith-light-primary-dark)' }}>
            {t('upgrade.title', 'FaithLight Plus')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--faith-light-text-secondary)' }}>
            {t('upgrade.subtitle', 'Unlock deeper Bible study tools')}
          </p>
        </div>

        {/* Premium Features */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-[var(--faith-light-border)]">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--faith-light-primary)' }}>
            {t('upgrade.premiumFeatures', 'Premium Features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--faith-light-primary)' }} />
                <span style={{ color: 'var(--faith-light-text-primary)' }}>
                  {t(feature.key, feature.default)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--faith-light-primary)' }}>
            {t('upgrade.selectPlan', 'Choose Your Plan')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-[var(--faith-light-primary)] bg-indigo-50 dark:bg-slate-800'
                  : 'border-[var(--faith-light-border)] bg-white dark:bg-slate-900'
              }`}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--faith-light-text-secondary)' }}>
                {t('upgrade.monthly', 'Monthly')}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--faith-light-primary)' }}>
                $3.99
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--faith-light-text-tertiary)' }}>
                {t('upgrade.perMonth', 'per month')}
              </p>
            </div>

            {/* Yearly Plan (Recommended) */}
            <div
              onClick={() => setSelectedPlan('yearly')}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-[var(--faith-light-accent)] bg-amber-50 dark:bg-slate-800'
                  : 'border-[var(--faith-light-border)] bg-white dark:bg-slate-900'
              }`}
            >
              <div className="absolute -top-3 left-4 bg-[var(--faith-light-accent)] text-[var(--faith-light-primary-dark)] text-xs font-bold px-3 py-1 rounded-full">
                {t('upgrade.bestValue', 'Best Value')}
              </div>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--faith-light-text-secondary)' }}>
                {t('upgrade.yearly', 'Yearly')}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--faith-light-primary)' }}>
                $29.99
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--faith-light-text-tertiary)' }}>
                {t('upgrade.perYear', 'per year')} • {t('upgrade.save25', '25% off')}
              </p>
            </div>
          </div>

          {/* Free Trial */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5" style={{ color: 'var(--faith-light-primary)' }} />
              <p className="font-semibold" style={{ color: 'var(--faith-light-primary)' }}>
                {t('upgrade.freeTrial', '7-day free trial')}
              </p>
            </div>
            <p style={{ color: 'var(--faith-light-text-secondary)' }}>
              {t('upgrade.trialMessage', 'Start free. Cancel anytime. No credit card required.')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            className="w-full py-6 text-base font-semibold"
            style={{
              backgroundColor: 'var(--faith-light-primary)',
              color: 'white',
            }}
          >
            {t('upgrade.startFreeTrial', 'Start 7-Day Free Trial')}
          </Button>
          <Button
            variant="outline"
            className="w-full py-6 text-base font-semibold border-2"
            style={{
              borderColor: 'var(--faith-light-primary)',
              color: 'var(--faith-light-primary)',
            }}
          >
            {t('upgrade.restorePurchase', 'Restore Purchase')}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2 text-sm">
          <p style={{ color: 'var(--faith-light-text-secondary)' }}>
            {t('upgrade.coreFeaturesFree', 'Core Bible reading features remain free for everyone')}
          </p>
          <p style={{ color: 'var(--faith-light-text-tertiary)' }}>
            {t('upgrade.pricingNote', 'Pricing may vary by region and your device\'s app store')}
          </p>
        </div>
      </div>
    </div>
  );
}