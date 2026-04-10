import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Zap, Loader2, Heart, Users, BookOpen, Headphones, Brain, ShieldCheck, Star } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

const PREMIUM_PRICE_ID = 'price_1QvvvvERz8x8zxzxzxzxzxzx';

const REGIONAL_PRICING = {
  developing_monthly: 1.99,
  developing_yearly: 14.99,
  developed_monthly: 4.99,
  developed_yearly: 39.99,
};

const DONATION_AMOUNTS = [2.99, 4.99, 9.99];

export default function Pricing() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donating, setDonating] = useState(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        try {
          const res = await base44.functions.invoke('checkPremium');
          if (res?.data?.isPremium) setIsPremium(true);
        } catch {}
      }
    };
    checkAuth();
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled')) setCanceled(true);
  }, []);

  const handleSubscribe = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('stripe_createCheckoutSession', { priceId: PREMIUM_PRICE_ID });
      if (res?.data?.url) {
        if (window.self !== window.top) {
          alert(t('pricing.checkoutExternalOnly', 'Checkout works only from the published app. Please use your device browser.'));
          setLoading(false); return;
        }
        window.open(res.data.url, '_blank');
      } else {
        alert(t('pricing.checkoutFailed', 'Failed to start checkout. Please try again.'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(t('pricing.checkoutFailed', 'Failed to start checkout. Please try again.'));
    } finally { setLoading(false); }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('stripe_createPortalSession', {});
      if (res?.data?.url) window.location.href = res.data.url;
    } catch { alert('Failed to open billing portal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10 pb-24">

        {/* ── Alerts ── */}
        {canceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 text-sm text-center">
            {t('pricing.canceledMsg', 'Checkout was canceled. No charges were made.')}
          </div>
        )}
        {isPremium && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm text-center font-semibold">
            ✓ {t('pricing.premiumStatus', 'You are a Premium member. Thank you for supporting FaithLight!')}
          </div>
        )}

        {/* ── 1. HERO / MISSION ── */}
        <div
          className="rounded-3xl p-8 mb-8 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 60%, #7C3AED 100%)' }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            <BookOpen className="absolute top-6 left-6 w-24 h-24 rotate-12" />
            <BookOpen className="absolute bottom-4 right-4 w-16 h-16 -rotate-12" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">✦ FaithLight Plus</p>
            <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
              {t('pricing.heroTitle', 'Deepen your journey\nwith God\'s Word')}
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-sm mx-auto mb-2">
              {t('pricing.heroDesc1', 'FaithLight is free so everyone can access the Bible.')}
            </p>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-sm mx-auto mb-7">
              {t('pricing.heroDesc2', 'Premium members help us build better study tools and keep Scripture accessible worldwide.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-2xl text-sm shadow-lg"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t('pricing.startFreeTrial', '🎁 Start 7-Day Free Trial')}
              </Button>
              <button
                onClick={() => document.getElementById('pricing-free')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-indigo-200 hover:text-white text-sm underline underline-offset-2 transition-colors py-1"
              >
                {t('pricing.continueFree', 'Continue with Free Version')}
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. FEATURE BENEFITS ── */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-5">
            {t('pricing.whyUpgrade', 'Why Upgrade?')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                color: 'bg-indigo-100 text-indigo-600',
                title: t('pricing.benefit1Title', 'Advanced Bible Study'),
                desc: t('pricing.benefit1Desc', 'AI explanations and deeper insights into every verse.'),
              },
              {
                icon: Headphones,
                color: 'bg-emerald-100 text-emerald-600',
                title: t('pricing.benefit2Title', 'Offline Audio Bible'),
                desc: t('pricing.benefit2Desc', 'Listen anywhere, anytime — no internet needed.'),
              },
              {
                icon: Brain,
                color: 'bg-purple-100 text-purple-600',
                title: t('pricing.benefit3Title', 'AI Study Tools'),
                desc: t('pricing.benefit3Desc', 'Generate sermons, devotionals, and prayer guides.'),
              },
            ].map((b, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                <div className={`w-10 h-10 rounded-2xl ${b.color} flex items-center justify-center mx-auto mb-3`}>
                  <b.icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-gray-800 text-sm mb-1">{b.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. PREMIUM PLAN (highlighted) ── */}
        <div className="rounded-3xl border-2 border-indigo-600 bg-gradient-to-b from-indigo-50 to-white shadow-xl p-7 mb-4 relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-5 py-1.5 rounded-full flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-white" /> {t('pricing.mostPopular', 'MOST POPULAR')}
          </div>
          <div className="text-center mb-6 pt-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">FaithLight Plus</h2>
            <p className="text-xs text-gray-500 mb-3">{t('pricing.startingFrom', 'Starting from')}</p>
            <p className="text-5xl font-bold text-indigo-600">${REGIONAL_PRICING.developing_monthly}
              <span className="text-base font-normal text-gray-400"> / {t('pricing.month', 'mo')}</span>
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-1">{t('pricing.regionalNote', 'Regional pricing applies')}</p>
          </div>
          <ul className="space-y-3 mb-7">
            {[
              t('pricing.everythingFree', 'Everything in Free'),
              t('pricing.unlimitedOffline', 'Offline Bible downloads'),
              t('pricing.advancedAI', 'AI verse explanations'),
              t('pricing.sermonBuilders', 'AI Sermon Builder'),
              t('pricing.adFreePlan', 'Ad-free experience'),
              t('pricing.prioritySupport', 'Priority support'),
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700 text-sm">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-indigo-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <Button onClick={handleManageSubscription} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold py-3">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('pricing.manageSubscription', 'Manage Subscription')}
            </Button>
          ) : (
            <Button onClick={handleSubscribe} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold py-3 text-base">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('pricing.startTrial', '🎁 Start 7-Day Free Trial')}
            </Button>
          )}
          <p className="text-xs text-gray-400 text-center mt-2">
            {t('pricing.cancelAnytime', 'Cancel anytime. No commitment.')}
          </p>
        </div>

        {/* ── 4. FREE PLAN ── */}
        <div id="pricing-free" className="rounded-3xl border border-gray-200 bg-white p-7 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Free</h2>
              <p className="text-xs text-gray-400">{t('pricing.freeDesc', 'Forever free — no credit card needed')}</p>
            </div>
            <p className="text-3xl font-bold text-gray-700">$0</p>
          </div>
          <ul className="space-y-2.5 mb-6">
            {[
              t('pricing.readBible', 'Bible reading'),
              t('pricing.basicSearch', 'Verse search'),
              t('pricing.dailyVerse', 'Daily verse'),
              t('pricing.communityAccess', 'Community access'),
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                <Check className="w-4 h-4 text-gray-400 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full rounded-2xl font-semibold"
            onClick={() => window.history.back()}
          >
            {t('pricing.continueFreeBtn', 'Continue Free')}
          </Button>
        </div>

        {/* ── 5. DONATION SECTION ── */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-7 mb-8 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('pricing.supportTitle', 'Support the Mission')}</h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto mb-6">
            {t('pricing.supportDesc', 'FaithLight is a ministry-driven project. If you would like to support Bible access worldwide, you can donate.')}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {DONATION_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                onClick={handleSubscribe}
                variant="outline"
                className="border-amber-400 text-amber-700 hover:bg-amber-100 font-bold px-6 rounded-2xl"
              >
                {t('pricing.support', 'Support')} ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* ── 6. TRUST SECTION ── */}
        <div className="bg-gray-50 rounded-3xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 justify-center mb-5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('pricing.trustTitle', 'Our Promises')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🚫', text: t('pricing.trust1', 'No ads') },
              { emoji: '❌', text: t('pricing.trust2', 'Cancel anytime') },
              { emoji: '📖', text: t('pricing.trust3', 'Bible always free') },
              { emoji: '🔒', text: t('pricing.trust4', 'Secure payments') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                <span className="text-lg">{item.emoji}</span>
                <p className="text-sm font-semibold text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. SOCIAL PROOF ── */}
        <div className="text-center py-4 mb-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-6 py-3 mb-3">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-700">
              {t('pricing.socialProof', 'Join 10,000+ believers studying the Bible daily with FaithLight')}
            </span>
          </div>
          <p className="text-xs text-gray-400 italic">
            {t('pricing.footerMission', '"Your word is a lamp to my feet and a light to my path." — Psalm 119:105')}
          </p>
        </div>

        {/* Sign in prompt */}
        {!user && (
          <div className="bg-white border border-indigo-100 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-gray-600 text-sm mb-4">{t('pricing.signInPrompt', 'Ready to upgrade? Sign in to your account first.')}</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl">
              {t('pricing.signInButton', 'Sign In to Continue')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}