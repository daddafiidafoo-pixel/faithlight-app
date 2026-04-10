import React from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

export default function LoadingState({ 
  message, 
  size = 'md',
  variant = 'spinner' 
}) {
  const { t } = useI18n();
  const message_text = message || t('common.loading', 'Loading...');

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (variant === 'skeleton') {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600 mb-3`} />
      <p className="text-gray-600 text-sm">
        {message_text}
      </p>
    </div>
  );
}