import React from 'react';

/**
 * ScriptureCenteredLayout
 * 
 * Wrapper component that creates the premium "Scripture-First" layout pattern.
 * Applies consistent spacing, typography, and card styling across all content sections.
 * 
 * Usage:
 * <ScriptureCenteredLayout>
 *   <ScriptureCard ... />
 *   <DailyDevotionCardPremium ... />
 * </ScriptureCenteredLayout>
 */
export default function ScriptureCenteredLayout({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50 ${className}`}>
      {/* Premium container with generous padding */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Spacing and Card Grid */}
        <div className="space-y-6 md:space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}