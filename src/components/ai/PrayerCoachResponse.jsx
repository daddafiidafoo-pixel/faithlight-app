import React from 'react';
import { Heart, BookOpen, Lightbulb, MessageCircle } from 'lucide-react';

export default function PrayerCoachResponse({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Explanation */}
      {data.explanation && (
        <div className="flex gap-3">
          <Heart className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Compassionate Reflection</h4>
            <p className="text-slate-700 text-sm mt-1 leading-relaxed">{data.explanation}</p>
          </div>
        </div>
      )}

      {/* Scripture */}
      {data.scripture && (
        <div className="flex gap-3">
          <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Scripture</h4>
            <p className="text-indigo-700 text-sm mt-1 font-medium">{data.scripture}</p>
          </div>
        </div>
      )}

      {/* Reflection */}
      {data.reflection && (
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Scripture-Based Encouragement</h4>
            <p className="text-slate-700 text-sm mt-1 leading-relaxed">{data.reflection}</p>
          </div>
        </div>
      )}

      {/* Prayer */}
      {data.prayer && (
        <div className="flex gap-3 bg-slate-50 rounded-lg p-3">
          <MessageCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Guided Prayer</h4>
            <p className="text-slate-700 text-sm mt-2 leading-relaxed italic">{data.prayer}</p>
          </div>
        </div>
      )}
    </div>
  );
}