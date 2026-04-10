import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Share2, Heart, MessageCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function VerseOfDaySharer({ user, isDarkMode }) {
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [sharedVerses, setSharedVerses] = useState([]);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  // Fetch today's verse of the day
  const { data: verseOfDay } = useQuery({
    queryKey: ['verseOfDay'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const results = await base44.entities.SavedVerse.filter({
          featured_date: today
        }, '-created_date', 1);
        return results[0] || null;
      } catch {
        return null;
      }
    }
  });

  // Fetch shared verses from friends
  const { data: communityShares = [] } = useQuery({
    queryKey: ['communityVerseShares'],
    queryFn: async () => {
      try {
        return await base44.entities.SavedVerse.filter({
          is_shared: true
        }, '-created_date', 10);
      } catch {
        return [];
      }
    }
  });

  // Share verse mutation
  const shareVerseMutation = useMutation({
    mutationFn: async (verseData) => {
      return base44.entities.SavedVerse.create({
        user_id: user?.id,
        user_name: user?.full_name || 'Anonymous',
        verse_reference: verseData.reference,
        verse_text: verseData.text,
        is_shared: true,
        share_message: verseData.message,
        share_count: 0,
        likes_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityVerseShares'] });
      toast.success('Verse shared with the community!');
      setSelectedVerse(null);
    },
    onError: () => {
      toast.error('Failed to share verse');
    }
  });

  const handleShareVerse = (verse) => {
    if (!user) {
      toast.error('Please log in to share');
      return;
    }
    shareVerseMutation.mutate({
      reference: verse.verse_reference || 'John 3:16',
      text: verse.verse_text || verse.text,
      message: `Sharing this verse with my FaithLight community! 📖`
    });
  };

  const handleLikeShare = async (verseId) => {
    // Update like count
    try {
      const verse = communityShares.find(v => v.id === verseId);
      await base44.entities.SavedVerse.update(verseId, {
        likes_count: (verse?.likes_count || 0) + 1
      });
      queryClient.invalidateQueries({ queryKey: ['communityVerseShares'] });
      toast.success('Liked! 💜');
    } catch {
      toast.error('Failed to like');
    }
  };

  const handleCopyVerse = async (verse) => {
    try {
      await navigator.clipboard.writeText(`"${verse.verse_text}" - ${verse.verse_reference}`);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Verse of the Day */}
      {verseOfDay && (
        <Card style={{ backgroundColor: cardColor, borderColor }}>
          <CardHeader>
            <CardTitle style={{ color: textColor }}>✨ Verse of the Day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="p-4 rounded-lg border italic text-center"
              style={{ backgroundColor: bgColor, borderColor }}
            >
              <p style={{ color: textColor }}>"{verseOfDay.verse_text}"</p>
              <p className="text-sm font-semibold mt-2" style={{ color: primaryColor }}>
                {verseOfDay.verse_reference}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleShareVerse(verseOfDay)}
                className="flex-1 gap-2"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                <Share2 className="w-4 h-4" />
                Share with Friends
              </Button>
              <Button
                onClick={() => handleCopyVerse(verseOfDay)}
                variant="outline"
                style={{ borderColor, color: primaryColor }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Shared Verses */}
      <Card style={{ backgroundColor: cardColor, borderColor }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
            <MessageCircle className="w-5 h-5" style={{ color: primaryColor }} />
            Community is Sharing
          </CardTitle>
          <p className="text-xs mt-2" style={{ color: mutedColor }}>
            See what verses inspire your friends
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {communityShares.length === 0 ? (
            <p style={{ color: mutedColor, fontSize: '14px' }}>
              Be the first to share a verse!
            </p>
          ) : (
            communityShares.map(verse => (
              <div
                key={verse.id}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: bgColor, borderColor }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                      {verse.user_name}
                    </p>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      {verse.created_date ? new Date(verse.created_date).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
                <p className="text-sm italic my-2" style={{ color: textColor }}>
                  "{verse.verse_text}"
                </p>
                <p className="text-xs font-semibold mb-3" style={{ color: primaryColor }}>
                  {verse.verse_reference}
                </p>
                {verse.share_message && (
                  <p className="text-xs mb-3" style={{ color: mutedColor }}>
                    {verse.share_message}
                  </p>
                )}
                <div className="flex gap-2 pt-3 border-t" style={{ borderColor }}>
                  <Button
                    onClick={() => handleLikeShare(verse.id)}
                    size="sm"
                    variant="ghost"
                    className="gap-1 flex-1"
                    style={{ color: primaryColor }}
                  >
                    <Heart className="w-4 h-4" />
                    {verse.likes_count || 0}
                  </Button>
                  <Button
                    onClick={() => handleCopyVerse(verse)}
                    size="sm"
                    variant="ghost"
                    className="gap-1 flex-1"
                    style={{ color: primaryColor }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}