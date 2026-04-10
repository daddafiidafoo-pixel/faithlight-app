import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { isStripeConfigured } from '@/components/billing/stripePriceMap';

export default function UpgradeButtonsGuard({ children, fallbackText = "Payments not configured" }) {
  if (!isStripeConfigured()) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900">Premium features coming soon</p>
          <p className="text-xs text-amber-700 mt-1">{fallbackText}</p>
        </div>
      </div>
    );
  }

  return children;
}