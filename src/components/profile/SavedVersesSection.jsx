import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Copy, Share2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function SavedVersesSection({ user }) {
  const queryClient = useQueryClient();

  const { data: savedVerses = [] } = useQuery({
    queryKey: ['saved-verses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return base44.entities.SavedVerse.filter({ user_id: user.id }, '-created_date');
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (verseId) => base44.entities.SavedVerse.delete(verseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-verses', user?.id]);
    },
  });

  const handleCopy = (verseText, reference) => {
    const text = `${verseText}\n\n— ${reference}`;
    navigator.clipboard.writeText(text);
  };

  const handleShare = (verseText, reference) => {
    const text = `${verseText}\n\n— ${reference}`;
    if (navigator.share) {
      navigator.share({
        title: 'Bible Verse',
        text: text,
      });
    } else {
      handleCopy(verseText, reference);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Saved Verses ({savedVerses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {savedVerses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No saved verses yet</p>
            <p className="text-sm text-gray-500 mt-1">Save verses from the Verse of the Day or Bible reader</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {savedVerses.map(verse => (
              <div key={verse.id} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-indigo-900 italic">"{verse.verse_text}"</p>
                    <p className="text-xs font-medium text-indigo-700 mt-2">— {verse.reference}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(verse.verse_text, verse.reference)}
                    className="text-xs h-8 px-2"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(verse.verse_text, verse.reference)}
                    className="text-xs h-8 px-2"
                    title="Share verse"
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(verse.id)}
                    disabled={deleteMutation.isPending}
                    className="text-xs h-8 px-2 text-red-600 hover:text-red-700"
                    title="Remove verse"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}