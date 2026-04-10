import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Hash } from 'lucide-react';

const SEED_TAGS = [
  { tag: 'Grace', count: 142, color: 'bg-blue-100 text-blue-700' },
  { tag: 'Prayer', count: 128, color: 'bg-green-100 text-green-700' },
  { tag: 'Psalms', count: 115, color: 'bg-purple-100 text-purple-700' },
  { tag: 'Faith', count: 108, color: 'bg-amber-100 text-amber-700' },
  { tag: 'Forgiveness', count: 97, color: 'bg-pink-100 text-pink-700' },
  { tag: 'Wisdom', count: 89, color: 'bg-teal-100 text-teal-700' },
  { tag: 'Prophecy', count: 76, color: 'bg-indigo-100 text-indigo-700' },
  { tag: 'Gospel', count: 71, color: 'bg-orange-100 text-orange-700' },
  { tag: 'Love', count: 68, color: 'bg-rose-100 text-rose-700' },
  { tag: 'Salvation', count: 64, color: 'bg-cyan-100 text-cyan-700' },
  { tag: 'Hope', count: 58, color: 'bg-lime-100 text-lime-700' },
  { tag: 'Holy Spirit', count: 52, color: 'bg-violet-100 text-violet-700' },
];

const TAG_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700', 'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
];

export default function TrendingTags({ onTagSelect, selectedTag }) {
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['forum-tags-trending'],
    queryFn: async () => {
      try {
        const topics = await base44.entities.ForumTopic.list('-created_date', 30);
        return topics;
      } catch { return []; }
    },
    retry: false,
    staleTime: 120000,
  });

  // Build tag frequency from forum topics + seed
  const tagMap = {};
  SEED_TAGS.forEach(t => { tagMap[t.tag] = { count: t.count, color: t.color }; });
  topics.forEach(t => {
    if (t.category) {
      const key = t.category.charAt(0).toUpperCase() + t.category.slice(1);
      tagMap[key] = { count: (tagMap[key]?.count || 0) + 3, color: tagMap[key]?.color || TAG_COLORS[0] };
    }
    if (Array.isArray(t.tags)) {
      t.tags.forEach((tag, i) => {
        tagMap[tag] = { count: (tagMap[tag]?.count || 0) + 1, color: TAG_COLORS[i % TAG_COLORS.length] };
      });
    }
  });

  const sorted = Object.entries(tagMap)
    .map(([tag, { count, color }]) => ({ tag, count, color }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-indigo-600" />
        <h3 className="font-bold text-gray-900 text-sm">Trending Topics</h3>
      </div>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {sorted.map(({ tag, count, color }) => (
            <button
              key={tag}
              onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : `${color} border-transparent hover:border-current hover:shadow-sm`
              }`}
            >
              <Hash className="w-2.5 h-2.5" />
              {tag}
              <span className="opacity-60 font-normal">{count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}