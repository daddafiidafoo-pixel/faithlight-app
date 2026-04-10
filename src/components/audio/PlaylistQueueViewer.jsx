import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function PlaylistQueueViewer({
  playlist,
  isDarkMode,
  onPlaylistItemSelect,
  currentPlaying
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  if (!playlist) return null;

  return (
    <Card style={{ backgroundColor: cardColor, borderColor }}>
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <CardTitle style={{ color: textColor }}>{playlist.title}</CardTitle>
          <p className="text-xs mt-1" style={{ color: mutedColor }}>
            {playlist.item_count} items • {playlist.translation}
          </p>
        </div>
        <ChevronDown
          className="w-5 h-5"
          style={{
            color: primaryColor,
            transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
            transition: 'transform 0.2s'
          }}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {playlist.description && (
            <p className="text-sm mb-3" style={{ color: mutedColor }}>
              {playlist.description}
            </p>
          )}

          <div className="space-y-2">
            {playlist.items?.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  currentPlaying?.id === item.id ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: currentPlaying?.id === item.id ? primaryColor : bgColor,
                  borderColor: currentPlaying?.id === item.id ? primaryColor : borderColor,
                  color: currentPlaying?.id === item.id ? '#FFFFFF' : textColor
                }}
              >
                <div>
                  <p className="font-semibold text-sm">
                    {idx + 1}. {item.book} {item.chapter}
                    {item.endVerse ? `:${item.startVerse}-${item.endVerse}` : item.startVerse !== 1 ? `:${item.startVerse}+` : ''}
                  </p>
                  <p className="text-xs" style={{ opacity: 0.7 }}>
                    {item.translation}
                  </p>
                </div>
                <button
                  onClick={() => onPlaylistItemSelect?.(item)}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}