import React from 'react';
import { Share2, Bookmark } from 'lucide-react';

export default function DailyDevotionCardPremium({
  verse,
  title,
  explanation,
  reflectionQuestion,
  prayer,
  onShare,
  onBookmark,
  onReadMore
}) {
  return (
    <div className="devotion-card">
      {/* Header with Verse - subtle accent background */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 mb-4 -m-6 mb-4 rounded-t-lg border-b border-purple-100">
        <p className="text-purple-700 font-semibold text-sm uppercase tracking-wide mb-2">
          Today's Devotion
        </p>
        <p className="text-gray-600 text-sm mb-3">{verse}</p>
        <h2 className="text-gray-900 text-lg font-bold leading-tight">
          {title}
        </h2>
      </div>

      {/* Content - unified spacing */}
      <div className="px-6">
        {/* Explanation */}
        {explanation && (
          <div className="mb-4">
            <h3 className="card-section-title">Understanding</h3>
            <p className="card-section-content">{explanation}</p>
          </div>
        )}

        {/* Reflection Question */}
        {reflectionQuestion && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-4 border-l-4 border-yellow-400 border border-yellow-200">
            <p className="text-gray-700 text-sm leading-relaxed">
              <span className="font-semibold">Reflect:</span> {reflectionQuestion}
            </p>
          </div>
        )}

        {/* Prayer */}
        {prayer && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
            <h3 className="card-section-title">Prayer</h3>
            <p className="text-gray-700 text-base leading-relaxed italic">
              "{prayer}"
            </p>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="card-actions border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 mt-4 px-6 py-3 rounded-b-lg justify-between">
        <div className="flex gap-2">
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
        </div>
        {onReadMore && (
          <button
            onClick={onReadMore}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-semibold"
          >
            Read Full Devotion
          </button>
        )}
      </div>
    </div>
  );
}