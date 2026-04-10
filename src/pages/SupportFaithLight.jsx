import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [3, 5, 10];

const LANG_COPY = {
  en: {
    title: 'Support FaithLight 🙏',
    subtitle: "Help us bring God's Word to more people in their language.",
    once: 'One-time Gift',
    monthly: 'Monthly Support',
    custom: 'Custom amount',
    cta: 'Give Now',
    processing: 'Processing...',
    thanks: 'Thank you for your generosity!',
  },
  om: {
    title: 'FaithLight deeggari 🙏',
    subtitle: 'Ergaa Waaqayyoo namoota hedduutti akka gahu nu gargaari.',
    once: 'Kaffaltii Yeroo Tokkoo',
    monthly: 'Deeggarsa Ji\'aa',
    custom: 'Baasii filannoo',
    cta: 'Kenni Amma',
    processing: 'Ilaalamaa...',
    thanks: 'Gaalatoomaa!',
  },
  am: {
    title: 'FaithLightን ይደግፉ 🙏',
    subtitle: 'የእግዚአብሔር ቃል ወደ ብዙ ሰዎች እንዲደርስ ያግዙን።',
    once: 'አንድ ጊዜ ስጦታ',
    monthly: 'ወርሃዊ ድጋፍ',
    custom: 'ብጁ መጠን',
    cta: 'አሁን ስጡ',
    processing: 'በመስራት ላይ...',
    thanks: 'አመሰግናለሁ!',
  },
};

export default function SupportFaithLight() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(5);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [isIframe] = useState(() => window !== window.parent);

  const lang = localStorage.getItem('faithlight_ui_language') || 'en';
  const t = LANG_COPY[lang] || LANG_COPY.en;

  const effectiveAmount = custom ? parseFloat(custom) : selected;

  const handleDonate = async () => {
    if (isIframe) {
      toast.error('Checkout works only from the published app');
      return;
    }
    if (!effectiveAmount || effectiveAmount < 1) {
      toast.error('Please enter a valid amount (min $1)');
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke('stripeDonationCheckout', {
        amount: selected,
        customAmount: custom ? parseFloat(custom) : null,
        origin: window.location.origin,
      });
      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Could not start checkout');
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-5 pt-12 pb-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-indigo-200 text-sm max-w-xs mx-auto leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6">
        {/* Impact Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Impact</p>
          {[
            { amount: '$3', desc: 'Funds one day of scripture translations' },
            { amount: '$5', desc: 'Helps reach a new language community' },
            { amount: '$10', desc: 'Supports AI devotionals for a whole village' },
          ].map(item => (
            <div key={item.amount} className="flex items-center gap-3 mb-2 last:mb-0">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-indigo-600" strokeWidth={3} />
              </div>
              <span className="text-sm text-gray-700"><strong>{item.amount}</strong> — {item.desc}</span>
            </div>
          ))}
        </div>

        {/* Amount Picker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.once}</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRESET_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => { setSelected(amt); setCustom(''); }}
                className={`py-3 rounded-xl font-bold text-base border-2 transition-all ${
                  selected === amt && !custom
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              type="number"
              placeholder={t.custom}
              value={custom}
              onChange={e => { setCustom(e.target.value); setSelected(null); }}
              min="1"
              className="w-full pl-7 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {isIframe && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Checkout works only from the published app, not in preview.</p>
          </div>
        )}

        <button
          onClick={handleDonate}
          disabled={loading || isIframe || !effectiveAmount}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98] transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t.processing : `${t.cta} — $${effectiveAmount || '—'}`}
        </button>

        <p className="text-center text-xs text-gray-400 mb-6">Secure Stripe checkout · No account required</p>

        {/* Also upgrade */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-indigo-800 mb-1">Want ongoing access?</p>
          <p className="text-xs text-indigo-600 mb-3">Premium is just $4.99/month — supports the mission too.</p>
          <button
            onClick={() => navigate('/SubscriptionPage')}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            View Premium Plans
          </button>
        </div>
      </div>
    </div>
  );
}