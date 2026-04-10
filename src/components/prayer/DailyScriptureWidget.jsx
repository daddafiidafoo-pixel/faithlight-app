import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const DAILY_VERSES = [
  { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
  { ref: 'Proverbs 31:25', text: 'She is clothed with strength and dignity; she can laugh at the days to come.' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: '1 Peter 5:7', text: 'Cast all your anxiety on him because he cares for you.' },
  { ref: 'Philippians 4:13', text: 'I can do all this through him who gives me strength.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.' },
  { ref: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
];

export default function DailyScriptureWidget({ onSaveVerse }) {
  const { user, isAuthenticated } = useAuth();
  const [verse, setVerse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const today = new Date().getDate();
    const verseIndex = today % DAILY_VERSES.length;
    setVerse(DAILY_VERSES[verseIndex]);
  }, []);

  const handleSaveVerse = async () => {
    if (!isAuthenticated || !verse) return;

    setIsSaving(true);
    try {
      await base44.functions.invoke('prayerCRUD', {
        action: 'create',
        userEmail: user?.email,
        title: `Scripture: ${verse.ref}`,
        body: verse.text,
        category: 'faith',
        status: 'active',
      });

      toast.success('Verse saved to your journal!');
      onSaveVerse?.();
    } catch (error) {
      toast.error('Failed to save verse');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyVerse = () => {
    const text = `${verse.ref}\n\n${verse.text}`;
    navigator.clipboard.writeText(text);
    toast.success('Verse copied!');
  };

  if (!verse) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-6">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wide mb-3">
          Daily Scripture
        </h3>
        <p className="text-lg font-semibold text-gray-800 mb-4">{verse.ref}</p>
        <p className="text-gray-700 italic leading-relaxed mb-6">"{verse.text}"</p>

        <div className="flex justify-center gap-3 flex-wrap">
          <Button
            onClick={handleCopyVerse}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>

          {isAuthenticated && (
            <Button
              onClick={handleSaveVerse}
              disabled={isSaving}
              size="sm"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Bookmark className="w-4 h-4" />
              Save to Journal
            </Button>
          )}

          <Button
            onClick={() => {
              const text = `${verse.ref}\n\n${verse.text}`;
              if (navigator.share) {
                navigator.share({ title: 'Daily Scripture', text });
              } else {
                handleCopyVerse();
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
}