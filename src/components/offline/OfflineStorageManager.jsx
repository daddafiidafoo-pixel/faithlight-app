import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 KB';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

export default function OfflineStorageManager({ userId }) {
  const [downloads, setDownloads] = useState([]);
  const [storageLimit] = useState(209715200); // 200MB default
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const items = await base44.entities.OfflineItem.filter({ user_id: userId });
        setDownloads(items || []);
      } catch (error) {
        console.error('Failed to load offline items:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const totalUsed = downloads.reduce((sum, item) => sum + (item.size_bytes || 0), 0);
  const percentage = Math.round((totalUsed / storageLimit) * 100);
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 95;

  const handleDelete = async (itemId) => {
    setDeleting(itemId);
    try {
      await base44.entities.OfflineItem.delete(itemId);
      setDownloads((prev) => prev.filter((d) => d.id !== itemId));
      toast.success('Offline pack removed');
    } catch (error) {
      toast.error('Failed to remove pack');
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all offline content? This cannot be undone.')) return;
    setLoading(true);
    try {
      await Promise.all(downloads.map((d) => base44.entities.OfflineItem.delete(d.id)));
      setDownloads([]);
      toast.success('All offline content cleared');
    } catch (error) {
      toast.error('Failed to clear offline content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Storage Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="w-4 h-4 text-indigo-600" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">{formatBytes(totalUsed)}</span>
              <span className="text-gray-500">{formatBytes(storageLimit)} limit</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{percentage}% used</p>
          </div>

          {isNearLimit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">
                {isAtLimit ? 'Storage limit almost reached.' : 'Storage usage is high.'}
                Remove unused packs to free up space.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloaded Packs */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-3">
          <CardTitle className="text-base">Downloaded Packs ({downloads.length})</CardTitle>
          {downloads.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAll}
              disabled={loading}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <HardDrive className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No offline content downloaded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {downloads.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <p className="font-medium text-gray-800 truncate">{item.title}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.type} • {formatBytes(item.size_bytes)} • Updated{' '}
                      {item.version || 'recently'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 gap-1 ml-2 flex-shrink-0"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}