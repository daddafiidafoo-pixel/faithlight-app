import React, { useState } from 'react';
import { Share2, Mail, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SermonSharer({ sermon, title, isDarkMode }) {
  const [copied, setCopied] = useState(false);

  const shareText = `Check out this sermon: "${title}"\n\n${sermon?.slice(0, 200)}...`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Sermon: ${title}`);
    const body = encodeURIComponent(`I wanted to share this sermon with you:\n\n${title}\n\n${sermon?.slice(0, 300)}\n\nCheck the full content at: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`📖 Sermon: ${title}\n\n${sermon?.slice(0, 200)}...\n\nRead more at: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFacebook = () => {
    const text = encodeURIComponent(`I'm reading a great sermon: "${title}"`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`📖 Just read an amazing sermon: "${title}" #faith #sermon`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const bgColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';

  return (
    <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: bgColor, borderColor }}>
      <div className="flex items-center gap-2 mb-3">
        <Share2 size={18} style={{ color: '#6C5CE7' }} />
        <h3 className="font-semibold text-sm" style={{ color: textColor }}>Share Sermon</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleEmail}
          className="text-xs flex items-center justify-center gap-1"
          style={{ borderColor }}
        >
          <Mail size={14} />
          Email
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleWhatsApp}
          className="text-xs flex items-center justify-center gap-1"
          style={{ borderColor }}
        >
          <MessageCircle size={14} />
          WhatsApp
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleFacebook}
          className="text-xs flex items-center justify-center gap-1"
          style={{ borderColor }}
        >
          f
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleTwitter}
          className="text-xs flex items-center justify-center gap-1"
          style={{ borderColor }}
        >
          𝕏
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          className="text-xs flex items-center justify-center gap-1 col-span-2"
          style={{ borderColor }}
        >
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );
}