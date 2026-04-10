import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineStorageIndicator({ isDarkMode, onStorageChange }) {
  const [totalSize, setTotalSize] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const updateStorage = async () => {
    try {
      const db = await openDB();
      const chapters = await db.getAll('downloads');
      let total = 0;
      chapters?.forEach(ch => {
        if (ch.audioData?.byteLength) total += ch.audioData.byteLength;
      });
      setTotalSize(total);
      setDownloadCount(chapters?.length || 0);
    } catch (error) {
      console.warn('Offline storage unavailable:', error.message);
      setTotalSize(0);
      setDownloadCount(0);
    }
  };

  const openDB = () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('FaithLightDB', 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  useEffect(() => {
    updateStorage();
  }, []);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all offline content? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      const db = await openDB();
      const tx = db.transaction('downloads', 'readwrite');
      await tx.objectStore('downloads').clear();
      setTotalSize(0);
      setDownloadCount(0);
      onStorageChange?.();
      toast.success('Offline storage cleared');
    } catch (error) {
      toast.warn('Offline storage not available');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card style={{ backgroundColor: cardColor, borderColor }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <HardDrive className="w-5 h-5" style={{ color: primaryColor }} />
          Offline Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
            <p className="text-sm" style={{ color: mutedColor }}>Used</p>
            <p className="text-lg font-bold mt-1" style={{ color: primaryColor }}>
              {formatSize(totalSize)}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
            <p className="text-sm" style={{ color: mutedColor }}>Downloaded</p>
            <p className="text-lg font-bold mt-1" style={{ color: primaryColor }}>
              {downloadCount} chapters
            </p>
          </div>
        </div>

        {/* Storage Bar */}
        <div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: bgColor }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                backgroundColor: primaryColor,
                width: Math.min((totalSize / (1024 * 1024 * 500)) * 100, 100) + '%'
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: mutedColor }}>
            {totalSize > 0 ? `~${(totalSize / (1024 * 1024)).toFixed(0)} MB used` : 'No downloads yet'}
          </p>
        </div>

        {/* Clear Button */}
        {downloadCount > 0 && (
          <Button
            onClick={handleClearAll}
            disabled={isDeleting}
            variant="outline"
            className="w-full gap-2"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Clearing...' : 'Clear All Storage'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}