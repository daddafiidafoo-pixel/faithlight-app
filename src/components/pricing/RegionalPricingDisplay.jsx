import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Globe, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function RegionalPricingDisplay({ onPricingLoaded }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countryOverride, setCountryOverride] = useState(false);
  const [trialStatus, setTrialStatus] = useState(null);

  const trialMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('initiateFreeTrialSubscription', {});
      return response.data;
    },
    onSuccess: (data) => {
      setTrialStatus(data);
      alert('🎉 30-day free trial activated! Start exploring premium features now.');
    },
    onError: (err) => {
      alert(`Unable to start trial: ${err.response?.data?.message || 'Please try again'}`);
    }
  });

  useEffect(() => {
    fetchPricing();
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await base44.functions.invoke('getTrialStatus', {});
      setTrialStatus(response.data);
    } catch (err) {
      console.warn('Failed to fetch trial status:', err);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await base44.functions.invoke('getCountryPricingTier', {});
      setPricing(response.data);
      if (onPricingLoaded) {
        onPricingLoaded(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      // Default to Tier 3
      const defaultPricing = {
        countryCode: 'US',
        countryName: 'United States',
        tier: 'tier_3',
        monthlyPriceCents: 699,
        yearlyPriceCents: 5999,
        currency: 'USD'
      };
      setPricing(defaultPricing);
      onPricingLoaded?.(defaultPricing);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'tier_1':
        return 'bg-green-50 border-green-200';
      case 'tier_2':
        return 'bg-blue-50 border-blue-200';
      case 'tier_3':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50';
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'tier_1':
        return 'Africa & Developing Regions';
      case 'tier_2':
        return 'Asia, Middle East & Mixed Economies';
      case 'tier_3':
        return 'Europe, North America & Developed Regions';
      default:
        return 'Standard Pricing';
    }
  };

  const formatPrice = (cents, currency) => {
    const dollars = (cents / 100).toFixed(2);
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${dollars}`;
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading pricing...</div>;
  }

  if (!pricing) {
    return <div className="text-center text-red-600">Unable to load pricing</div>;
  }

  return (
    <div className="space-y-6">
      {/* Pricing Detected Header */}
      <Card className={`border-2 ${getTierColor(pricing.tier)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-indigo-600" />
              <div>
                <CardTitle className="text-lg">Regional Pricing Detected</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{getTierLabel(pricing.tier)}</p>
              </div>
            </div>
            {pricing.isDefault && (
              <Badge variant="outline">Using default pricing</Badge>
            )}
          </div>
          {pricing.countryCode && !pricing.isDefault && (
            <p className="text-sm text-gray-700 mt-2">
              ✓ Detected location: <strong>{pricing.countryName}</strong>
              {!countryOverride && (
                <button 
                  onClick={() => setCountryOverride(true)}
                  className="ml-3 text-indigo-600 hover:underline text-xs"
                >
                  Change country
                </button>
              )}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Pricing Cards */}
      {/* Trial Status */}
      {trialStatus && (
        <Card className={trialStatus.isActive ? 'border-2 border-purple-300 bg-purple-50' : ''}>
          <CardContent className="pt-6">
            {trialStatus.isActive ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <p className="font-semibold text-purple-900">
                    ✓ Free Trial Active — {trialStatus.daysRemaining} days remaining
                  </p>
                </div>
                <p className="text-sm text-purple-800">
                  You're enjoying all premium features. Enjoy exploring!
                </p>
              </div>
            ) : !trialStatus.hasUsedTrial ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <p className="font-semibold text-gray-900">Unlock Premium Features Free for 30 Days</p>
                </div>
                <p className="text-sm text-gray-700">
                  Experience offline audio, advanced courses, AI Bible Tutor, and leadership tools—no payment required for the trial.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                You've used your trial. Ready to subscribe? Choose a plan below.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly */}
        <Card className="border-2 border-indigo-300">
          <CardHeader>
            <CardTitle>Monthly Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-indigo-600">
                {formatPrice(pricing.monthlyPriceCents, pricing.currency)}
              </p>
              <p className="text-sm text-gray-600">/month (after trial)</p>
            </div>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              onClick={() => trialMutation.mutate()}
              disabled={!trialStatus?.canStartTrial || trialMutation.isPending}
            >
              {trialMutation.isPending ? 'Starting Trial...' : 'Start 30-Day Free Trial'}
            </Button>
            <p className="text-xs text-gray-600 text-center">
              30 days free, then {formatPrice(pricing.monthlyPriceCents, pricing.currency)}/month. Cancel anytime.
            </p>
          </CardContent>
        </Card>

        {/* Yearly */}
        <Card className="border-2 border-green-300 ring-2 ring-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Yearly Plan</CardTitle>
              <Badge className="bg-green-600">
                Save {Math.round((1 - (pricing.yearlyPriceCents / (pricing.monthlyPriceCents * 12))) * 100)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-green-600">
                {formatPrice(pricing.yearlyPriceCents, pricing.currency)}
              </p>
              <p className="text-sm text-gray-600">/year (after trial)</p>
              <p className="text-xs text-green-700 mt-1">
                {formatPrice(pricing.yearlyPriceCents / 12, pricing.currency)}/month billed annually
              </p>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              onClick={() => trialMutation.mutate()}
              disabled={!trialStatus?.canStartTrial || trialMutation.isPending}
            >
              {trialMutation.isPending ? 'Starting Trial...' : 'Start 30-Day Free Trial'}
            </Button>
            <p className="text-xs text-gray-600 text-center">
              Best value. 30 days free, then {formatPrice(pricing.yearlyPriceCents, pricing.currency)}/year.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transparency Message */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>🌍 Why regional pricing?</strong> FaithLight uses location-based pricing to make discipleship accessible worldwide. Your country's pricing reflects local purchasing power—not a discount, but fair access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}