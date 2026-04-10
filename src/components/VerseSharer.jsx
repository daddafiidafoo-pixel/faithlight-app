import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Mail, Link as LinkIcon, Twitter, Facebook, Copy, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const SHARE_THEMES = [
  { id: 'sage', name: 'Sage Garden', bg: 'linear-gradient(135deg, #6B8E6E 0%, #4A5F52 100%)', textColor: '#FFFFFF', accentColor: '#C9A24D' },
  { id: 'gold', name: 'Golden Hour', bg: 'linear-gradient(135deg, #C9A24D 0%, #A67C52 100%)', textColor: '#FFFFFF', accentColor: '#FFFFFF' },
  { id: 'serene', name: 'Serene Blue', bg: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)', textColor: '#FFFFFF', accentColor: '#FFD700' },
  { id: 'dawn', name: 'Dawn', bg: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)', textColor: '#FFFFFF', accentColor: '#FFFFFF' },
  { id: 'night', name: 'Night Sky', bg: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)', textColor: '#FFFFFF', accentColor: '#E94560' },
  { id: 'cream', name: 'Cream', bg: 'linear-gradient(135deg, #FAFAF7 0%, #F0EAE0 100%)', textColor: '#1E1E1E', accentColor: '#6B8E6E' }
];

export default function VerseSharer({ verse, book, chapter, translation }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('sage');
  const [copying, setCopying] = useState(false);
  const imageRef = useRef(null);

  const verseRef = `${book} ${chapter}:${verse.verse}`;
  const fullText = `"${verse.text}"\n\n${verseRef}`;
  const theme = SHARE_THEMES.find(t => t.id === selectedTheme);

  const shareUrl = `${window.location.origin}?verse=${encodeURIComponent(verseRef)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShareEmail = () => {
    const subject = `Bible Verse: ${verseRef}`;
    const body = `${verse.text}\n\n— ${verseRef}\n\nShared from FaithLight`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareTwitter = () => {
    const text = `"${verse.text}"\n\n${verseRef}\n\nShared from @FaithLightApp`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`"${verse.text}" — ${verseRef}`)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${verseRef}`,
          text: `"${verse.text}"`,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!imageRef.current) return;
    
    try {
      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: theme.bg,
        scale: 2,
        logging: false
      });
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${verseRef.replace(/[:\s]/g, '_')}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleCopyImage = async () => {
    if (!imageRef.current) return;
    
    try {
      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: theme.bg,
        scale: 2,
        logging: false
      });
      
      canvas.toBlob((blob) => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="hover:bg-opacity-50"
        title="Share verse"
      >
        <Share2 className="w-4 h-4" style={{ color: '#6B8E6E' }} />
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: '#1E1E1E' }}>Share This Verse</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>✕</Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Share Options */}
              <div>
                <h3 className="font-semibold mb-3" style={{ color: '#1E1E1E' }}>Quick Share</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {navigator.share && (
                    <Button
                      onClick={handleNativeShare}
                      className="flex items-center gap-2 justify-center"
                      style={{ backgroundColor: '#6B8E6E', color: '#FFFFFF' }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  )}
                  <Button
                    onClick={handleShareEmail}
                    className="flex items-center gap-2 justify-center"
                    variant="outline"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-2 justify-center"
                    variant="outline"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={handleShareFacebook}
                    className="flex items-center gap-2 justify-center"
                    variant="outline"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 justify-center"
                    variant="outline"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {copying ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>
              </div>

              {/* Custom Image Themes */}
              <div>
                <h3 className="font-semibold mb-3" style={{ color: '#1E1E1E' }}>Create Shareable Image</h3>
                
                {/* Preview */}
                <div className="mb-4">
                  <div
                    ref={imageRef}
                    className="p-8 rounded-xl text-center"
                    style={{
                      background: theme.bg,
                      color: theme.textColor,
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <p className="text-lg italic mb-6 leading-relaxed max-w-sm">"{verse.text}"</p>
                    <p className="text-sm" style={{ color: theme.accentColor }}>— {verseRef}</p>
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Select a theme:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SHARE_THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTheme(t.id)}
                        className="p-3 rounded-lg border-2 transition-all"
                        style={{
                          background: t.bg,
                          borderColor: selectedTheme === t.id ? '#6B8E6E' : 'transparent',
                          borderWidth: selectedTheme === t.id ? '2px' : '1px'
                        }}
                        title={t.name}
                      >
                        <span className="text-xs font-semibold" style={{ color: t.textColor }}>
                          {t.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadImage}
                    className="flex-1 flex items-center gap-2 justify-center"
                    style={{ backgroundColor: '#6B8E6E', color: '#FFFFFF' }}
                  >
                    <Download className="w-4 h-4" />
                    Download Image
                  </Button>
                  <Button
                    onClick={handleCopyImage}
                    className="flex-1 flex items-center gap-2 justify-center"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                    {copying ? 'Copied!' : 'Copy Image'}
                  </Button>
                </div>
              </div>

              {/* Share Link Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Share Link:</p>
                <p className="text-sm break-all" style={{ color: '#1E1E1E' }}>{shareUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}