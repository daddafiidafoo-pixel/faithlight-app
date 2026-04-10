import React, { useState } from 'react';
import { X, Share2, Download, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function SermonArchivePlayer({ archive, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Video Player */}
        <div className="bg-black relative">
          {archive.video_url || archive.platform_url ? (
            <video
              controls
              autoPlay
              className="w-full aspect-video bg-black"
              src={archive.video_url || archive.platform_url}
            />
          ) : (
            <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
              <p className="text-gray-400">Video not available yet. Check back soon.</p>
            </div>
          )}
        </div>

        {/* Info & Actions */}
        <div className="bg-white p-6 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{archive.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(archive.recorded_date), 'MMMM d, yyyy · h:mm a')}
              </p>
              {archive.speaker_name && (
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Speaker:</strong> {archive.speaker_name}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="ml-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Description */}
          {archive.description && (
            <div className="mb-4">
              <p className="text-gray-700">{archive.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            {archive.duration_seconds > 0 && (
              <div>
                <p className="text-xs text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">
                  {formatDuration(archive.duration_seconds)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600">Platform</p>
              <p className="font-semibold text-gray-900 capitalize">
                {archive.streaming_platform}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Views</p>
              <p className="font-semibold text-gray-900">{archive.view_count || 0}</p>
            </div>
            {archive.file_size_mb && (
              <div>
                <p className="text-xs text-gray-600">File Size</p>
                <p className="font-semibold text-gray-900">
                  {archive.file_size_mb.toFixed(1)} MB
                </p>
              </div>
            )}
          </div>

          {/* Scripture References */}
          {archive.scripture_references?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Scripture References</h3>
              <div className="flex flex-wrap gap-2">
                {archive.scripture_references.map((ref, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {archive.tags?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {archive.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {archive.status === 'published' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={() => {
                  const shareUrl = archive.platform_url || archive.video_url;
                  if (navigator.share) {
                    navigator.share({
                      title: archive.title,
                      text: archive.description,
                      url: shareUrl,
                    });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link copied!');
                  }
                }}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              {archive.download_allowed && archive.video_url && (
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = archive.video_url;
                    link.download = `${archive.title}.mp4`;
                    link.click();
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
              {archive.platform_url && (
                <Button
                  onClick={() => window.open(archive.platform_url, '_blank')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  View on {archive.streaming_platform.charAt(0).toUpperCase() + archive.streaming_platform.slice(1)}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}