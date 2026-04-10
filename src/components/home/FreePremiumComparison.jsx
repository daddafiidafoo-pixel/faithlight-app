import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '../I18nProvider';
import { Check } from 'lucide-react';
import { shouldShowPaymentsUI } from '../lib/billing/paymentsGuard';
import ReaderModeMembershipCard from '../billing/ReaderModeMembershipCard';

/**
 * FreePremiumComparison
 * 
 * Side-by-side comparison of Free vs Premium plans
 */
export default function FreePremiumComparison({ isPremium, onUpgradeMonthly, onUpgradeYearly }) {
  const { t } = useI18n();

  const freeFeatures = [
    t('compare.reading30min', '30 min reading/day'),
    t('compare.audio30min', '30 min audio/day'),
    t('compare.limitedAI', 'Limited AI requests'),
    t('compare.foundations', 'Foundations Academy'),
    t('compare.community', 'Community access'),
  ];

  const premiumFeatures = [
    t('compare.unlimitedReading', 'Unlimited reading'),
    t('compare.unlimitedAudio', 'Unlimited audio'),
    t('compare.unlimitedAI', 'Unlimited AI'),
    t('compare.advancedSermon', 'Advanced sermon tools'),
    t('compare.diploma', 'Certificate in Theology & Leadership'),
    t('compare.priority', 'Priority support'),
  ];

  if (isPremium) return null;
  if (!shouldShowPaymentsUI()) {
    return (
      <div className="mb-8">
        <ReaderModeMembershipCard me={null} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {t('compare.chooseYourPlan', 'Choose Your Plan')}
      </h2>
      <p className="text-center text-gray-600 mb-8">
        {t('compare.upgradeDesc', 'Access the full range of Bible study and learning tools')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE TIER */}
        <Card className="border-gray-300 bg-white">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {t('compare.free', 'Free')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('compare.freeDesc', 'Begin studying Scripture today')}
              </p>
            </div>

            <div className="space-y-2 py-4 border-y border-gray-200">
              {freeFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled
            >
              {t('compare.currentPlan', 'Your Current Plan')}
            </Button>
          </CardContent>
        </Card>

        {/* PREMIUM TIER (Highlighted) */}
        <Card className="border-2 border-indigo-600 bg-gradient-to-br from-indigo-50 to-white shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t('compare.premium', 'Premium')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('compare.premiumDesc', 'Full access to all features')}
                </p>
              </div>
              <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {t('compare.bestValue', 'Best Value')}
              </span>
            </div>

            <div className="space-y-2 py-4 border-y border-indigo-200">
              {premiumFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                onClick={onUpgradeMonthly}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-10"
              >
                Start Free Trial — $10/mo
              </Button>
              <Button
                onClick={onUpgradeYearly}
                variant="outline"
                className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold h-10"
              >
                Yearly — $96/yr (save 20%)
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              {t('compare.cancelAnytime', 'Cancel anytime. No commitments.')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}