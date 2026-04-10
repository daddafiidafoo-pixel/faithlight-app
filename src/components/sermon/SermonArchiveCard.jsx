import React from 'react';
import { Download, Share2, Eye, MoreVertical, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function SermonArchiveCard({
  archive,
  onPlay,
  onDownload,
  onShare,
  onDelete,
}) {
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${secs}s`;
  };

  const getPlatformBadge = () => {
    const colors = {
      youtube: 'bg-red-100 text-red-700',
      facebook: 'bg-blue-100 text-blue-700',
      internal: 'bg-purple-100 text-purple-700',
    };
    return colors[archive.streaming_platform] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = () => {
    const colors = {
      recording: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[archive.status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative bg-gray-200 h-40 flex items-center justify-center cursor-pointer group">
        {archive.thumbnail_url ? (
          <img
            src={archive.thumbnail_url}
            alt={archive.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Play className="w-12 h-12 text-gray-400" />
        )}
        <button
          onClick={() => onPlay?.(archive)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
        >
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Date */}
        <h3 className="font-semibold text-gray-900 truncate">{archive.title}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(archive.recorded_date), 'MMM d, yyyy · h:mm a')}
        </p>

        {/* Description */}
        {archive.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{archive.description}</p>
        )}

        {/* Badges */}
        <div className="flex gap-2 mt-3">
          <span className={`text-xs font-medium px-2 py-1 rounded ${getPlatformBadge()}`}>
            {archive.streaming_platform.charAt(0).toUpperCase() + archive.streaming_platform.slice(1)}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadge()}`}>
            {archive.status.charAt(0).toUpperCase() + archive.status.slice(1)}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
          <div className="flex gap-3">
            {archive.duration_seconds > 0 && (
              <span>{formatDuration(archive.duration_seconds)}</span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {archive.view_count || 0}
            </span>
          </div>
          {archive.file_size_mb && (
            <span>{(archive.file_size_mb).toFixed(1)} MB</span>
          )}
        </div>

        {/* Action Buttons */}
        {archive.status === 'published' && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPlay?.(archive)}
              className="flex-1 text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Watch
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onShare?.(archive)}
              className="flex-1 text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
            {archive.download_allowed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload?.(archive)}
                className="flex-1 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDelete?.(archive)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}