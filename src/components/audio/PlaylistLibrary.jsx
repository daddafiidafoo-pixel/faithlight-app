import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Music, Trash2, Play, Globe, GlobeLock } from 'lucide-react';
import { toast } from 'sonner';
import PlaylistCreator from './PlaylistCreator';
import PlaylistQueueViewer from './PlaylistQueueViewer';

export default function PlaylistLibrary({
  user,
  isDarkMode,
  currentTranslation,
  onPlaylistSelect
}) {
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  // Fetch user playlists
  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['userPlaylists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await base44.entities.Playlist.filter({
          user_id: user.id
        }, '-created_date', 50);
      } catch {
        return [];
      }
    },
    enabled: !!user
  });

  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId) => {
      return base44.entities.Playlist.delete(playlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists', user?.id] });
      toast.success('Playlist deleted');
    },
    onError: () => {
      toast.error('Failed to delete playlist');
    }
  });

  const togglePublicMutation = useMutation({
    mutationFn: ({ id, is_public }) => base44.entities.Playlist.update(id, { is_public }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['userPlaylists', user?.id] });
      queryClient.invalidateQueries(['public-playlists']);
      toast.success(vars.is_public ? 'Playlist is now public!' : 'Playlist set to private');
    },
  });

  const handleDeletePlaylist = (playlistId) => {
    if (!confirm('Delete this playlist?')) return;
    deletePlaylistMutation.mutate(playlistId);
  };

  if (!user) {
    return (
      <Card style={{ backgroundColor: cardColor, borderColor }}>
        <CardContent className="pt-6 text-center">
          <p style={{ color: mutedColor }}>Log in to create and manage playlists</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Playlist Button */}
      <PlaylistCreator
        user={user}
        isDarkMode={isDarkMode}
        currentTranslation={currentTranslation}
        onPlaylistCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['userPlaylists', user?.id] });
        }}
      />

      {/* Playlists List */}
      {isLoading ? (
        <p style={{ color: mutedColor }}>Loading playlists...</p>
      ) : playlists.length === 0 ? (
        <Card style={{ backgroundColor: cardColor, borderColor }}>
          <CardContent className="pt-6 text-center">
            <Music className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor, opacity: 0.5 }} />
            <p style={{ color: mutedColor }}>No playlists yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {playlists.map(playlist => (
            <Card
              key={playlist.id}
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle style={{ color: textColor }}>{playlist.title}</CardTitle>
                    {playlist.description && (
                      <p className="text-sm mt-1" style={{ color: mutedColor }}>
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Button
                      size="sm"
                      onClick={() => onPlaylistSelect?.(playlist)}
                      className="gap-1"
                      style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublicMutation.mutate({ id: playlist.id, is_public: !playlist.is_public })}
                      title={playlist.is_public ? 'Make private' : 'Share publicly'}
                      className="gap-1 text-xs"
                    >
                      {playlist.is_public ? <Globe className="w-3.5 h-3.5 text-green-600" /> : <GlobeLock className="w-3.5 h-3.5 text-gray-400" />}
                      {playlist.is_public ? 'Public' : 'Private'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      variant="outline"
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: mutedColor }}>
                    {playlist.item_count} items
                  </span>
                  <span style={{ color: mutedColor }}>
                    {playlist.translation}
                  </span>
                </div>

                {/* Tags */}
                {playlist.tags && playlist.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {playlist.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                      >
                        {tag}
                      </span>
                    ))}
                    {playlist.tags.length > 2 && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: borderColor, color: mutedColor }}>
                        +{playlist.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Quick items preview */}
                <div className="mt-3 space-y-1">
                  {playlist.items?.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className="text-xs" style={{ color: mutedColor }}>
                      {idx + 1}. {item.book} {item.chapter}
                    </div>
                  ))}
                  {playlist.items?.length > 3 && (
                    <div className="text-xs" style={{ color: mutedColor }}>
                      ... and {playlist.items.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}