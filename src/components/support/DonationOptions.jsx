import React, { useState } from 'react';
import { Heart, Calendar, RefreshCw, DollarSign, ChevronRight } from 'lucide-react';
import { useI18n } from '../I18nProvider';

const MONTHLY_AMOUNTS = [5, 10, 20];
const YEARLY_AMOUNTS = [50, 100, 200];
const CUSTOM_AMOUNTS = [10, 25, 50];

export default function DonationOptions({ onSelect }) {
  const { t } = useI18n();
  const [tab, setTab] = useState('monthly'); // monthly | yearly | custom
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const tabs = [
    { id: 'monthly', label: t('support.monthly', 'Monthly'), icon: RefreshCw },
    { id: 'yearly', label: t('support.yearly', 'Yearly'), icon: Calendar },
    { id: 'custom', label: t('support.custom', 'Custom'), icon: DollarSign },
  ];

  const presets = tab === 'monthly' ? MONTHLY_AMOUNTS : tab === 'yearly' ? YEARLY_AMOUNTS : CUSTOM_AMOUNTS;

  const handleProceed = () => {
    const amount = tab === 'custom' && customAmount
      ? parseFloat(customAmount)
      : selectedAmount;
    if (!amount || amount <= 0) return;
    onSelect({ support_type: tab, amount });
  };

  const effectiveAmount = tab === 'custom' && customAmount
    ? parseFloat(customAmount)
    : selectedAmount;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSelectedAmount(null); setCustomAmount(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === id
                ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {tab === 'monthly' && t('support.monthlyDesc', 'Recurring monthly support — cancel anytime.')}
        {tab === 'yearly' && t('support.yearlyDesc', 'Annual support at a discounted rate.')}
        {tab === 'custom' && t('support.customDesc', 'Choose any amount as a one-time gift.')}
      </p>

      {/* Preset amounts */}
      <div className="grid grid-cols-3 gap-3">
        {presets.map((amt) => (
          <button
            key={amt}
            onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
            className={`py-4 rounded-xl border-2 text-center font-bold text-lg transition-all ${
              selectedAmount === amt && !customAmount
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:border-indigo-300'
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Custom amount input */}
      {tab === 'custom' && (
        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t('support.orEnterCustom', 'Or enter a custom amount')}
          </label>
          <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 focus-within:border-indigo-500 transition-colors">
            <span className="px-4 text-gray-400 font-bold text-lg">$</span>
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              placeholder={t('support.enterAmount', 'Enter amount')}
              className="flex-1 py-3 pr-4 bg-transparent text-gray-800 dark:text-gray-200 text-lg font-semibold outline-none"
            />
          </div>
        </div>
      )}

      {/* Proceed button */}
      <button
        onClick={handleProceed}
        disabled={!effectiveAmount || effectiveAmount <= 0}
        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
          effectiveAmount && effectiveAmount > 0
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Heart className="w-4 h-4" />
        {effectiveAmount && effectiveAmount > 0
          ? `${t('support.supportWith', 'Support with')} $${effectiveAmount}${tab === 'monthly' ? '/mo' : tab === 'yearly' ? '/yr' : ''}`
          : t('support.selectAmount', 'Select an amount')
        }
        {effectiveAmount > 0 && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}