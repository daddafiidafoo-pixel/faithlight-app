import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function VerifiedBadge({ verification, size = 'sm' }) {
  if (!verification?.is_verified) return null;

  const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex items-center gap-1">
      <CheckCircle className={`${sizeClass} text-blue-600 flex-shrink-0`} />
      <span className={`${textSize} text-blue-600 font-medium`}>
        {verification.verified_label || 'Verified'}
      </span>
    </div>
  );
}