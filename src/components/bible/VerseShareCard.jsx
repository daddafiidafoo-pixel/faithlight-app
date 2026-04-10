import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function VerseShareCard({ reference, verseText, language, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${reference}\n${verseText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('verse-card-preview');
    if (element) {
      const canvas = await html2canvas(element, { backgroundColor: '#FFFFFF' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = `${reference.replace(/\s+/g, '-')}.png`;
      link.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Verse</DialogTitle>
        </DialogHeader>

        <div
          id="verse-card-preview"
          className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 space-y-4"
        >
          <div className="flex items-center gap-2 text-indigo-600">
            <Heart className="w-4 h-4 fill-indigo-600" />
            <span className="text-sm font-semibold">Verse of the Day</span>
          </div>

          <p className="text-2xl font-bold text-gray-900 leading-relaxed">{verseText}</p>

          <p className="text-lg font-semibold text-indigo-700">{reference}</p>

          <p className="text-xs text-gray-500">FaithLight - Growing in faith through scripture</p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 flex-1"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadImage}
            className="gap-2 flex-1"
          >
            <Share2 className="w-4 h-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}