import React, { useState } from 'react';
import { BookOpen, Share2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VerseReelGenerator from '../verse/VerseReelGenerator';

export default function DailyVerseCardWithReel({
  reference = 'John 3:16',
  verseText = 'For God so loved the world...',
  theme = 'Grace',
}) {
  const [showReelGenerator, setShowReelGenerator] = useState(false);
  const [reflection, setReflection] = useState('');

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        {/* Verse Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={20} className="text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-600">{theme}</h3>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{reference}</h2>
          </div>
        </div>

        {/* Verse Text */}
        <p className="text-lg text-gray-700 italic leading-relaxed mb-6">
          {verseText}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setShowReelGenerator(true)}
          >
            <Share2 size={16} />
            Create Verse Reel
          </Button>
        </div>
      </div>

      {/* Reel Generator Modal */}
      <Dialog open={showReelGenerator} onOpenChange={setShowReelGenerator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Verse Reel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{reference}</strong>
              </p>
              <p className="text-sm text-gray-700 italic">{verseText}</p>
            </div>

            <VerseReelGenerator
              reference={reference}
              verseText={verseText}
              reflection={reflection || 'Reflect on this verse in your life today.'}
            />

            <div className="text-xs text-gray-500 text-center">
              Generates a 15-second vertical video (9:16 aspect ratio) optimized for:
              <br />
              TikTok • Instagram Reels • YouTube Shorts
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}