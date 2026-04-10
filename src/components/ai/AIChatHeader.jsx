import React from 'react';
import { Sparkles } from 'lucide-react';
import AILanguageSelector from './AILanguageSelector';

export default function AIChatHeader({ aiLanguage, onLanguageChange, usage, tier }) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">FaithLight AI</h2>
          <p className="text-xs text-gray-400">Bible • Sermons • Study Plans</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <AILanguageSelector value={aiLanguage} onChange={onLanguageChange} />
        {tier === 'free' && usage && (
          <div className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
            {usage.used}/{usage.limit} today
          </div>
        )}
      </div>
    </div>
  );
}