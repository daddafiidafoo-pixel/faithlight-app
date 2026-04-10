import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { BookOpen, Loader2 } from 'lucide-react';

export default function TranslationComparison({ book, chapter, verseStart, verseEnd }) {
  const [selectedTranslations, setSelectedTranslations] = useState(['WEB']);
  const [translations, setTranslations] = useState([]);
  const [verses, setVerses] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const data = await base44.entities.Translation.filter({ is_active: true });
        setTranslations(data || []);
      } catch (error) {
        console.error('Error fetching translations:', error);
      }
    };
    fetchTranslations();
  }, []);

  const handleFetchComparison = async () => {
    setLoading(true);
    try {
      const comparison = {};
      for (const translationCode of selectedTranslations) {
        const data = await base44.entities.BibleVerse.filter({
          translation: translationCode,
          book,
          chapter,
        }, 'verse', 300);

        const filtered = data.filter(v => v.verse >= verseStart && v.verse <= verseEnd);
        comparison[translationCode] = filtered;
      }
      setVerses(comparison);
    } catch (error) {
      console.error('Error fetching verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTranslation = (code) => {
    setSelectedTranslations(prev =>
      prev.includes(code) ? prev.filter(t => t !== code) : [...prev, code]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Translations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Translation Selector */}
          <div className="border rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Select translations to compare:</p>
            <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto">
              {translations.map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTranslations.includes(t.translation_code)}
                    onCheckedChange={() => toggleTranslation(t.translation_code)}
                  />
                  <span className="text-sm">{t.display_name}</span>
                </label>
              ))}
            </div>
            <Button
              onClick={handleFetchComparison}
              disabled={loading || selectedTranslations.length === 0}
              className="w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load Comparison'
              )}
            </Button>
          </div>

          {/* Comparison Display */}
          {Object.keys(verses).length > 0 && (
            <div className="space-y-4">
              {selectedTranslations.map((translationCode) => (
                <Card key={translationCode} className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {translations.find(t => t.translation_code === translationCode)?.display_name || translationCode}
                  </h3>
                  <div className="space-y-2">
                    {verses[translationCode]?.map((verse) => (
                      <div key={verse.id} className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-600">{verse.verse}:</span> {verse.text}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}