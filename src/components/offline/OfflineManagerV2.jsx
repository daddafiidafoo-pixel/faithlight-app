import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Trash2, Loader2, AlertCircle, RefreshCw, BookOpen, Headphones, GraduationCap, BookMarked } from 'lucide-react';

// Tier limits in bytes
const TIER_LIMITS = { FREE: 200 * 1024 * 1024, BASIC: 1024 * 1024 * 1024, PREMIUM: 5 * 1024 * 1024 * 1024 };

const TYPE_ICONS = {
  text_chapter: BookOpen,
  audio_chapter: Headphones,
  lesson: BookMarked,
  course: GraduationCap,
  verse_set: BookOpen,
};

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OfflineManagerV2({ userPlan = 'FREE' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updateCandidates, setUpdateCandidates] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUpdates, setSelectedUpdates] = useState([]);

  const limit = TIER_LIMITS[userPlan] || TIER_LIMITS.FREE;
  const usedBytes = items.reduce((sum, it) => sum + (it.size_bytes || 0), 0);
  const usedPercent = Math.min((usedBytes / limit) * 100, 100);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      if (!me) return;
      const data = await base44.entities.OfflineItem.filter({ user_id: me.id }, '-created_date', 200);
      setItems(data || []);
    } catch (err) {
      console.error('Load offline items error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (item) => {
    if (!confirm(`Remove "${item.title}" from offline storage?`)) return;
    await base44.entities.OfflineItem.delete(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  const checkForUpdates = async () => {
    setSyncing(true);
    try {
      const { data } = await base44.functions.invoke('checkOfflineUpdates', {
        item_ids: items.map(i => i.id),
      });
      const candidates = data?.candidates || [];
      setUpdateCandidates(candidates);
      setSelectedUpdates(candidates.map(c => c.id));
      if (candidates.length > 0) setShowUpdateModal(true);
      else alert('All content is up to date!');
    } catch (err) {
      console.error('Check updates error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const runUpdates = async () => {
    setShowUpdateModal(false);
    setSyncing(true);
    try {
      await base44.functions.invoke('runOfflineUpdates', {
        item_ids: selectedUpdates,
      });
      await loadItems();
    } catch (err) {
      console.error('Run updates error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const grouped = items.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Storage meter */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Offline Storage</span>
          </div>
          <span className="text-sm text-gray-500">{formatBytes(usedBytes)} / {formatBytes(limit)}</span>
        </div>
        <Progress value={usedPercent} className="h-2" />
        {usedPercent > 80 && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-xs text-amber-700">Storage nearly full — delete content to free space</p>
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={checkForUpdates} disabled={syncing} className="gap-2">
            {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Sync Updates
          </Button>
        </div>
      </Card>

      {/* Downloaded content by type */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Loading downloads…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No content downloaded yet</div>
      ) : (
        Object.entries(grouped).map(([type, typeItems]) => {
          const Icon = TYPE_ICONS[type] || BookOpen;
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-gray-800 text-sm capitalize">{type.replace('_', ' ')}s</h3>
                <Badge variant="secondary" className="text-xs">{typeItems.length}</Badge>
              </div>
              <div className="space-y-2">
                {typeItems.map(item => (
                  <Card key={item.id} className="p-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title || item.key}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatBytes(item.size_bytes || 0)}</span>
                        {item.status === 'downloading' && (
                          <Badge className="text-xs bg-blue-100 text-blue-700">Downloading</Badge>
                        )}
                        {item.status === 'failed' && (
                          <Badge className="text-xs bg-red-100 text-red-700">Failed</Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteItem(item)} className="text-red-500 hover:bg-red-50 flex-shrink-0 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Update candidates modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Updates Available ({updateCandidates.length})</h3>
            <p className="text-sm text-gray-500">Select content to update:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {updateCandidates.map(c => (
                <label key={c.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUpdates.includes(c.id)}
                    onChange={() => setSelectedUpdates(prev =>
                      prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                    )}
                    className="rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{c.type}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={runUpdates} disabled={selectedUpdates.length === 0} className="flex-1">
                Update Selected
              </Button>
              <Button variant="outline" onClick={() => setShowUpdateModal(false)} className="flex-1">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}