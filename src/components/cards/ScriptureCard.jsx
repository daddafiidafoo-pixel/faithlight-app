import React from 'react';
import { Bookmark, Share2, Volume2 } from 'lucide-react';

export default function ScriptureCard({
  reference,
  verseText,
  explanation,
  reflection,
  prayer,
  onBookmark,
  onShare,
  onListen,
  onUnderstand,
  children
}) {
  return (
    <div className="verse-card">
      {/* Main Content - Unified spacing (20–24px padding) */}
      <div>
        {/* Verse Reference - Section heading hierarchy */}
        <h2 className="text-purple-700 font-semibold text-sm uppercase tracking-wide mb-3">
          {reference}
        </h2>

        {/* Verse Text - Centerpiece (largest element) */}
        <p className="text-gray-900 text-lg md:text-xl leading-relaxed italic font-medium mb-6">
          "{verseText}"
        </p>

        {/* Explanation Section */}
        {explanation && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="card-section-title">Explanation</h3>
            <p className="card-section-content">{explanation}</p>
          </div>
        )}

        {/* Reflection Section */}
        {reflection && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="card-section-title">Reflection</h3>
            <p className="card-section-content">{reflection}</p>
          </div>
        )}

        {/* Prayer Section */}
        {prayer && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <h3 className="card-section-title">Prayer</h3>
            <p className="text-gray-700 text-base leading-relaxed italic">"{prayer}"</p>
          </div>
        )}

        {/* Custom Children */}
        {children}
      </div>

      {/* Action Bar - Minimal, consistent styling */}
      <div className="card-actions border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 mt-6 px-6 py-3 rounded-b-lg justify-start gap-2">
        {onBookmark && (
          <button
            onClick={onBookmark}
            className="card-action-button"
            title="Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="card-action-button"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
        {onListen && (
          <button
            onClick={onListen}
            className="card-action-button"
            title="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
        {onUnderstand && (
          <button
            onClick={onUnderstand}
            className="ml-auto px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-semibold"
          >
            ✨ Understand
          </button>
        )}
      </div>
    </div>
  );
}