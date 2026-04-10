import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Heart, Copy, Play, Search, Music2, User, Bookmark, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function PlaylistCommunityHub({ user, isDarkMode, onPlaylistSelect }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'mine'

  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';

  // Public playlists
  const { data: publicPlaylists = [], isLoading: loadingPublic } = useQuery({
    queryKey: ['community-playlists'],
    queryFn: async () => {
      try { return await base44.entities.Playlist.filter({ is_public: true }, '-created_date', 50); }
      catch { return []; }
    }
  });

  // My playlists
  const { data: myPlaylists = [], isLoading: loadingMine } = useQuery({
    queryKey: ['my-playlists', user?.id],
    queryFn: async () => {
      try { return await base44.entities.Playlist.filter({ user_id: user.id }, '-created_date', 50); }
      catch { return []; }
    },
    enabled: !!user?.id
  });

  // Like/unlike mutation — stores likes as a count increment (simple approach)
  const likeMutation = useMutation({
    mutationFn: async (playlist) => {
      if (!user?.id) throw new Error('Login to like playlists');
      const newLikes = (playlist.likes || 0) + 1;
      return base44.entities.Playlist.update(playlist.id, { likes: newLikes });
    },
    onSuccess: () => queryClient.invalidateQueries(['community-playlists']),
    onError: (e) => toast.error(e.message),
  });

  // Copy playlist to my library
  const copyMutation = useMutation({
    mutationFn: async (playlist) => {
      if (!user?.id) throw new Error('Login to copy playlists');
      return base44.entities.Playlist.create({
        user_id: user.id,
        creator_name: user.full_name,
        title: `${playlist.title} (copy)`,
        description: playlist.description,
        items: playlist.items,
        tags: playlist.tags,
        translation: playlist.translation,
        item_count: playlist.item_count || 0,
        is_public: false,
        copied_from_id: playlist.id,
        category: playlist.category || 'custom',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-playlists', user?.id]);
      toast.success('Playlist copied to your library!');
    },
    onError: (e) => toast.error(e.message || 'Failed to copy'),
  });

  // Toggle public/private for my playlist
  const togglePublicMutation = useMutation({
    mutationFn: async ({ id, is_public }) => base44.entities.Playlist.update(id, { is_public }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-playlists', user?.id]);
      queryClient.invalidateQueries(['community-playlists']);
      toast.success('Playlist visibility updated!');
    },
  });

  const filtered = (activeTab === 'discover' ? publicPlaylists : myPlaylists).filter(p =>
    !search ||
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const tabs = [
    { key: 'discover', label: 'Discover', icon: Globe },
    { key: 'mine', label: 'My Playlists', icon: Music2 },
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
        <Input
          placeholder="Search playlists…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 text-sm h-9"
          style={{ backgroundColor: cardColor, borderColor, color: textColor }}
        />
      </div>

      {/* List */}
      {(activeTab === 'discover' ? loadingPublic : loadingMine) ? (
        <p className="text-xs text-center py-6" style={{ color: mutedColor }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: mutedColor }} />
          <p className="text-sm" style={{ color: mutedColor }}>
            {activeTab === 'discover'
              ? 'No public playlists yet. Share one!'
              : 'No playlists yet. Create one in the Playlists tab.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(playlist => (
            <div key={playlist.id} className="p-3 rounded-xl"
              style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${primaryColor}22` }}>
                  <Music2 className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm truncate" style={{ color: textColor }}>{playlist.title}</span>
                    {playlist.category && (
                      <Badge variant="outline" className="text-xs h-4 px-1">{playlist.category}</Badge>
                    )}
                    {activeTab === 'mine' && (
                      playlist.is_public
                        ? <Globe className="w-3 h-3 text-green-500" title="Public" />
                        : <Lock className="w-3 h-3" style={{ color: mutedColor }} title="Private" />
                    )}
                  </div>
                  {playlist.description && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: mutedColor }}>{playlist.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: mutedColor }}>
                      {playlist.item_count || playlist.items?.length || 0} chapters
                    </span>
                    {playlist.creator_name && activeTab === 'discover' && (
                      <span className="text-xs flex items-center gap-0.5" style={{ color: mutedColor }}>
                        <User className="w-2.5 h-2.5" />{playlist.creator_name}
                      </span>
                    )}
                    {(playlist.likes || 0) > 0 && (
                      <span className="text-xs flex items-center gap-0.5" style={{ color: mutedColor }}>
                        <Heart className="w-2.5 h-2.5" />{playlist.likes}
                      </span>
                    )}
                  </div>
                  {(playlist.tags || []).length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {playlist.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Button size="sm" onClick={() => onPlaylistSelect?.(playlist)}
                    className="h-7 px-2 text-xs gap-1"
                    style={{ backgroundColor: primaryColor, color: '#fff' }}>
                    <Play className="w-3 h-3" />
                  </Button>
                  {activeTab === 'discover' && user?.id && (
                    <>
                      <button onClick={() => likeMutation.mutate(playlist)}
                        className="h-7 px-2 flex items-center justify-center rounded text-xs transition-colors hover:bg-red-50"
                        style={{ border: `1px solid ${borderColor}` }}
                        title="Like">
                        <Heart className="w-3 h-3 text-red-400" />
                      </button>
                      <button onClick={() => copyMutation.mutate(playlist)}
                        className="h-7 px-2 flex items-center justify-center rounded text-xs transition-colors hover:bg-blue-50"
                        style={{ border: `1px solid ${borderColor}` }}
                        title="Copy to my library"
                        disabled={copyMutation.isPending}>
                        <Copy className="w-3 h-3 text-blue-400" />
                      </button>
                    </>
                  )}
                  {activeTab === 'mine' && (
                    <button
                      onClick={() => togglePublicMutation.mutate({ id: playlist.id, is_public: !playlist.is_public })}
                      className="h-7 px-2 flex items-center justify-center rounded text-xs transition-colors"
                      style={{ border: `1px solid ${borderColor}`, color: mutedColor }}
                      title={playlist.is_public ? 'Make private' : 'Make public'}>
                      {playlist.is_public ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
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