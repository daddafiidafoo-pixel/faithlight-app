import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Trash2, BookOpen, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function OfflineBibleManager() {
  const [downloads, setDownloads] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('bible_dark_mode') === 'true';
    setIsDarkMode(darkMode);
    loadDownloads();
  }, []);

  const loadDownloads = () => {
    const metadata = JSON.parse(localStorage.getItem('bible_downloads') || '{}');
    const downloadList = Object.values(metadata);
    setDownloads(downloadList);
    
    // Calculate approximate storage size
    let size = 0;
    downloadList.forEach(item => {
      // Rough estimate: ~100 bytes per verse
      size += (item.verseCount || 0) * 100;
    });
    setTotalSize(size);
  };

  const removeDownload = (item) => {
    if (!confirm(`Remove ${item.type === 'book' ? 'entire book' : 'chapter'} from offline storage?`)) return;

    if (item.type === 'chapter') {
      const key = `bible_${item.book}_${item.chapter}_${item.translation}`;
      localStorage.removeItem(key);
    } else if (item.type === 'book') {
      const key = `bible_book_${item.book}_${item.translation}`;
      localStorage.removeItem(key);
    }
    
    // Update metadata
    const metadata = JSON.parse(localStorage.getItem('bible_downloads') || '{}');
    const metaKey = item.type === 'book' 
      ? `${item.book}_all_${item.translation}`
      : `${item.book}_${item.chapter}_${item.translation}`;
    delete metadata[metaKey];
    localStorage.setItem('bible_downloads', JSON.stringify(metadata));
    
    loadDownloads();
    toast.success('Removed from offline storage');
  };

  const clearAll = () => {
    if (!confirm('Remove all offline Bible content? This cannot be undone.')) return;
    
    downloads.forEach(item => {
      if (item.type === 'chapter') {
        localStorage.removeItem(`bible_${item.book}_${item.chapter}_${item.translation}`);
      } else if (item.type === 'book') {
        localStorage.removeItem(`bible_book_${item.book}_${item.translation}`);
      }
    });
    
    localStorage.removeItem('bible_downloads');
    loadDownloads();
    toast.success('All offline content removed');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStoragePercentage = () => {
    const maxStorage = 50 * 1024 * 1024; // 50 MB estimate
    return Math.min((totalSize / maxStorage) * 100, 100);
  };

  const groupByBook = () => {
    const grouped = {};
    downloads.forEach(item => {
      if (!grouped[item.book]) {
        grouped[item.book] = [];
      }
      grouped[item.book].push(item);
    });
    return grouped;
  };

  const bgColor = isDarkMode ? '#0F1411' : '#F9FAFB';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';

  const groupedDownloads = groupByBook();

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: textColor }}>
              <HardDrive className="w-8 h-8" style={{ color: primaryColor }} />
              Offline Bible Storage
            </h1>
            <Link to={createPageUrl('BibleReader')}>
              <Button variant="outline" style={{ borderColor: borderColor, color: primaryColor }}>
                <BookOpen className="w-4 h-4 mr-2" />
                Back to Reader
              </Button>
            </Link>
          </div>
          <p className="text-sm" style={{ color: mutedColor }}>
            Manage your downloaded Bible content for offline reading
          </p>
        </div>

        {/* Storage Overview Card */}
        <Card className="mb-6" style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
          <CardHeader>
            <CardTitle style={{ color: textColor }}>Storage Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: textColor }}>
                  Space Used
                </span>
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                  {formatSize(totalSize)} / ~50 MB
                </span>
              </div>
              <Progress value={getStoragePercentage()} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: borderColor }}>
              <div>
                <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {downloads.length}
                </p>
                <p className="text-xs" style={{ color: mutedColor }}>Total Downloads</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {downloads.reduce((acc, d) => acc + (d.verseCount || 0), 0)}
                </p>
                <p className="text-xs" style={{ color: mutedColor }}>Verses</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {Object.keys(groupedDownloads).length}
                </p>
                <p className="text-xs" style={{ color: mutedColor }}>Books</p>
              </div>
            </div>

            {downloads.length > 0 && (
              <Button
                onClick={clearAll}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Downloads
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
            <CardContent className="py-16">
              <div className="text-center">
                <Download className="w-16 h-16 mx-auto mb-4" style={{ color: borderColor }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                  No Offline Content Yet
                </h3>
                <p className="text-sm mb-6" style={{ color: mutedColor }}>
                  Start downloading Bible chapters or books from the Bible Reader
                </p>
                <Link to={createPageUrl('BibleReader')}>
                  <Button style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Go to Bible Reader
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDownloads).map(([bookName, items]) => (
              <Card key={bookName} style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
                      <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
                      {bookName}
                    </CardTitle>
                    <Badge variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                      {items.length} {items.length === 1 ? 'download' : 'downloads'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border flex items-center justify-between hover:shadow-sm transition-shadow"
                        style={{ borderColor: borderColor }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold" style={{ color: textColor }}>
                              {item.type === 'chapter' ? `Chapter ${item.chapter}` : 'Full Book'}
                            </span>
                            <Badge className="text-xs" style={{ backgroundColor: primaryColor, color: '#FFF' }}>
                              {item.translation}
                            </Badge>
                            {item.type === 'book' && (
                              <Badge variant="secondary" className="text-xs">
                                {item.chapterCount} chapters
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs" style={{ color: mutedColor }}>
                            <span>{item.verseCount} verses</span>
                            <span>•</span>
                            <span>{formatSize(item.verseCount * 100)}</span>
                            <span>•</span>
                            <span>Downloaded {new Date(item.downloadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDownload(item)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <Card className="mt-6" style={{ backgroundColor: isDarkMode ? '#1A2820' : '#F0FDF4', border: `1px solid ${isDarkMode ? '#2A3F32' : '#BBF7D0'}` }}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: '#22C55E' }} />
              <div>
                <p className="font-medium text-sm mb-1" style={{ color: textColor }}>
                  How Offline Reading Works
                </p>
                <p className="text-xs" style={{ color: mutedColor }}>
                  Downloaded content is stored locally on your device. You can read downloaded chapters and books even without an internet connection. 
                  Note: Highlights and notes require an internet connection to sync across devices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}