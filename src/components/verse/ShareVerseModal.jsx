import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Copy, X } from 'lucide-react';
import VerseImageGenerator from './VerseImageGenerator';

export default function ShareVerseModal({ open, onOpenChange, verse, reference }) {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `verse-${reference.replace(/[:\s]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedImage) return;

    try {
      const blob = await fetch(generatedImage).then((r) => r.blob());
      const file = new File([blob], `verse-${reference}.png`, {
        type: 'image/png',
      });

      if (navigator.share) {
        await navigator.share({
          title: 'Bible Verse',
          text: `"${verse}" - ${reference}`,
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleCopyLink = async () => {
    const text = `"${verse}" - ${reference}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share This Verse</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Verse Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-lg font-serif italic text-gray-800">"{verse}"</p>
            <p className="text-sm text-gray-600 mt-2">— {reference}</p>
          </div>

          {/* Image Generator */}
          <div className="flex justify-center">
            <VerseImageGenerator
              verse={verse}
              reference={reference}
              onGenerated={setGeneratedImage}
            />
          </div>

          {/* Action Buttons */}
          {generatedImage && (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleShare}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Copied!' : 'Share'}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Text
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}