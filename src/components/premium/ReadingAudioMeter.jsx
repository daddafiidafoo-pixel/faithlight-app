import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';
import { Clock, AlertCircle } from 'lucide-react';

/**
 * ReadingAudioMeter
 * 
 * Shows reading/audio time usage for the day
 * Displays both in minutes/seconds
 */
export default function ReadingAudioMeter({
  type, // 'reading' | 'audio'
  showWarningAt = 0.8, // Show warning at 80%
}) {
  const { t } = useI18n();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const LIMIT_SECONDS = 1800; // 30 minutes
  const LIMIT_MINUTES = 30;

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (!isAuth) { setLoading(false); return; }
        const response = await base44.functions.invoke('checkFeatureAccess', {
          featureKey: type === 'reading' ? 'bible.read_minutes' : 'audio.stream_minutes',
        });
        setUsage(response);
      } catch (err) {
        console.error('Usage check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkUsage();
  }, [type]);

  if (loading || !usage || usage.isPremium) {
    return null;
  }

  const { used, limit } = usage;
  const usedMinutes = Math.floor(used / 60);
  const usedSeconds = used % 60;
  const limitMinutes = Math.floor(limit / 60);
  const percent = Math.min((used / limit) * 100, 100);
  const isWarning = percent >= (showWarningAt * 100);
  const isExhausted = percent >= 100;

  const getLabel = () => {
    if (type === 'reading') {
      return t('meter.readingToday', 'Reading Today');
    }
    return t('meter.audioToday', 'Audio Today');
  };

  const displayTime = `${usedMinutes}:${String(usedSeconds).padStart(2, '0')}`;
  const displayLimit = `${limitMinutes}`;

  return (
    <div
      className={`space-y-1.5 p-2.5 rounded-lg text-xs ${
        isExhausted
          ? 'bg-red-50 border border-red-200'
          : isWarning
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-blue-50 border border-blue-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${
            isExhausted ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-blue-600'
          }`} />
          <span className="font-medium text-gray-900">{getLabel()}</span>
        </div>
        <span className={`font-semibold ${
          isExhausted ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-blue-700'
        }`}>
          {displayTime} / {displayLimit} min
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all ${
            isExhausted ? 'bg-red-600' : isWarning ? 'bg-amber-600' : 'bg-blue-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {isWarning && !isExhausted && (
        <div className="flex items-start gap-1 pt-1">
          <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.25" />
          <span className="text-amber-700">
            {t('meter.warningMsg', 'Upgrade for unlimited access')}
          </span>
        </div>
      )}

      {isExhausted && (
        <div className="flex items-start gap-1 pt-1">
          <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.25" />
          <span className="text-red-700">
            {t('meter.limitReachedMsg', 'Daily limit reached. Resets at midnight.')}
          </span>
        </div>
      )}
    </div>
  );
}