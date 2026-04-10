import React from 'react';

export default function SermonOutlineDisplay({ outline }) {
  if (!outline) return null;

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-6">
      {/* Title */}
      {outline.title && (
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">{outline.title}</h2>
        </div>
      )}

      {/* Key Verse */}
      {outline.keyVerse && (
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4">
          <p className="font-semibold text-indigo-900">{outline.keyVerse}</p>
        </div>
      )}

      {/* Context */}
      {outline.context && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Historical Context</h3>
          <p className="text-slate-700 leading-relaxed">{outline.context}</p>
        </div>
      )}

      {/* Main Points */}
      {outline.mainPoints && outline.mainPoints.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Main Points</h3>
          <ol className="space-y-3">
            {outline.mainPoints.map((point, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 font-bold text-indigo-600 bg-indigo-100 w-6 h-6 flex items-center justify-center rounded-full text-sm">
                  {idx + 1}
                </span>
                <span className="text-slate-700">{point}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Application */}
      {outline.application && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Application Ideas</h3>
          <p className="text-slate-700 leading-relaxed">{outline.application}</p>
        </div>
      )}

      {/* Closing Prayer */}
      {outline.closingPrayer && (
        <div className="bg-slate-50 border-l-4 border-slate-400 p-4 italic">
          <p className="text-slate-700">{outline.closingPrayer}</p>
        </div>
      )}
    </div>
  );
}