import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import SermonArchiveCard from './SermonArchiveCard';
import SermonArchivePlayer from './SermonArchivePlayer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Grid, List } from 'lucide-react';

export default function SermonArchiveManager() {
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [filterStatus, setFilterStatus] = useState('published');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch archives
  const { data: archives, refetch } = useQuery({
    queryKey: ['sermonArchives', filterStatus, filterPlatform],
    queryFn: async () => {
      let query = {};
      if (filterStatus !== 'all') query.status = filterStatus;
      if (filterPlatform !== 'all') query.streaming_platform = filterPlatform;

      const results = await base44.entities.SermonArchive.filter(
        query,
        '-recorded_date',
        100
      );
      return results;
    },
  });

  // Filter by search
  const filteredArchives = archives?.filter((archive) =>
    archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    archive.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePlay = (archive) => {
    setSelectedArchive(archive);
  };

  const handleShare = async (archive) => {
    const shareUrl = archive.platform_url || archive.video_url;
    if (navigator.share) {
      navigator.share({
        title: archive.title,
        text: archive.description,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = (archive) => {
    if (archive.video_url) {
      const link = document.createElement('a');
      link.href = archive.video_url;
      link.download = `${archive.title}.mp4`;
      link.click();
    }
  };

  const handleDelete = async (archive) => {
    if (confirm(`Delete "${archive.title}"?`)) {
      await base44.entities.SermonArchive.delete(archive.id);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Modal */}
      {selectedArchive && (
        <SermonArchivePlayer
          archive={selectedArchive}
          onClose={() => setSelectedArchive(null)}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sermon Archive</h2>
        <p className="text-gray-600">View, manage, and share your saved sermon broadcasts</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search sermons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="recording">Recording</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Archives Grid/List */}
      {filteredArchives.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredArchives.map((archive) => (
            <SermonArchiveCard
              key={archive.id}
              archive={archive}
              onPlay={handlePlay}
              onShare={handleShare}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No sermons found. Start broadcasting to create archives!</p>
        </div>
      )}
    </div>
  );
}