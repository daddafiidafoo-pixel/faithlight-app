import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Search, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const THEMES = [
  'Serene mountain landscape',
  'Golden sunrise over ocean',
  'Sacred temple',
  'Peaceful forest',
  'Starry night sky',
  'White dove on clouds',
  'Minimalist geometric cross',
  'Ancient biblical scroll',
];

export default function VerseImageBuilder({ onImageGenerated }) {
  const [step, setStep] = useState(1); // 1: verse selection, 2: style picker, 3: preview
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [theme, setTheme] = useState(THEMES[0]);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!verseRef.trim()) {
      setError('Please enter a verse reference');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      // Parse reference like "John 3:16"
      const [book, chapterVerse] = verseRef.split(' ');
      const [chapter, verse] = chapterVerse.split(':');

      // Search for verse in database
      const results = await base44.entities.BibleVerse.filter({
        language: 'en',
        book_code: book.toUpperCase().slice(0, 3),
        chapter_number: parseInt(chapter),
        verse_number: parseInt(verse),
      });

      if (results && results.length > 0) {
        setVerseText(results[0].verse_text);
        setStep(2);
      } else {
        setError('Verse not found. Try another reference.');
      }
    } catch (err) {
      setError('Error searching verse: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!verseRef || !verseText || !theme) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('generateVerseImage', {
        verse_reference: verseRef,
        verse_text: verseText,
        theme,
      });

      if (res.data?.success && res.data?.image_url) {
        setImageUrl(res.data.image_url);
        setStep(3);
        if (onImageGenerated) {
          onImageGenerated({
            url: res.data.image_url,
            reference: verseRef,
            text: verseText,
            theme,
            id: res.data.verse_image_id,
          });
        }
      } else {
        setError('Failed to generate image');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Verse Selection */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📖 Choose a Verse</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Verse Reference</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., John 3:16"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {verseText && (
              <div>
                <label className="block text-sm font-medium mb-2">Verse Text</label>
                <Textarea
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                  className="h-24"
                  disabled
                />
                <Button
                  onClick={() => setStep(2)}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Continue to Style
                </Button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Style Picker */}
      {step === 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🎨 Choose a Style</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {THEMES.map((t) => (
              <Button
                key={t}
                onClick={() => setTheme(t)}
                variant={theme === t ? 'default' : 'outline'}
                className="justify-start text-left h-auto py-3 px-4 text-sm"
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleGenerateImage}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          )}
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === 3 && imageUrl && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">✨ Your Verse Image</h3>
          <div className="flex justify-center mb-6">
            <img
              src={imageUrl}
              alt="Generated verse"
              className="rounded-lg max-w-xs shadow-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setStep(1);
                setVerseRef('');
                setVerseText('');
                setImageUrl(null);
              }}
              variant="outline"
              className="flex-1"
            >
              Create Another
            </Button>
            <Button
              onClick={() => window.open(imageUrl)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              View Full Size
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}