import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Lock, Heart, BookOpen, Search, User, Tag } from 'lucide-react';
import { toast } from 'sonner';

const COLOR_MAP = {
  yellow: '#fbbf24', blue: '#60a5fa', green: '#34d399',
  red: '#ef4444', purple: '#a78bfa', orange: '#fb923c'
};

export default function BookmarksCommunityHub({ user, isDarkMode, onNavigate }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' | 'community'

  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';

  // My bookmarks
  const { data: myBookmarks = [], isLoading: loadingMine } = useQuery({
    queryKey: ['my-bookmarks-hub', user?.id],
    queryFn: async () => {
      try { return await base44.entities.Bookmark.filter({ user_id: user.id }, '-created_date', 100); }
      catch { return []; }
    },
    enabled: !!user?.id
  });

  // Community (public) bookmarks
  const { data: communityBookmarks = [], isLoading: loadingCommunity } = useQuery({
    queryKey: ['community-bookmarks'],
    queryFn: async () => {
      try { return await base44.entities.Bookmark.filter({ is_public: true }, '-created_date', 50); }
      catch { return []; }
    },
    enabled: activeTab === 'community'
  });

  const togglePublicMutation = useMutation({
    mutationFn: ({ id, is_public }) => base44.entities.Bookmark.update(id, { is_public }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookmarks-hub', user?.id]);
      toast.success('Bookmark visibility updated!');
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (bookmark) => {
      if (!user?.id) throw new Error('Login required');
      return base44.entities.Bookmark.update(bookmark.id, { like_count: (bookmark.like_count || 0) + 1 });
    },
    onSuccess: () => queryClient.invalidateQueries(['community-bookmarks']),
    onError: (e) => toast.error(e.message),
  });

  const list = activeTab === 'mine' ? myBookmarks : communityBookmarks;
  const loading = activeTab === 'mine' ? loadingMine : loadingCommunity;

  const filtered = list.filter(b =>
    !search ||
    (b.book || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.notes || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'mine', label: 'My Bookmarks', icon: BookOpen },
    { key: 'community', label: 'Community', icon: Globe },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.key ? primaryColor : 'transparent',
              color: activeTab === tab.key ? '#fff' : textColor,
            }}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: mutedColor }} />
        <Input placeholder="Search bookmarks…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 text-sm h-9"
          style={{ backgroundColor: cardColor, borderColor, color: textColor }} />
      </div>

      {loading ? (
        <p className="text-xs text-center py-6" style={{ color: mutedColor }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: mutedColor }} />
          <p className="text-sm" style={{ color: mutedColor }}>
            {activeTab === 'mine' ? 'No bookmarks yet.' : 'No community bookmarks yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filtered.map(bm => (
            <div key={bm.id} className="p-3 rounded-xl"
              style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
              <div className="flex items-start gap-2">
                {/* Color dot */}
                <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: COLOR_MAP[bm.color] || COLOR_MAP.yellow }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: textColor }}>
                      {bm.book} {bm.chapter}:{bm.verse}
                      {bm.end_verse && bm.end_verse !== bm.verse ? `-${bm.end_verse}` : ''}
                    </span>
                    {bm.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}>
                        {bm.category}
                      </span>
                    )}
                    {activeTab === 'mine' && (
                      bm.is_public
                        ? <Globe className="w-3 h-3 text-green-500" />
                        : <Lock className="w-3 h-3" style={{ color: mutedColor }} />
                    )}
                  </div>
                  {bm.title && <p className="text-xs font-medium mt-0.5" style={{ color: textColor }}>{bm.title}</p>}
                  {bm.notes && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: mutedColor }}>{bm.notes}</p>}
                  {activeTab === 'community' && bm.user_name && (
                    <p className="text-xs mt-0.5 flex items-center gap-0.5" style={{ color: mutedColor }}>
                      <User className="w-2.5 h-2.5" />{bm.user_name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {onNavigate && (
                    <button onClick={() => onNavigate(bm)}
                      className="h-7 px-2 flex items-center justify-center rounded text-xs"
                      style={{ backgroundColor: primaryColor, color: '#fff' }}
                      title="Go to verse">
                      <BookOpen className="w-3 h-3" />
                    </button>
                  )}
                  {activeTab === 'mine' && (
                    <button
                      onClick={() => togglePublicMutation.mutate({ id: bm.id, is_public: !bm.is_public })}
                      className="h-7 px-2 flex items-center justify-center rounded text-xs transition-colors"
                      style={{ border: `1px solid ${borderColor}`, color: mutedColor }}
                      title={bm.is_public ? 'Make private' : 'Share publicly'}>
                      {bm.is_public ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    </button>
                  )}
                  {activeTab === 'community' && user?.id && (
                    <button onClick={() => likeMutation.mutate(bm)}
                      className="h-7 px-2 flex items-center gap-0.5 justify-center rounded text-xs transition-colors hover:bg-red-50"
                      style={{ border: `1px solid ${borderColor}` }}>
                      <Heart className="w-3 h-3 text-red-400" />
                      {(bm.like_count || 0) > 0 && <span className="text-xs" style={{ color: mutedColor }}>{bm.like_count}</span>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}