import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ThumbsUp, Eye, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BadgeDisplay from '../community/BadgeDisplay';

export default function CommunityHighlights({ book, chapter, translation, currentUser }) {
  const [filter, setFilter] = useState('popular'); // 'popular', 'recent', 'all'
  const [showNotes, setShowNotes] = useState(true);

  // Fetch public highlights
  const { data: publicHighlights = [] } = useQuery({
    queryKey: ['publicHighlights', book, chapter, translation],
    queryFn: () => base44.entities.VerseHighlight.filter({
      book,
      chapter: parseInt(chapter),
      translation,
      is_public: true
    }),
    enabled: !!book && !!chapter
  });

  // Fetch public notes
  const { data: publicNotes = [] } = useQuery({
    queryKey: ['publicNotes', book, chapter, translation],
    queryFn: () => base44.entities.VerseNote.filter({
      book,
      chapter: parseInt(chapter),
      translation,
      is_public: true
    }),
    enabled: !!book && !!chapter && showNotes
  });

  // Get users for notes
  const { data: users = [] } = useQuery({
    queryKey: ['noteUsers'],
    queryFn: async () => {
      const userIds = [...new Set(publicNotes.map(n => n.user_id))];
      if (userIds.length === 0) return [];
      return base44.entities.User.list();
    },
    enabled: publicNotes.length > 0
  });

  // Get badges for users
  const { data: allBadges = [] } = useQuery({
    queryKey: ['userBadgesForNotes'],
    queryFn: () => base44.entities.UserBadge.list(),
    enabled: publicNotes.length > 0
  });

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.email || 'Anonymous';
  };

  const getUserBadges = (userId) => {
    return allBadges.filter(b => b.user_id === userId);
  };

  // Sort notes based on filter
  const sortedNotes = [...publicNotes].sort((a, b) => {
    if (filter === 'popular') return (b.likes_count || 0) - (a.likes_count || 0);
    if (filter === 'recent') return new Date(b.created_date) - new Date(a.created_date);
    return 0;
  });

  // Group highlights by verse
  const highlightsByVerse = publicHighlights.reduce((acc, h) => {
    const key = h.verse;
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {});

  // Get most popular verses (most highlighted)
  const popularVerses = Object.entries(highlightsByVerse)
    .map(([verse, highlights]) => ({ verse: parseInt(verse), count: highlights.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Community Insights
        </h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Popular Verses */}
      {popularVerses.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              Most Highlighted Verses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {popularVerses.map(({ verse, count }) => (
                <Badge key={verse} variant="secondary" className="bg-amber-100 text-amber-800">
                  v{verse} ({count} {count === 1 ? 'highlight' : 'highlights'})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public Notes */}
      {sortedNotes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm">
              No community notes yet for this chapter.
              <br />
              Be the first to share your insights!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-indigo-600">
                      {getUserName(note.user_id).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{getUserName(note.user_id)}</p>
                        <BadgeDisplay badges={getUserBadges(note.user_id)} compact={true} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {note.likes_count || 0}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {book} {chapter}:{note.verse}
                    </p>
                    <p className="text-sm text-gray-700 mb-2 italic">"{note.verse_text}"</p>
                    <p className="text-sm text-gray-900">{note.note_text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}