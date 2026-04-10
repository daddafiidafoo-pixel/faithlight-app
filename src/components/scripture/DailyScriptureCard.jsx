import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Share2, Copy, Check, Heart, Loader2, Image } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import VerseShareImageGenerator from '@/components/bible/VerseShareImageGenerator';

export default function DailyScriptureCard({ user }) {
  const { t } = useI18n();
  const [scripture, setScripture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);

  useEffect(() => {
    loadDailyScripture();
  }, []);

  const loadDailyScripture = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = await base44.entities.DailyScripture.filter(
        { date_key: today },
        '-created_date',
        1
      );

      if (existing && existing[0]) {
        setScripture(existing[0]);
      } else {
        // Fallback: return a random verse
        const verses = [
          { verse_ref: 'John 3:16', verse_text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
          { verse_ref: 'Psalm 23:1', verse_text: 'The Lord is my shepherd, I lack nothing.' },
          { verse_ref: 'Romans 8:28', verse_text: 'And we know that in all things God works for the good of those who love him.' },
          { verse_ref: 'Philippians 4:13', verse_text: 'I can do all this through him who gives me strength.' },
          { verse_ref: '1 Peter 5:7', verse_text: 'Cast all your anxiety on him because he cares for you.' },
        ];
        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        setScripture({ ...randomVerse, date_key: today });
      }
    } catch (err) {
      console.error('Failed to load daily scripture:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (scripture) {
      const text = `${scripture.verse_ref}\n\n"${scripture.verse_text}"\n\n— FaithLight`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform) => {
    if (!scripture) return;

    const text = `"${scripture.verse_text}" — ${scripture.verse_ref}`;
    const shareUrl = `https://faithlight.app`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);

    let url;
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}`;
        break;
      case 'copy':
        handleCopy();
        return;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleSaveVerse = async () => {
    if (!user || !scripture) return;
    try {
      // This would connect to a SavedVerse entity
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save verse:', err);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-600 mt-3">{t('scripture.loading', 'Loading daily verse...')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-lg">{t('scripture.verse_of_day', 'Verse of the Day')}</CardTitle>
          </div>
          {scripture?.theme && (
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
              {scripture.theme}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verse Reference */}
        <div className="text-center py-4">
          <p className="text-sm font-semibold text-purple-600 mb-2">{t('scripture.today', 'Today\'s Scripture')}</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">{scripture?.verse_ref}</p>
          <div className="h-1 w-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mx-auto" />
        </div>

        {/* Verse Text */}
        <div className="bg-white rounded-lg p-5 border border-purple-100 shadow-sm">
          <p className="text-gray-800 leading-relaxed text-lg italic">
            "{scripture?.verse_text}"
          </p>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2 justify-center pt-3">
          <Button
            onClick={() => setShowImageGenerator(!showImageGenerator)}
            variant="default"
            size="sm"
            className="gap-1 text-xs bg-indigo-600 hover:bg-indigo-700"
            title="Create shareable image"
          >
            <Image className="w-3 h-3" /> Share Image
          </Button>
          <Button
            onClick={() => handleShare('twitter')}
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            title="Share on Twitter"
          >
            𝕏 Tweet
          </Button>
          <Button
            onClick={() => handleShare('whatsapp')}
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            title="Share on WhatsApp"
          >
            💬 WhatsApp
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </Button>
          {user && (
            <Button
              onClick={handleSaveVerse}
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
            >
              {saved ? (
                <>
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" /> Saved
                </>
              ) : (
                <>
                  <Heart className="w-3 h-3" /> Save
                </>
              )}
            </Button>
          )}
        </div>

        {/* Image Generator Modal */}
        {showImageGenerator && (
          <div className="mt-6 pt-6 border-t border-purple-200">
            <VerseShareImageGenerator
              verse={scripture?.verse_text}
              verseRef={scripture?.verse_ref}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}