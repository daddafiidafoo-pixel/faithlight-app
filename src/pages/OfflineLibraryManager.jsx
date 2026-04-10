import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, HardDrive, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/components/lib/offline/offlineLimits';
import {
  ensureStorageState, recalcUsedBytes, deleteOfflineItem,
  checkOfflineUpdates, applyOfflineUpdates
} from '@/components/lib/offline/offlineManager';
import { toast } from 'sonner';

export default function OfflineLibraryManager() {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [storageState, setStorageState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (me?.id) refresh();
  }, [me?.id]);

  async function refresh() {
    setLoading(true);
    try {
      await recalcUsedBytes(me);
      const [s, list] = await Promise.all([
        ensureStorageState(me),
        base44.entities.OfflineItem.filter({ user_id: me.id }, '-updated_date', 2000).catch(() => []),
      ]);
      setStorageState(s);
      setItems(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const used = Number(storageState?.used_bytes || 0);
  const limit = Number(storageState?.limit_bytes || 1);
  const pct = Math.min(100, Math.round((used / limit) * 100));

  async function onDelete(id) {
    if (!confirm('Delete this offline item?')) return;
    try {
      await deleteOfflineItem(me, id);
      toast.success('Deleted.');
      await refresh();
    } catch { toast.error('Delete failed.'); }
  }

  async function onSyncCheck() {
    setSyncBusy(true);
    try {
      const c = await checkOfflineUpdates(me);
      setUpdates(c || []);
      setSelected(new Set((c || []).map(x => x.offlineItem.id)));
      if (!c?.length) toast.success('Everything is up to date!');
    } catch { toast.error('Sync check failed.'); }
    finally { setSyncBusy(false); }
  }

  async function onApplyUpdates() {
    if (!selected.size) return;
    setSyncBusy(true);
    try {
      await applyOfflineUpdates(me, Array.from(selected));
      toast.success('Updates applied!');
      setUpdates([]);
      setSelected(new Set());
      await refresh();
    } catch (e) {
      if (String(e?.message).includes('LIMIT_EXCEEDED')) {
        toast.error('Not enough storage. Delete some downloads first.');
      } else {
        toast.error('Update failed.');
      }
    } finally { setSyncBusy(false); }
  }

  if (!me) return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline Library</h1>
          <p className="text-sm text-gray-500">Manage downloaded lessons, courses, and Bible content</p>
        </div>
      </div>

      {/* Storage Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Storage</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSyncCheck} disabled={syncBusy} className="gap-1">
                {syncBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Sync Updates
              </Button>
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse" /> : (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Used: <span className="font-semibold text-gray-900">{formatBytes(used)}</span></span>
                <span className="text-gray-600">Limit: <span className="font-semibold text-gray-900">{formatBytes(limit)}</span></span>
                <span className={`font-semibold ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'}`}>{pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-2.5 rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${pct}%` }} />
              </div>
              {pct >= 80 && (
                <div className="flex items-center gap-2 mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Approaching storage limit. Consider deleting older downloads.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Updates available */}
      {updates.length > 0 && (
        <Card className="border-indigo-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-indigo-800">Updates Available</CardTitle>
                <CardDescription>{updates.length} item(s) have newer versions</CardDescription>
              </div>
              <Button size="sm" onClick={onApplyUpdates} disabled={syncBusy || !selected.size} className="bg-indigo-600 hover:bg-indigo-700">
                {syncBusy ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Update selected ({selected.size})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {updates.map(u => (
              <label key={u.offlineItem.id} className="flex items-start gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={selected.has(u.offlineItem.id)}
                  onChange={e => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(u.offlineItem.id); else next.delete(u.offlineItem.id);
                    setSelected(next);
                  }}
                  className="mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{u.offlineItem.title}</p>
                  <p className="text-xs text-gray-500">{u.reason}</p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Downloaded Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Downloaded Items</CardTitle>
          <CardDescription>Delete items to free up storage space</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <HardDrive className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No downloads yet.</p>
              <p className="text-xs mt-1">Download lessons or courses for offline access.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{it.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {it.type} • {it.status} • {formatBytes(it.size_bytes || 0)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(it.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
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