import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TextToSpeechButton from '@/components/audio/TextToSpeechButton';

export default function VerseCardRenderer({ verse, variant = 'verse-only' }) {
  const cardRef = useRef(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `verse-${verse.reference?.replace(/[^\w]/g, '-')}.png`;
      link.click();
      toast.success('Card downloaded');
    } catch (error) {
      toast.error('Failed to download card');
    }
  };

  const shareCard = async () => {
    const text = `${verse.reference || ''}\n\n${verse.verse_text || ''}\n\n${verse.reflection || verse.prayer || ''}`;
    if (navigator.share) {
      await navigator.share({
        title: 'FaithLight Verse',
        text,
      });
    } else {
      toast.info('Share feature not available');
    }
  };

  return (
    <div className="space-y-4">
      {/* Card preview */}
      <div
        ref={cardRef}
        className="w-full max-w-sm mx-auto aspect-[3/4] bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700 rounded-2xl p-8 flex flex-col justify-between shadow-2xl"
      >
        {/* Logo / Branding */}
        <div className="text-white text-sm font-semibold tracking-widest opacity-80">
          FAITHLIGHT
        </div>

        {/* Verse text */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <p className="text-2xl font-serif text-white leading-relaxed italic">
              "{verse.verse_text || 'Scripture'}"
            </p>
          </div>
        </div>

        {/* Reference */}
        <div className="space-y-4">
          <div className="text-center border-t border-white/20 pt-4">
            <p className="text-amber-300 font-semibold">{verse.reference || ''}</p>
          </div>

          {/* Variant-specific content */}
          {(variant === 'verse-reflection' || variant === 'verse-prayer') && (
            <div className="text-center text-white/90 text-sm italic">
              {variant === 'verse-reflection' && verse.reflection}
              {variant === 'verse-prayer' && verse.prayer}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-white/60 text-xs">
            FaithLight
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <TextToSpeechButton
          text={verse.verse_text}
          reference={verse.reference}
          variant="outline"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={downloadCard}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={shareCard}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
}