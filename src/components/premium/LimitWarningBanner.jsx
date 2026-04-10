import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';
import { AlertCircle, X } from 'lucide-react';

/**
 * LimitWarningBanner
 * 
 * Shows when user reaches 80% of daily limit
 * Dismissible, soft conversion push
 */
export default function LimitWarningBanner({
  type, // 'reading' | 'audio'
  remaining, // minutes remaining
  onUpgradeClick,
}) {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || remaining > 6) {
    return null;
  }

  const getMessage = () => {
    if (type === 'reading') {
      return t('banner.readingWarning', `${remaining} minutes reading remaining today`);
    }
    return t('banner.audioWarning', `${remaining} minutes audio remaining today`);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-900 font-medium">{getMessage()}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onUpgradeClick}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 h-7 text-xs"
        >
          {t('premium.upgrade', 'Upgrade')}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}