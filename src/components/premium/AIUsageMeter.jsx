import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Zap, Lock } from 'lucide-react';
import { useI18n } from '../I18nProvider';

/**
 * AIUsageMeter
 * 
 * Shows free tier AI usage meter before/after generation
 * Displays upgrade prompt when limit reached
 */
export default function AIUsageMeter({
  feature, // 'explanation' | 'study_plan' | 'sermon'
  onUpgradeClick,
  showAfterUse = false,
}) {
  const { t } = useI18n();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (!isAuth) { setLoading(false); return; }
        const response = await base44.functions.invoke('checkAIUsage', { feature });
        setUsage(response);
      } catch (err) {
        console.warn('Usage check error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    checkUsage();
  }, [feature]);

  if (loading || !usage) return null;

  // Premium users don't see meter
  if (usage.isPremium) {
    return null;
  }

  const { used, limit } = usage;
  const remaining = Math.max(0, limit - used);
  const percent = Math.min((used / limit) * 100, 100);

  const getFeatureName = () => {
    switch (feature) {
      case 'explanation':
        return t('ai.explanation', 'Bible Explanation');
      case 'study_plan':
        return t('ai.studyPlan', 'Study Plan');
      case 'sermon':
        return t('ai.sermon', 'Sermon Builder');
      default:
        return t('ai.feature', 'Feature');
    }
  };

  return (
    <div className={`space-y-2 p-3 rounded-lg ${
      remaining === 0 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
    }`}>
      <div className="flex items-start gap-2">
        <Zap className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
          remaining === 0 ? 'text-red-600' : 'text-amber-600'
        }`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {getFeatureName()}: {used} of {limit} {t('ai.daily', 'per day')}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full transition-all ${
                remaining === 0 ? 'bg-red-600' : 'bg-amber-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {remaining === 0 && (
        <div className="pt-2 border-t border-amber-200">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-900">
              <p className="font-medium">{t('ai.limitReached', 'Daily limit reached')}</p>
              <p>{t('ai.upgradeMsg', 'Upgrade to Premium for unlimited AI access')}</p>
            </div>
          </div>
          <Button
            onClick={onUpgradeClick}
            size="sm"
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1"
          >
            <Lock className="w-3 h-3" />
            {t('premium.upgrade', 'Upgrade to Premium')}
          </Button>
        </div>
      )}

      {remaining > 0 && remaining <= 1 && (
        <div className="pt-2 border-t border-amber-200">
          <p className="text-xs text-amber-900">
            {remaining === 1
              ? t('ai.oneLeft', 'You have 1 use left today')
              : t('ai.usesLeft', `You have ${remaining} uses left today`)}
          </p>
        </div>
      )}
    </div>
  );
}