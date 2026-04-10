import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FEATURES = [
  { icon: '📖', text: 'Unlimited Bible insights' },
  { icon: '🙏', text: 'Unlimited AI prayers' },
  { icon: '🎙', text: 'Unlimited sermon generation' },
  { icon: '💾', text: 'Save & download sermons' },
  { icon: '🌍', text: 'Multi-language support' },
];

export default function SubscriptionPage() {
  const [plan, setPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if running in iframe
    setIsIframe(window !== window.parent);
  }, []);

  const handleCheckout = async () => {
    // Block checkout in iframe
    if (isIframe) {
      toast.error('Checkout works only from the published app, not in preview');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        toast.error('Please log in to continue');
        return;
      }

      const response = await base44.functions.invoke('stripeCheckoutSession', {
        plan: plan,
      });

      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 px-5 pt-12 pb-10 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 right-5 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          aria-label="Close"
        >
          <X size={16} className="text-white" />
        </button>

        <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Star size={28} className="text-yellow-900 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Unlock FaithLight Premium ✨</h1>
        <p className="text-indigo-200 text-sm max-w-xs mx-auto">Grow deeper in faith with powerful tools designed for you.</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Features list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Everything in Premium</p>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center flex-shrink-0">{f.icon}</span>
                <span className="text-sm font-medium text-gray-800">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-violet-700 font-medium">❤️ Support this mission and help bring God's Word to more people 🙏</p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Check size={12} className="text-green-500" strokeWidth={3} />
            Bible reading always free — no paywall on God's Word
          </div>
        </div>

        {/* Plan selector */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setPlan('yearly')}
            className={`w-full rounded-2xl p-4 border-2 text-left transition-all relative ${plan === 'yearly' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}
            aria-pressed={plan === 'yearly'}
          >
            <span className="absolute top-3 right-3 text-xs font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">Best Value ⭐</span>
            <p className="font-bold text-gray-900 text-base">Yearly Plan</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">$29.99 <span className="text-sm font-medium text-gray-500">/ year</span></p>
            <p className="text-xs text-green-600 font-semibold mt-0.5">Save over 50%</p>
          </button>

          <button
            onClick={() => setPlan('monthly')}
            className={`w-full rounded-2xl p-4 border-2 text-left transition-all ${plan === 'monthly' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}
            aria-pressed={plan === 'monthly'}
          >
            <p className="font-bold text-gray-900 text-base">Monthly Plan</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">$4.99 <span className="text-sm font-medium text-gray-500">/ month</span></p>
          </button>
        </div>

        {/* Iframe warning */}
        {isIframe && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Checkout works only from the published app</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading || isIframe}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98] transition-transform mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Start Free Trial'}
        </button>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-4">
          <span>Cancel anytime</span>
          <span>·</span>
          <span>No commitment</span>
          <span>·</span>
          <span>Secure payment</span>
        </div>
      </div>
    </div>
  );
}