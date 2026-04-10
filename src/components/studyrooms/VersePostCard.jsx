import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Share2, Bookmark } from 'lucide-react';

export default function VersePostCard({ verse, userName, onSave, onShare }) {
  return (
    <Card className="p-4 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Reference + Author */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-indigo-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {verse.reference}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{verse.language} · shared by {userName}</p>
          </div>
        </div>

        {/* Verse text */}
        <p className="text-sm italic text-gray-800 leading-relaxed bg-indigo-50 rounded-lg px-4 py-3 border border-indigo-100">
          "{verse.verseText}"
        </p>

        {/* Note */}
        {verse.note && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-900 leading-relaxed">{verse.note}</p>
          </div>
        )}

        {/* Actions */}
        {(onSave || onShare) && (
          <div className="flex gap-2 pt-1">
            {onSave && (
              <Button size="sm" variant="outline" onClick={onSave} className="flex-1 gap-1.5 h-7 text-xs">
                <Bookmark className="w-3 h-3" /> Save
              </Button>
            )}
            {onShare && (
              <Button size="sm" variant="outline" onClick={onShare} className="flex-1 gap-1.5 h-7 text-xs">
                <Share2 className="w-3 h-3" /> Share
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}