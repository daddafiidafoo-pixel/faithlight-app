import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineContentManager({ isDarkMode = false }) {
  const [downloads, setDownloads] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
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
    if (!confirm('Remove all offline Bible content?')) return;
    
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
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const bgColor = isDarkMode ? '#0F1411' : '#F9FAFB';

  return (
    <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
            <HardDrive className="w-5 h-5" style={{ color: primaryColor }} />
            Offline Bible Content
          </CardTitle>
          {downloads.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Storage Info */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: textColor }}>Storage Used</span>
              <span className="text-sm font-bold" style={{ color: primaryColor }}>
                {formatSize(totalSize)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: mutedColor }}>
              <span>{downloads.length} items downloaded</span>
              <span>{downloads.reduce((acc, d) => acc + (d.verseCount || 0), 0)} verses</span>
            </div>
          </div>

          {/* Download List */}
          {downloads.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: borderColor }} />
              <p className="text-sm" style={{ color: mutedColor }}>
                No offline content yet. Download chapters or books from the Bible Reader.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {downloads.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border flex items-center justify-between"
                  style={{ borderColor: borderColor }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm" style={{ color: textColor }}>
                        {item.book}
                        {item.type === 'chapter' && ` ${item.chapter}`}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.translation}
                      </Badge>
                      {item.type === 'book' && (
                        <Badge className="text-xs" style={{ backgroundColor: primaryColor, color: '#FFF' }}>
                          Full Book
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: mutedColor }}>
                      {item.verseCount} verses • {new Date(item.downloadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDownload(item)}
                    className="h-8 w-8 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}