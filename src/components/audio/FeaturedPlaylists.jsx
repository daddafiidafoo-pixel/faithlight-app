import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Play, Music } from 'lucide-react';

export default function FeaturedPlaylists({ isDarkMode, onPlaylistSelect }) {
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const { data: featuredPlaylists = [], isLoading } = useQuery({
    queryKey: ['featuredPlaylists'],
    queryFn: async () => {
      try {
        return await base44.entities.Playlist.filter({
          is_public: true
        }, '-created_date', 10);
      } catch {
        return [];
      }
    }
  });

  if (isLoading) {
    return (
      <Card style={{ backgroundColor: cardColor, borderColor }}>
        <CardContent className="pt-6 text-center">
          <p style={{ color: mutedColor }}>Loading featured playlists...</p>
        </CardContent>
      </Card>
    );
  }

  if (featuredPlaylists.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
        📚 Curated Playlists
      </h2>
      <p className="text-sm mb-6" style={{ color: mutedColor }}>
        Explore hand-picked playlists to deepen your Bible study and spiritual growth.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredPlaylists.map(playlist => (
          <Card
            key={playlist.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            {/* Cover Image or Default Background */}
            <div
              className="h-32 flex items-center justify-center text-white"
              style={{
                backgroundImage: playlist.cover_image_url
                  ? `url(${playlist.cover_image_url})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!playlist.cover_image_url && (
                <Music className="w-12 h-12 opacity-40" />
              )}
            </div>

            <CardHeader>
              <CardTitle className="text-base" style={{ color: textColor }}>
                {playlist.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Description */}
                {playlist.description && (
                  <p className="text-xs" style={{ color: mutedColor }}>
                    {playlist.description.substring(0, 80)}
                    {playlist.description.length > 80 ? '...' : ''}
                  </p>
                )}

                {/* Playlist Stats */}
                <div className="flex items-center justify-between text-xs" style={{ color: mutedColor }}>
                  <span>{playlist.item_count} items</span>
                  <span>{playlist.category}</span>
                </div>

                {/* Tags */}
                {playlist.tags && playlist.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {playlist.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: primaryColor,
                          color: '#FFFFFF'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {playlist.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: borderColor, color: mutedColor }}>
                        +{playlist.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Play Button */}
                <Button
                  onClick={() => onPlaylistSelect?.(playlist)}
                  className="w-full gap-2"
                  style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                >
                  <Play className="w-4 h-4" />
                  Play Playlist
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}