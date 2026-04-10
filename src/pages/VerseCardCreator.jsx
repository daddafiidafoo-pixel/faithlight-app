import React from 'react';
import VerseCardStudio from '@/components/verse/VerseCardStudio';

export default function VerseCardCreator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">✨ Verse Card Studio</h1>
          <p className="text-gray-500 text-sm">
            Create beautiful, shareable Bible verse cards with AI-powered verse discovery and custom themes.
          </p>
        </div>
        <VerseCardStudio />
      </div>
    </div>
  );
}