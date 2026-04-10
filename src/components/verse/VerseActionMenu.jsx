import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Bookmark, Image } from 'lucide-react';
import VerseShareModal from './VerseShareModal';

export default function VerseActionMenu({ verse, reference, language = 'en', onSave }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyVerse = () => {
    const text = `"${verse}" — ${reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button
          onClick={() => setShareOpen(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Image className="w-4 h-4" />
          Share Image
        </Button>

        <Button
          onClick={handleCopyVerse}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy Verse'}
        </Button>

        <Button
          onClick={handleSave}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Bookmark className="w-4 h-4" />
          Save
        </Button>
      </div>

      <VerseShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        verse={verse}
        reference={reference}
        language={language}
      />
    </>
  );
}