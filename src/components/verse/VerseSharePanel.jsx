import React, { useState } from 'react';
import { X, Copy, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  copyToClipboard, 
  shareVerse, 
  getWhatsAppShareUrl,
  generateShareText 
} from '@/lib/verseShare';
import VerseCardGenerator from './VerseCardGenerator';

export default function VerseSharePanel({ verseReference, verseText, onClose }) {
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const handleCopy = async () => {
    const text = generateShareText(verseReference, verseText);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const success = await shareVerse(verseReference, verseText);
    if (!success) {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
        <div className="bg-white w-full md:max-w-md rounded-t-lg md:rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Share Verse</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">{verseReference}</p>
            <p className="text-sm text-slate-700 italic">{verseText}</p>
          </div>

          <div className="space-y-2 mb-6">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Native Share
            </Button>

            <Button
              onClick={() => setShowCard(true)}
              variant="outline"
              className="w-full justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Create Card
            </Button>

            <a
              href={getWhatsAppShareUrl(verseReference, verseText)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              WhatsApp
            </a>
          </div>

          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>

      {showCard && (
        <VerseCardGenerator
          verseReference={verseReference}
          verseText={verseText}
          onClose={() => setShowCard(false)}
        />
      )}
    </>
  );
}