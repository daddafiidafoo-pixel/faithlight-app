import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * AIDisclaimer: Reusable component for showing AI content warnings
 * Place above any AI-generated content
 * Apple requires visible disclaimers for AI outputs
 */
export function AIDisclaimer({ variant = 'default' }) {
  const disclaimerText = "AI-generated content may contain errors. Always verify with Scripture.";

  if (variant === 'minimal') {
    return (
      <p className="text-xs text-gray-500 italic px-2 py-1 border-l-2 border-gray-300">
        {disclaimerText}
      </p>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> {disclaimerText}
          </p>
        </div>
      </div>
    );
  }

  // default: inline banner
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-4">
      <div className="flex gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">
          {disclaimerText}
        </p>
      </div>
    </div>
  );
}

/**
 * AIDisclaimerInline: For compact inline placement
 */
export function AIDisclaimerInline() {
  return (
    <p className="text-xs text-gray-500 mt-2">
      ✓ <em>AI may contain errors. Always verify with Scripture.</em>
    </p>
  );
}