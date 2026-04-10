import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trash2, Download, HardDrive, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';

const STATUS_COLORS = {
  downloading: 'text-amber-600 bg-amber-50',
  ready: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
};

const TYPE_LABELS = {
  text_chapter: '📖 Bible Text',
  audio_chapter: '🎧 Bible Audio',
  lesson: '📚 Lesson',
  course: '🎓 Course',
  verse_set: '✨ Verse Set',
};

export default function OfflineDownloadsManager({ userId }) {
  const [items, setItems] = useState([]);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadOfflineItems();
    loadStorage();
  }, [userId]);

  const loadOfflineItems = async () => {
    try {
      const items = await base44.entities.OfflineItem.filter(
        { user_id: userId, status: 'ready' },
        '-created_date',
        100
      );
      setItems(items || []);
    } catch (err) {
      console.error('Error loading offline items:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStorage = async () => {
    try {
      const storage = await base44.entities.UserOfflineStorage.filter(
        { user_id: userId },
        '-created_date',
        1
      );
      if (storage.length > 0) setStorage(storage[0]);
    } catch (err) {
      console.error('Error loading storage info:', err);
    }
  };

  const handleDelete = async (itemId) => {
    setDeleting(itemId);
    try {
      await base44.entities.OfflineItem.delete(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      await loadStorage(); // Refresh storage
    } catch (err) {
      console.error('Error deleting offline item:', err);
    } finally {
      setDeleting(null);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
  };

  const usedPercent = storage ? (storage.used_bytes / storage.limit_bytes) * 100 : 0;
  const usedGB = storage ? (storage.used_bytes / 1073741824).toFixed(2) : '0';
  const limitGB = storage ? (storage.limit_bytes / 1073741824).toFixed(1) : '0.2';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Storage info */}
      {storage && (
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-500" /> Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {usedGB} GB of {limitGB} GB used
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(usedPercent)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usedPercent > 90 ? 'bg-red-500' :
                    usedPercent > 70 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usedPercent, 100)}%` }}
                />
              </div>
            </div>
            {usedPercent > 80 && (
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Storage is nearly full. Delete items you no longer need.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Downloads list */}
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Downloaded Content</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-6">
              <Download className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No downloads yet</p>
              <p className="text-xs text-gray-400 mt-1">Download Bible chapters, lessons, and more for offline reading.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                      <Badge className={`text-xs ${
                        item.status === 'ready' ? 'bg-green-100 text-green-700' :
                        item.status === 'downloading' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status === 'downloading' ? `${Math.round(item.progress || 0)}%` : 
                         item.status === 'ready' ? 'Ready' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{TYPE_LABELS[item.type] || item.type}</span>
                      <span>•</span>
                      <span>{formatBytes(item.size_bytes)}</span>
                    </div>
                    {item.status === 'downloading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div
                          className="h-1 rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${item.progress || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="text-gray-400 hover:text-red-600"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
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