import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

export default function BibleChapterReader({ bookKey, chapter: initialChapter = 1, language: initialLang }) {
  const queryClient = useQueryClient();
  const { lang } = useI18n();
  const currentLang = initialLang || lang || 'en';
  const [selectedLang, setSelectedLang] = useState(currentLang);
  const [chapter, setChapter] = useState(initialChapter);

  // All hooks must be called before any conditional return
  const { data: verses = [], isLoading } = useQuery({
    queryKey: ['bible-verses', bookKey, chapter, selectedLang],
    queryFn: async () => {
      const result = await base44.entities.BibleVerse.filter(
        { bookKey, chapter, language: selectedLang },
        'verse',
        1000
      );
      return result || [];
    },
    enabled: !!bookKey,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const existing = await base44.entities.ReadingProgress.filter({
        user_id: user.id, book_key: bookKey, chapter,
      });
      if (existing && existing.length > 0) return existing[0];
      return await base44.entities.ReadingProgress.create({
        user_id: user.id, book_key: bookKey, chapter,
        completed_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] });
    },
  });

  const { data: progressRecord } = useQuery({
    queryKey: ['reading-progress-check', bookKey, chapter],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return null;
        const result = await base44.entities.ReadingProgress.filter({
          user_id: user.id, book_key: bookKey, chapter,
        });
        return result?.[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!bookKey,
  });

  if (!bookKey) return <div className="p-4 text-red-500">Book not found</div>;

  const handlePrevChapter = () => { if (chapter > 1) setChapter(chapter - 1); };
  const handleNextChapter = () => setChapter(chapter + 1);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-col gap-3 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{bookKey}</h1>
            <p className="text-sm text-gray-500">Chapter {chapter}</p>
          </div>
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="om">Afaan Oromoo</SelectItem>
              <SelectItem value="am">አማርኛ</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="sw">Swahili</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevChapter} disabled={chapter <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2">Chapter {chapter}</span>
          <Button variant="outline" size="sm" onClick={handleNextChapter}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={progressRecord ? 'default' : 'outline'}
            onClick={() => markAsReadMutation.mutate()}
            className="ml-auto gap-2"
          >
            {progressRecord ? (
              <><Check className="w-4 h-4" /> Read</>
            ) : (
              <><BookOpen className="w-4 h-4" /> Mark as Read</>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading verses...</div>
        ) : verses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No verses available for this chapter in {selectedLang}
          </div>
        ) : (
          verses.map((verse) => (
            <div key={verse.id} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-semibold text-indigo-600 min-w-12">{verse.verse}</span>
              <p className="text-gray-700">{verse.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={handlePrevChapter} disabled={chapter <= 1} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <span className="text-sm text-gray-600">Chapter {chapter}</span>
        <Button variant="outline" onClick={handleNextChapter} className="gap-2">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}