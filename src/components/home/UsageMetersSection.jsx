import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';
import { Check } from 'lucide-react';

/**
 * UsageMetersSection
 * 
 * Shows daily usage meters for Bible reading, audio, and AI
 */
export default function UsageMetersSection({ isPremium }) {
  const { t } = useI18n();

  if (isPremium) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <Check className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {t('home.unlimitedAccess', 'Unlimited Access Active')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('home.unlimitedDesc', 'Enjoy all Bible, audio, and AI features without limits')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Free user: show meters
  return (
    <div className="space-y-3 mb-8">
      <h3 className="text-sm font-semibold text-gray-900 px-1">
        {t('home.usageToday', 'Today\'s Usage')}
      </h3>

      {/* Reading */}
      <MeterLine
        label={t('meter.readingToday', 'Reading')}
        used={18}
        limit={30}
        unit="min"
      />

      {/* Audio */}
      <MeterLine
        label={t('meter.audioToday', 'Audio')}
        used={22}
        limit={30}
        unit="min"
      />

      {/* AI */}
      <MeterLine
        label={t('ai.today', 'AI Used')}
        used={3}
        limit={5}
        unit="req"
      />
    </div>
  );
}

function MeterLine({ label, used, limit, unit }) {
  const percent = Math.min((used / limit) * 100, 100);
  const isWarning = percent >= 80;
  const isExhausted = percent >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className={`font-semibold ${
          isExhausted ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-gray-700'
        }`}>
          {used} / {limit} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${
            isExhausted ? 'bg-red-600' : isWarning ? 'bg-amber-600' : 'bg-blue-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}