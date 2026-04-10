import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Share2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { logEvent, Events } from '@/components/services/analytics/eventLogger';

const SOCIAL_PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '𝕏',
    color: '#000000',
    shareUrl: (text, verseRef) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`https://faithlight.app/verse/${verseRef}`)}`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    shareUrl: (text, verseRef) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://faithlight.app/verse/${verseRef}`)}&quote=${encodeURIComponent(text)}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    shareUrl: (text, verseRef) => `https://wa.me/?text=${encodeURIComponent(`${text} - ${verseRef} https://faithlight.app/verse/${verseRef}`)}`
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: '#0088cc',
    shareUrl: (text, verseRef) => `https://t.me/share/url?url=${encodeURIComponent(`https://faithlight.app/verse/${verseRef}`)}&text=${encodeURIComponent(text)}`
  },
  {
    id: 'email',
    name: 'Email',
    icon: '✉️',
    color: '#EA4335',
    shareUrl: (text, verseRef) => `mailto:?subject=${encodeURIComponent(`Bible Verse: ${verseRef}`)}&body=${encodeURIComponent(`${text}\n\n${verseRef}\n\nhttps://faithlight.app/verse/${verseRef}`)}`
  }
];

export default function VerseSharer({ 
  verseText, 
  verseRef, 
  isDarkMode, 
  readingProgress,
  book,
  chapter
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const handleCopyVerse = async () => {
    try {
      const textToCopy = `"${verseText}" - ${verseRef}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Verse copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy verse');
    }
  };

  const handleSharePlatform = (platform) => {
    const shareUrl = platform.shareUrl(verseText, verseRef);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    logEvent(Events.VERSE_SHARED, { platform: platform.id, verseRef, book, chapter });
    toast.success(`Sharing to ${platform.name}...`);
  };

  const handleShareProgress = () => {
    const progressText = `I'm reading through FaithLight! Currently at ${book} ${chapter}. Join me on my Bible journey! 📖 https://faithlight.app`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(progressText)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bible Verse: ${verseRef}`,
          text: `"${verseText}" - ${verseRef}`,
          url: `https://faithlight.app/verse/${verseRef}`
        });
        logEvent(Events.VERSE_SHARED, { platform: 'native', verseRef, book, chapter });
        toast.success('Verse shared!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Share failed');
        }
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyVerse}
          className="gap-2"
          style={{ borderColor, color: primaryColor }}
          title="Copy verse to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShareModal(true)}
          className="gap-2"
          style={{ borderColor, color: primaryColor }}
          title="Share verse on social media"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        {navigator.share && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="gap-2"
            style={{ borderColor, color: primaryColor }}
            title="Share using device options"
          >
            📤 More
          </Button>
        )}
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-2xl" style={{ backgroundColor: cardColor }}>
          <DialogHeader>
            <DialogTitle style={{ color: textColor }}>Share This Verse</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Verse Preview */}
            <Card style={{ backgroundColor: bgColor, borderColor }}>
              <CardContent className="pt-4">
                <p className="text-sm italic mb-2" style={{ color: textColor }}>
                  "{verseText}"
                </p>
                <p className="text-xs font-semibold" style={{ color: primaryColor }}>
                  {verseRef}
                </p>
              </CardContent>
            </Card>

            {/* Social Media Options */}
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: textColor }}>
                Share on Social Media
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map(platform => (
                  <Button
                    key={platform.id}
                    onClick={() => handleSharePlatform(platform)}
                    className="gap-2 h-10"
                    style={{
                      backgroundColor: platform.color,
                      color: '#FFFFFF'
                    }}
                  >
                    <span>{platform.icon}</span>
                    {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Copy Verse */}
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: textColor }}>
                Copy Verse
              </h4>
              <Button
                onClick={handleCopyVerse}
                className="w-full gap-2"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied to Clipboard!' : 'Copy Full Verse'}
              </Button>
            </div>

            {/* Share Progress */}
            {book && chapter && (
              <div>
                <h4 className="text-sm font-semibold mb-3" style={{ color: textColor }}>
                  Share Your Progress
                </h4>
                <Button
                  onClick={handleShareProgress}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#1DA1F2', color: '#FFFFFF' }}
                >
                  📖 Share Reading Progress
                </Button>
                <p className="text-xs mt-2" style={{ color: mutedColor }}>
                  Let friends know you're reading through the Bible on FaithLight!
                </p>
              </div>
            )}

            {/* Share Link */}
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: textColor }}>
                Share Link
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://faithlight.app/verse/${verseRef}`}
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: bgColor,
                    borderColor,
                    color: textColor,
                    border: `1px solid ${borderColor}`
                  }}
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://faithlight.app/verse/${verseRef}`);
                    toast.success('Link copied!');
                  }}
                  size="sm"
                  style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShowShareModal(false)}
              variant="outline"
              className="w-full"
              style={{ borderColor, color: textColor }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}