import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, X, Zap, Award, Book } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function AcademySubscription() {
  const [user, setUser] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { t } = useI18n?.() || { t: (key, def) => def };

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    };
    checkAuth();
  }, []);

  const { data: userSub } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const subs = await base44.entities.UserSubscription.filter({ user_id: user.id });
      return subs.length > 0 ? subs[0] : null;
    },
    enabled: !!user?.id,
  });

  const handleCheckout = async (plan) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await base44.functions.invoke('createAcademyCheckoutSession', {
        plan,
        userId: user.id,
        userEmail: user.email,
      });

      if (response.data?.url) {
        // Check if running in iframe (Base44 preview)
        if (window.self !== window.top) {
          alert('Checkout works only from the published app. Please open in full browser.');
          setIsCheckingOut(false);
          return;
        }
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const isSubscribed = userSub?.status === 'active' && userSub?.subscription_type !== 'free';

  const features = [
    { name: 'Full Theology Courses', free: false, academy: true },
    { name: 'Leadership Certification', free: false, academy: true },
    { name: 'AI Advanced Commentary', free: false, academy: true },
    { name: 'Downloadable Materials', free: false, academy: true },
    { name: 'Completion Certificates', free: false, academy: true },
    { name: 'Personalized Study Plans', free: false, academy: true },
    { name: 'Bible Reading (offline)', free: true, academy: true },
    { name: 'Basic Study Plans', free: true, academy: true },
    { name: 'Community Groups', free: true, academy: true },
    { name: 'Quiz & Challenges', free: true, academy: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">FaithLight Academy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock advanced Christian training, AI-powered study tools, and certification paths.
          </p>
        </div>

        {/* Current Status */}
        {isSubscribed && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-900 font-semibold">
              ✓ Your Academy subscription is active
            </p>
            <p className="text-sm text-green-800 mt-1">
              Expires: {new Date(userSub.expires_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded font-semibold transition ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded font-semibold transition ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Yearly
              <span className="text-xs ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-gray-600 mb-6">Essential Bible study tools</p>
            <p className="text-3xl font-bold text-gray-900 mb-6">$0</p>
            <button disabled className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold mb-8 cursor-not-allowed">
              Your Current Plan
            </button>
            <div className="space-y-4">
              {features.slice(6).map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academy Plan */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg transform md:scale-105 relative z-10">
            <div className="absolute -top-4 left-6 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Academy Premium</h3>
            <p className="text-indigo-100 mb-6">Complete Christian education</p>
            
            <div className="mb-6">
              <p className="text-4xl font-bold text-white">
                {billingPeriod === 'monthly' ? '$9.99' : '$79.99'}
              </p>
              <p className="text-indigo-100 text-sm mt-2">
                {billingPeriod === 'monthly' ? 'per month' : 'per year (billed once)'}
              </p>
            </div>

            <Button
              onClick={() => handleCheckout(billingPeriod === 'monthly' ? 'academy_monthly' : 'academy_yearly')}
              disabled={isCheckingOut || isSubscribed}
              className="w-full bg-white text-indigo-600 hover:bg-gray-100 py-3 rounded-lg font-semibold mb-8"
            >
              {isCheckingOut ? 'Processing...' : isSubscribed ? 'Already Subscribed' : 'Subscribe Now'}
            </Button>

            {/* Auto-renew notice */}
            <div className="bg-white/20 rounded-lg p-4 mb-6 border border-white/30">
              <p className="text-white text-sm">
                <strong>Auto-renews</strong> at the end of each billing period.
                Cancel anytime in your device settings.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  {feature.academy ? (
                    <Check className="w-5 h-5 text-white flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-indigo-200 flex-shrink-0" />
                  )}
                  <span className="text-white">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Structured Courses</h4>
            <p className="text-gray-600 text-sm">
              Complete theology, Biblical leadership, and spiritual formation curricula.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI Study Tools</h4>
            <p className="text-gray-600 text-sm">
              Advanced commentary, sermon generation, and personalized study recommendations.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Certification</h4>
            <p className="text-gray-600 text-sm">
              Earn verifiable completion certificates recognized by the faith community.
            </p>
          </div>
        </div>

        {/* Legal & Management */}
        <div className="bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Subscription Management</h3>
          
          <div className="space-y-3 mb-6 text-sm text-gray-700">
            <p>
              <strong>Restore Purchases (iOS):</strong> If you've purchased on another device,{' '}
              <button className="text-indigo-600 hover:underline font-semibold" onClick={() => alert('Restore feature - contact support@faithlight.com')}>
                restore your subscription
              </button>.
            </p>
            <p>
              <strong>Cancel Anytime:</strong> Go to your device settings under Subscriptions and cancel. No refunds for partial months.
            </p>
            <p>
              <strong>Auto-Renew:</strong> Subscriptions automatically renew unless cancelled before the renewal date.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <Link to={createPageUrl('PrivacyPolicy')}>
              <Button variant="ghost" className="w-full">Privacy Policy</Button>
            </Link>
            <Link to={createPageUrl('TermsOfService')}>
              <Button variant="ghost" className="w-full">Terms of Service</Button>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked</h3>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change plans?',
                a: 'Yes. You can switch between monthly and yearly at any time. Changes take effect on your next renewal date.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards through Stripe, and in-app purchases through Apple App Store and Google Play Store.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Contact support@faithlight.com to ask about trial periods. We may offer limited trial access.',
              },
              {
                q: 'What if I have billing issues?',
                a: 'Email support@faithlight.com with your subscription details and we\'ll help resolve it within 24 hours.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder for i18n
function useI18n() {
  return { t: (key, def) => def };
}