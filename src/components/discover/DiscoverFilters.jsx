import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, BookOpen, SlidersHorizontal, TrendingUp, Clock, Star, Sparkles, X } from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'all', label: 'All', icon: SlidersHorizontal },
  { id: 'forum', label: 'Forum', icon: MessageCircle },
  { id: 'group', label: 'Groups', icon: Users },
  { id: 'plan', label: 'Study Plans', icon: BookOpen },
];

const SORT_OPTIONS = [
  { id: 'foryou', label: 'For You', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'popular', label: 'Popular', icon: Star },
];

export default function DiscoverFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const hasActiveFilters = filters.contentType !== 'all' || filters.sort !== 'foryou' || filters.tag;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
      {/* Content Type */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Content Type</p>
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => update('contentType', id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.contentType === id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort / Feed */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sort By</p>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => update('sort', id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.sort === id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active tag */}
      {filters.tag && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Tag:</span>
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs gap-1">
            #{filters.tag}
            <button onClick={() => update('tag', null)} className="ml-1 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
      )}

      {hasActiveFilters && (
        <button
          onClick={() => onChange({ contentType: 'all', sort: 'foryou', tag: null })}
          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <X className="w-3 h-3" /> Clear all filters
        </button>
      )}
    </div>
  );
}