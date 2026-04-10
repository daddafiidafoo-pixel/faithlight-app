/**
 * TrialExpiredBanner
 * Shown when subscriptionStatus === 'EXPIRED'
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrialExpiredBanner({ onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800 font-medium">
            Your Premium trial ended.{' '}
            <span className="text-red-600">Continue for $10/month or save 20% yearly.</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to={createPageUrl('UpgradePremium')}>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              Reactivate Premium
            </Button>
          </Link>
          <button onClick={() => { setDismissed(true); onDismiss?.(); }} className="text-red-400 hover:text-red-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}