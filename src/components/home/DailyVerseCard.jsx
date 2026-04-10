import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Loader2 } from 'lucide-react';

export default function DailyVerseCard() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVerse = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const verses = await base44.entities.DailyVerse.filter(
          { date: today },
          '-created_date',
          1
        );

        if (verses && verses.length > 0) {
          setVerse(verses[0]);
        }
      } catch (error) {
        console.error('Failed to load daily verse:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVerse();
  }, []);

  const handleShare = async () => {
    if (!verse) return;

    const text = `${verse.reference}\n\n"${verse.text}"\n\n${verse.reflection || ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Verse',
          text: text,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Verse copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6 flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (!verse) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6 text-center text-gray-600">
          No verse available today
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="text-lg text-indigo-900">{verse.reference}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base italic text-gray-800">"{verse.text}"</p>
        {verse.reflection && (
          <p className="text-sm text-gray-600">{verse.reflection}</p>
        )}
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="gap-2 w-full"
        >
          <Share2 className="w-4 h-4" />
          Share Verse
        </Button>
      </CardContent>
    </Card>
  );
}