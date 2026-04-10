import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Highlighter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const COLOR_STYLES = {
  yellow: { bg: '#FFFAED', border: '#FCD34D', dot: '#F59E0B' },
  pink: { bg: '#FDF2F8', border: '#F9A8D4', dot: '#EC4899' },
  green: { bg: '#F0FDF4', border: '#86EFAC', dot: '#22C55E' },
  blue: { bg: '#EFF6FF', border: '#93C5FD', dot: '#3B82F6' },
  purple: { bg: '#F5F3FF', border: '#C4B5FD', dot: '#8B5CF6' },
  orange: { bg: '#FFF7ED', border: '#FDBA74', dot: '#F97316' },
};

export default function VerseHighlightsCard({ user }) {
  const { data: highlights = [] } = useQuery({
    queryKey: ['recentHighlights', user?.id],
    queryFn: () => base44.entities.VerseHighlight.filter({ user_id: user.id }, '-created_date', 5),
    enabled: !!user?.id,
  });

  if (!user || highlights.length === 0) return null;

  return (
    <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Highlighter className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">Recent Highlights</h3>
        </div>
        <Link to={createPageUrl('MyHighlights')} className="text-xs text-indigo-600 hover:underline">View all</Link>
      </div>
      <div className="space-y-2">
        {highlights.map(h => {
          const style = COLOR_STYLES[h.color] || COLOR_STYLES.yellow;
          return (
            <Link
              key={h.id}
              to={createPageUrl(`BibleReader?book=${encodeURIComponent(h.book)}&chapter=${h.chapter}`)}
              className="flex items-start gap-3 p-2.5 rounded-xl border transition-colors hover:opacity-80"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: style.dot }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700">{h.book} {h.chapter}:{h.verse}</p>
                {h.verse_text && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{h.verse_text}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}