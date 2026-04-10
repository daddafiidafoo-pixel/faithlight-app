import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '../I18nProvider';

export default function PremiumGate({ isPremium, isLoading, children, featureName }) {
  const { lang } = useI18n();

  if (isLoading) {
    return (
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    );
  }

  if (isPremium) {
    return children;
  }

  const lockText = lang === 'om'
    ? 'Tajaajila Premium dha. Fooyyessi itti fayyadamuuf.'
    : 'Premium feature. Upgrade to unlock.';

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 text-center max-w-xs">
            <Lock className="w-8 h-8 mx-auto mb-3 text-[var(--faith-light-primary)]" />
            <p className="font-medium text-gray-900 mb-2">{featureName || 'Premium Feature'}</p>
            <p className="text-sm text-gray-600">{lockText}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PremiumBadge({ isPremium, compact = false }) {
  const { lang } = useI18n();

  if (isPremium) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--faith-light-accent)] text-[var(--faith-light-primary-dark)] ${compact ? 'text-xs' : 'text-sm'} font-semibold`}>
      <Lock className="w-3.5 h-3.5" />
      {lang === 'om' ? 'Premium' : 'Premium'}
    </div>
  );
}