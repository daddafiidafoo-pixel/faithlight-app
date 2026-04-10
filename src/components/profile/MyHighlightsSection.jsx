import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Highlighter, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLOR_STYLES = {
  yellow: { bg: '#FEF9C3', border: '#FDE047', dot: '#EAB308' },
  green:  { bg: '#DCFCE7', border: '#4ADE80', dot: '#16A34A' },
  blue:   { bg: '#DBEAFE', border: '#60A5FA', dot: '#2563EB' },
  pink:   { bg: '#FCE7F3', border: '#F472B6', dot: '#DB2777' },
  purple: { bg: '#EDE9FE', border: '#A78BFA', dot: '#7C3AED' },
};

export default function MyHighlightsSection({ userEmail }) {
  const navigate = useNavigate();

  const { data: highlights, isLoading } = useQuery({
    queryKey: ['my-highlights', userEmail],
    queryFn: () => base44.entities.UserHighlight.filter({ user_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail,
  });

  if (isLoading) return (
    <Card>
      <CardContent className="pt-4">
        <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Highlighter className="w-4 h-4 text-yellow-500" /> My Highlights
          {highlights?.length > 0 && (
            <span className="ml-auto text-xs font-normal text-gray-400">{highlights.length} verse{highlights.length !== 1 ? 's' : ''}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!highlights?.length ? (
          <div className="text-center py-8">
            <Highlighter className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No highlights yet.</p>
            <p className="text-xs text-gray-400 mt-1">Long-tap any verse in the Bible Reader to highlight it.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {highlights.map(h => {
              const style = COLOR_STYLES[h.color] || COLOR_STYLES.yellow;
              return (
                <button
                  key={h.id}
                  onClick={() => navigate(`/BibleReaderPage?book_id=${h.book_id}&chapter=${h.chapter}&verse_start=${h.verse_number}`)}
                  className="w-full text-left rounded-xl p-3 border transition-all hover:opacity-80"
                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                >
                  <div className="flex items-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: style.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold mb-0.5" style={{ color: style.dot }}>{h.reference_text}</p>
                      <p className="text-sm leading-snug text-gray-800 line-clamp-2">{h.verse_text}</p>
                    </div>
                    <BookOpen className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}