import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Loader, AlertCircle, Download, Library, Globe2, Star, Zap, RotateCcw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../I18nProvider';
import { useEntitlementStatus } from '../hooks/useEntitlementStatus';
import MobileIAPHandler from './MobileIAPHandler';
import SavedAIOutputsLibrary from './SavedAIOutputsLibrary';
import AdvancedOfflineManager from '../offline/AdvancedOfflineManager';
import { shouldShowWebPaymentLink } from '../utils/appDetection';
import { shouldShowPaymentsUI } from '../lib/billing/paymentsGuard';
import ReaderModeMembershipCard from '../billing/ReaderModeMembershipCard';
import { useRegionalPricing } from '../pricing/useRegionalPricing';
import PricingPsychologyCards from '../pricing/PricingPsychologyCards';
import { createPageUrl } from '@/utils';

// Stripe price IDs — replace with real IDs from your Stripe dashboard
const PRICE_IDS = {
  basic_global:   'price_basic_global_5',
  premium_global: 'price_premium_global_15',
  basic_africa:   'price_basic_africa_2',
  premium_africa: 'price_premium_africa_5',
};

export default function UpgradePremiumPage() {
   const { lang, t } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('basic');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isIframe, setIsIframe] = useState(false);

  const entitlementStatus = useEntitlementStatus(user?.id, !!user);
  const isPremium = entitlementStatus?.is_premium || false;
  const showWebPaymentUI = shouldShowWebPaymentLink();
  const { pricing, loading: pricingLoading } = useRegionalPricing(user);

  useEffect(() => {
    try { setIsIframe(window.self !== window.top); } catch { setIsIframe(true); }
    const load = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
        }
      } catch {
        // stay unauthenticated
      } finally {
        setLoading(false);
      }
    };
    load();
    base44.functions.invoke('trackAnalyticsEvent', {
      event_type: 'plan_view',
      metadata: { page: 'upgrade' },
    }).catch(() => {});
  }, []);

  const getPriceId = () => {
    if (!pricing) return null;
    if (pricing.isAfrica) {
      return selectedTier === 'basic' ? PRICE_IDS.basic_africa : PRICE_IDS.premium_africa;
    }
    return selectedTier === 'basic' ? PRICE_IDS.basic_global : PRICE_IDS.premium_global;
  };

  const getPrice = (tier) => {
    if (!pricing) return '...';
    return `${pricing.currency}${tier === 'basic' ? pricing.basic : pricing.premium}`;
  };

  const handleUpgrade = async () => {
    if (isIframe) {
      setError(t('upgrade.errors.iframe'));
      return;
    }
    // Track upgrade click
    base44.functions.invoke('trackAnalyticsEvent', {
      event_type: 'upgrade_click',
      metadata: { tier: selectedTier, region: pricing?.isAfrica ? 'africa' : 'global' },
    }).catch(() => {});

    setCheckoutLoading(true);
    setError(null);
    try {
      const priceId = getPriceId();
      const currentUrl = window.location.origin;
      const response = await base44.functions.invoke('createCheckoutSession', {
        price_id: priceId,
        plan_key: selectedTier.toUpperCase(),
        success_url: `${currentUrl}/billing-success`,
        cancel_url: `${currentUrl}/billing-cancel`,
      });
      if (response.data?.session_url) {
        window.location.href = response.data.session_url;
      } else {
        setError(t('upgrade.errors.checkout'));
      }
      } catch (err) {
      console.error('Checkout error:', err);
      setError(t('upgrade.errors.failed'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading || pricingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 mt-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
            <p className="text-gray-600 mb-4">{t('upgrade.loginToUpgrade')}</p>
            <Button onClick={() => base44.auth.redirectToLogin()}>{t('nav.login')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already premium
  if (isPremium) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-bold text-gray-900">{t('upgrade.premiumActive')}</p>
                <p className="text-sm text-gray-500">
                  {entitlementStatus.current_period_end
                    ? t('upgrade.renewsOn', { date: new Date(entitlementStatus.current_period_end).toLocaleDateString() })
                    : t('upgrade.enjoyFeatures')}
                </p>
              </div>
            </div>
            <Link to={createPageUrl('ManageSubscription')}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Settings className="w-3.5 h-3.5" /> {t('upgrade.manage')}
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library" className="gap-2"><Library className="w-4 h-4" /> Saved Outputs</TabsTrigger>
            <TabsTrigger value="offline" className="gap-2"><Download className="w-4 h-4" /> Offline</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="mt-6"><SavedAIOutputsLibrary /></TabsContent>
          <TabsContent value="offline" className="mt-6"><AdvancedOfflineManager /></TabsContent>
        </Tabs>
      </div>
    );
  }

  // Reader-app model: inside native wrapper, show membership card — no pricing, no upgrade buttons
  if (!shouldShowPaymentsUI()) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <ReaderModeMembershipCard me={user} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('upgrade.title')}</h1>
        <p className="text-gray-500 text-sm">{t('upgrade.subtitle')}</p>
      </div>

      {/* Regional badge */}
      {pricing?.isAfrica && (
        <div className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs text-green-700 font-medium w-fit mx-auto">
          <Globe2 className="w-3.5 h-3.5" /> {t('upgrade.regionalPricing')}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Pricing Psychology Cards */}
      <PricingPsychologyCards
        pricing={pricing}
        onSelectPlan={setSelectedTier}
        selectedPlan={selectedTier}
      />

      {/* Primary CTA */}
      <Button
        onClick={handleUpgrade}
        disabled={checkoutLoading}
        size="lg"
        className={`w-full h-13 text-base font-bold gap-2 rounded-xl ${
          selectedTier === 'basic'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
        }`}
      >
        {checkoutLoading ? (
          <><Loader className="w-5 h-5 animate-spin" /> {t('upgrade.processing')}</>
        ) : (
          t('upgrade.start', { tier: selectedTier === 'basic' ? t('upgrade.free') : t('upgrade.premium') })
        )}
      </Button>

      {/* Auto-renewal disclosure — required by Apple */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 space-y-1">
        <p>• {t('upgrade.autoRenewal')}</p>
        <p>• {t('upgrade.trialTerms')}</p>
      </div>

      {/* Trust line + Restore Purchases */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-400">{t('upgrade.securePay')} · {t('upgrade.cancelAnytime')}</p>
        <MobileIAPHandler user={user} entitlementStatus={entitlementStatus} />
      </div>
    </div>
  );
}