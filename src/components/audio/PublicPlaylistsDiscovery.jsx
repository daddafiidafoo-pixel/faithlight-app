import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Play, Copy, Search, Music, User, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicPlaylistsDiscovery({ user, isDarkMode, onPlaylistSelect }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const { data: publicPlaylists = [], isLoading } = useQuery({
    queryKey: ['public-playlists'],
    queryFn: async () => {
      try {
        return await base44.entities.Playlist.filter({ is_public: true }, '-created_date', 50);
      } catch {
        return [];
      }
    },
  });

  const copyMutation = useMutation({
    mutationFn: async (playlist) => {
      if (!user?.id) throw new Error('Login required');
      return base44.entities.Playlist.create({
        user_id: user.id,
        title: `${playlist.title} (copy)`,
        description: playlist.description,
        items: playlist.items,
        tags: playlist.tags,
        translation: playlist.translation,
        item_count: playlist.item_count || 0,
        is_public: false,
        copied_from_id: playlist.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPlaylists', user?.id]);
      toast.success('Playlist copied to your library!');
    },
    onError: (e) => toast.error(e.message || 'Failed to copy'),
  });

  const filtered = publicPlaylists.filter((p) =>
    !search ||
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search public playlists…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-center py-6" style={{ color: mutedColor }}>Loading playlists…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm" style={{ color: mutedColor }}>
            {publicPlaylists.length === 0 ? 'No public playlists yet. Share one from My Playlists!' : 'No matching playlists.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((playlist) => (
            <div
              key={playlist.id}
              className="p-4 rounded-xl border"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                    <h4 className="font-semibold text-sm truncate" style={{ color: textColor }}>{playlist.title}</h4>
                  </div>
                  {playlist.description && (
                    <p className="text-xs mb-1 line-clamp-2" style={{ color: mutedColor }}>{playlist.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs" style={{ color: mutedColor }}>
                    {playlist.created_by && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {playlist.creator_name || 'Anonymous'}
                      </span>
                    )}
                    <span>{playlist.item_count || playlist.items?.length || 0} chapters</span>
                    {playlist.likes > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                        {playlist.likes}
                      </span>
                    )}
                  </div>
                  {playlist.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {playlist.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onPlaylistSelect?.(playlist)}
                    className="gap-1 text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Play className="w-3 h-3" />
                    Play
                  </Button>
                  {user && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyMutation.mutate(playlist)}
                      disabled={copyMutation.isPending}
                      className="gap-1 text-xs"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
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