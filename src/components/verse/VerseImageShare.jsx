import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Share2, Copy, Check } from 'lucide-react';

export default function VerseImageShare({ image, verseRef, verseText }) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image;
    a.download = `faithlight-verse-${Date.now()}.png`;
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`"${verseText}" — ${verseRef}\n\nGenerated with FaithLight ✨`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = encodeURIComponent(`"${verseText}" — ${verseRef}\n\nGenerated with FaithLight ✨`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareLinks = [
    { name: 'Instagram', emoji: '📸', action: () => alert('Open Instagram and upload the image') },
    { name: 'Facebook', emoji: '👍', action: () => alert('Open Facebook and upload the image') },
    { name: 'WhatsApp', emoji: '💬', action: handleShare },
    { name: 'Pinterest', emoji: '📌', action: () => alert('Open Pinterest and upload the image') },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📤 Share Your Verse</h3>
      
      <div className="grid grid-cols-4 gap-2 mb-6">
        {shareLinks.map((link) => (
          <Button
            key={link.name}
            onClick={link.action}
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <span className="text-xl">{link.emoji}</span>
            <span className="text-xs">{link.name}</span>
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}