import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Loader2, AlertCircle, CheckCircle2, CreditCard, ChevronRight,
  Calendar, DollarSign, Sparkles
} from 'lucide-react';

export default function ManageSubscription() {
  const [user, setUser] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        const ent = await base44.entities.UserEntitlement.filter({ user_id: u.id }, '-created_date', 1).catch(() => []);
        if (ent.length > 0) setPlanInfo(ent[0]);
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">Please sign in to manage your subscription.</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
      </div>
    );
  }

  const planLabel = planInfo?.product_id?.includes('premium') ? 'Premium'
    : planInfo?.product_id?.includes('basic') ? 'Basic' : 'Free';

  const renewalDate = planInfo?.current_period_end
    ? new Date(planInfo.current_period_end).toLocaleDateString()
    : null;

  const trialDaysLeft = planInfo?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(planInfo.trial_ends_at) - Date.now()) / 86400000))
    : null;

  const isTrialing = trialDaysLeft && trialDaysLeft > 0;
  const isCanceled = planInfo?.cancel_at_period_end;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Subscription</h1>
            <p className="text-sm text-gray-500">View and manage your subscription plan</p>
          </div>
        </div>

        {/* Offline warning */}
        {!isOnline && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Offline Mode</p>
              <p className="text-sm text-amber-800 mt-0.5">
                Some subscription management features are unavailable. Please connect to the internet to manage upgrades or cancellations.
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <Card className="shadow-md mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </div>
              <Badge className={`text-sm px-3 py-1 ${
                planLabel === 'Premium' ? 'bg-indigo-600 text-white' :
                planLabel === 'Basic' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {planLabel === 'Premium' && <Sparkles className="w-3.5 h-3.5 inline mr-1" />}
                {planLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trial info */}
              {isTrialing && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-900">Trial Status</p>
                  </div>
                  <p className="text-lg font-bold text-amber-700">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-amber-600 mt-1">Remaining in trial</p>
                </div>
              )}

              {/* Renewal date */}
              {renewalDate && !isCanceled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-semibold text-green-900">Next Billing Date</p>
                  </div>
                  <p className="text-lg font-bold text-green-700">{renewalDate}</p>
                  <p className="text-xs text-green-600 mt-1">Auto-renewal enabled</p>
                </div>
              )}

              {/* Cancellation notice */}
              {isCanceled && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-semibold text-red-900">Cancellation Notice</p>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Your subscription will be cancelled on {renewalDate}. You'll retain access until then.
                  </p>
                </div>
              )}
            </div>

            {/* Plan features */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">Included Features</p>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {planLabel === 'Premium' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Unlimited AI explanations & sermon builder
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Offline downloads (all Bible translations)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Advanced study plans & certificate
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Priority support
                    </li>
                  </>
                )}
                {planLabel === 'Basic' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      5 AI explanations per day
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Offline downloads (1 translation)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Basic study plans
                    </li>
                  </>
                )}
                {planLabel === 'Free' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Limited AI explanations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Full Bible access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Basic features
                    </li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {planLabel === 'Free' && (
            <Link to={createPageUrl('UpgradePremium')} className="block">
              <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="w-4 h-4" /> Upgrade to Premium
              </Button>
            </Link>
          )}

          {planLabel === 'Basic' && (
            <Link to={createPageUrl('UpgradePremium')} className="block">
              <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="w-4 h-4" /> Upgrade to Premium
              </Button>
            </Link>
          )}

          {(planLabel === 'Premium' || planLabel === 'Basic') && !isCanceled && (
            <Button variant="outline" disabled={!isOnline} className="w-full gap-2">
              <AlertCircle className="w-4 h-4" /> Cancel Subscription
            </Button>
          )}

          {isCanceled && (
            <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" disabled={!isOnline}>
              <CheckCircle2 className="w-4 h-4" /> Reactivate Subscription
            </Button>
          )}
        </div>

        {/* Billing History Link */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
          <Link to={createPageUrl('BillingHistory')} className="flex items-center justify-between group">
            <div>
              <p className="font-medium text-gray-900">Billing History</p>
              <p className="text-xs text-gray-500">View your past invoices and payments</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Link>
        </div>

        {/* Privacy and Legal */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-3">
            Have questions about your subscription?
          </p>
          <Link to={createPageUrl('FAQ')}>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
              View FAQ <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}