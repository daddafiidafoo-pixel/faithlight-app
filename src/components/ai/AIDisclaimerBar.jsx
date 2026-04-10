import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AIDisclaimerBar({ language = 'en' }) {
  const isOm = language === 'om';
  return (
    <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
      <p className="text-xs text-amber-700">
        {isOm ? 'AI-wajjin yeroo—Kitaaba isaa eega.' : 'AI-generated content may contain errors. Always verify with Scripture.'}
      </p>
    </div>
  );
}