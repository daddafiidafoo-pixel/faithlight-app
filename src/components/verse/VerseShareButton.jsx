import React, { useState } from 'react';
import { Share2, Copy, MessageCircle, Facebook, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  copyVerseToClipboard,
  getWhatsAppShareUrl,
  getFacebookShareUrl,
  shareNative,
  isNativeShareAvailable,
  generateVerseImage,
  downloadVerseImage,
} from '@/lib/verseShareUtils';
import VerseShareCard from './VerseShareCard';

/**
 * VerseShareButton
 * Share verse via copy, native share, WhatsApp, Facebook, or download image
 */
export default function VerseShareButton({ verseText, reference }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const result = await copyVerseToClipboard(verseText, reference);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    await shareNative(verseText, reference);
  };

  const handleWhatsApp = () => {
    window.open(getWhatsAppShareUrl(verseText, reference), '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    window.open(getFacebookShareUrl(reference), '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const imageResult = await generateVerseImage(verseText, reference);
      if (imageResult.success) {
        downloadVerseImage(imageResult.blob, reference);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Hidden card for image generation */}
      <VerseShareCard verseText={verseText} reference={reference} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-label="Share verse"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {/* Copy to clipboard */}
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </DropdownMenuItem>

          {/* Native share (mobile-first) */}
          {isNativeShareAvailable() && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
          )}

          {/* WhatsApp */}
          <DropdownMenuItem onClick={handleWhatsApp}>
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </DropdownMenuItem>

          {/* Facebook */}
          <DropdownMenuItem onClick={handleFacebook}>
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </DropdownMenuItem>

          {/* Download image */}
          <DropdownMenuItem onClick={handleDownloadImage} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                <span>Download Image</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}