import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  WifiOff, Wifi, HardDrive, RefreshCw, BookOpen, Headphones,
  FileText, Sparkles, Download, Trash2, CheckCircle2, Loader2,
  Clock, AlertCircle, ChevronRight, StickyNote, Wifi as WifiIcon
} from 'lucide-react';
import { toast } from 'sonner';

const formatBytes = (b) => {
  if (!b || b === 0) return '0 B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatRelativeTime = (iso) => {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

function SectionHeader({ icon: Icon, label, count, color = 'text-indigo-600 bg-indigo-50' }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="font-bold text-gray-800 text-sm">{label}</h2>
      {count != null && (
        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-medium">{count}</span>
      )}
    </div>
  );
}

function ItemRow({ title, subtitle, status, size, onDelete, linkTo }) {
  const statusEl = status === 'downloaded'
    ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
    : status === 'downloading'
    ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500 flex-shrink-0" />
    : status === 'failed'
    ? <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
    : <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />;

  const inner = (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {statusEl}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-gray-100 hover:border-indigo-100 transition-all group">
      {linkTo ? <Link to={linkTo} className="flex-1 min-w-0">{inner}</Link> : inner}
      <div className="flex items-center gap-2 flex-shrink-0">
        {size && <span className="text-xs text-gray-400">{formatBytes(size)}</span>}
        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function OfflineMode() {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(() => localStorage.getItem('fl_wifi_only') !== 'false');
  const [syncState, setSyncState] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  // Load sync state
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.OfflineSyncState.filter({ user_id: user.id }, '-updated_date', 1)
      .then(r => r.length > 0 && setSyncState(r[0]))
      .catch(() => {});
  }, [user?.id]);

  // Offline items from DB
  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['offlineItems', user?.id],
    queryFn: () => base44.entities.OfflineItem.filter({ user_id: user.id }, '-updated_date', 100),
    enabled: !!user?.id,
  });

  // Offline Bible books from OfflineLibrary entity (existing)
  const { data: bibleBooks = [] } = useQuery({
    queryKey: ['offlineLib', user?.id],
    queryFn: () => base44.entities.OfflineLibrary.filter({ user_id: user.id, content_type: 'bible_book' }, '-created_date'),
    enabled: !!user?.id,
  });

  // Saved sermons
  const { data: sermons = [] } = useQuery({
    queryKey: ['savedSermons', user?.id],
    queryFn: () => base44.entities.SermonOutline.filter({ user_id: user.id }, '-updated_date', 20),
    enabled: !!user?.id,
  });

  const bibleItems = items.filter(i => i.type === 'bible');
  const audioItems = items.filter(i => i.type === 'audio');
  const noteItems  = items.filter(i => i.type === 'note' || i.type === 'module');

  const totalStorage = [
    ...bibleBooks.reduce((s, b) => s + (b.file_size_bytes || 0), 0),
    ...items.reduce((s, i) => s + (i.file_size_bytes || 0), 0),
  ].reduce((a, b) => a + b, 0);

  const handleSync = async () => {
    if (!user || !isOnline) { toast.error('No internet connection'); return; }
    setSyncing(true);
    try {
      // Update sync state
      if (syncState?.id) {
        await base44.entities.OfflineSyncState.update(syncState.id, {
          last_synced_at: new Date().toISOString(),
          revision: (syncState.revision || 0) + 1,
        });
      } else {
        const created = await base44.entities.OfflineSyncState.create({
          user_id: user.id,
          device_id: localStorage.getItem('fl_device_id') || `device_${Date.now()}`,
          last_synced_at: new Date().toISOString(),
          revision: 1,
          wifi_only: wifiOnly,
        });
        if (!localStorage.getItem('fl_device_id')) localStorage.setItem('fl_device_id', created.device_id || `device_${Date.now()}`);
        setSyncState(created);
      }
      queryClient.invalidateQueries(['offlineItems', user?.id]);
      queryClient.invalidateQueries(['offlineLib', user?.id]);
      toast.success('Library synced!');
    } catch (e) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteItem = async (item) => {
    await base44.entities.OfflineItem.delete(item.id);
    refetch();
    toast.success(`"${item.title}" removed`);
  };

  const handleDeleteBible = async (book) => {
    await base44.entities.OfflineLibrary.delete(book.id);
    queryClient.invalidateQueries(['offlineLib', user?.id]);
    toast.success(`${book.book_name} removed`);
  };

  const toggleWifi = () => {
    const next = !wifiOnly;
    setWifiOnly(next);
    localStorage.setItem('fl_wifi_only', String(next));
    if (syncState?.id) {
      base44.entities.OfflineSyncState.update(syncState.id, { wifi_only: next }).catch(() => {});
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <WifiOff className="w-12 h-12 text-gray-300" />
        <p className="text-gray-600 font-medium">Sign in to manage your offline library</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${isOnline ? 'bg-indigo-600' : 'bg-amber-500'}`}>
              {isOnline ? <Wifi className="w-6 h-6 text-white" /> : <WifiOff className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Offline Library</h1>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Connected — content ready to download' : '⚠️ Offline Mode — limited features'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing || !isOnline}
              className="gap-2"
            >
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Sync Now
            </Button>
            <Link to={createPageUrl('OfflineLibrary')}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Download className="w-3.5 h-3.5" /> Manage Downloads
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-lg font-bold text-gray-900">{formatBytes(totalStorage)}</p>
                <p className="text-xs text-gray-500">Storage used</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-bold text-gray-900">{formatRelativeTime(syncState?.last_synced_at)}</p>
                <p className="text-xs text-gray-500">Last synced</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm col-span-2 sm:col-span-1">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <WifiIcon className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Wi-Fi Only</p>
                  <p className="text-xs text-gray-500">Download on Wi-Fi</p>
                </div>
              </div>
              <button
                onClick={toggleWifi}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${wifiOnly ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${wifiOnly ? 'left-6' : 'left-1'}`} />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Offline warning banner */}
        {!isOnline && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Offline Mode</span> — AI features, online search, and community posting are unavailable. You can still read downloaded content.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Downloaded Bibles ── */}
            <div>
              <SectionHeader icon={BookOpen} label="Downloaded Bibles" count={bibleBooks.length} color="text-indigo-600 bg-indigo-50" />
              {bibleBooks.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                  <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-3">No Bible translations downloaded yet</p>
                  <Link to={createPageUrl('OfflineLibrary')}>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                      <Download className="w-3.5 h-3.5" /> Download a Translation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {bibleBooks.map(b => (
                    <ItemRow
                      key={b.id}
                      title={b.book_name}
                      subtitle={`${b.translation} • ${formatBytes(b.file_size_bytes)}`}
                      status="downloaded"
                      linkTo={createPageUrl(`BibleReader?book=${encodeURIComponent(b.book_name)}&chapter=1`)}
                      onDelete={() => handleDeleteBible(b)}
                    />
                  ))}
                  <div className="text-right mt-2">
                    <Link to={createPageUrl('OfflineLibrary')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 justify-end">
                      Manage all translations <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Downloaded Audio ── */}
            <div>
              <SectionHeader icon={Headphones} label="Downloaded Audio" count={audioItems.length} color="text-purple-600 bg-purple-50" />
              {audioItems.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Headphones className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-3">No audio chapters downloaded</p>
                  <Link to={createPageUrl('AudioBibleV2')}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Headphones className="w-3.5 h-3.5" /> Browse Audio Bible
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {audioItems.map(item => (
                    <ItemRow
                      key={item.id}
                      title={item.title}
                      subtitle={item.version}
                      status={item.status}
                      size={item.file_size_bytes}
                      onDelete={() => handleDeleteItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Downloaded Study Materials ── */}
            <div>
              <SectionHeader icon={FileText} label="Study Materials" count={noteItems.length + sermons.length} color="text-green-600 bg-green-50" />
              <div className="space-y-1.5">
                {sermons.slice(0, 5).map(s => (
                  <ItemRow
                    key={s.id}
                    title={s.title}
                    subtitle={`Sermon • ${s.theme || ''}`}
                    status="downloaded"
                    linkTo={createPageUrl('AISermonBuilder')}
                  />
                ))}
                {noteItems.map(item => (
                  <ItemRow
                    key={item.id}
                    title={item.title}
                    subtitle={item.type}
                    status={item.status}
                    size={item.file_size_bytes}
                    onDelete={() => handleDeleteItem(item)}
                  />
                ))}
                {sermons.length === 0 && noteItems.length === 0 && (
                  <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                    <StickyNote className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 mb-3">No study materials saved offline</p>
                    <Link to={createPageUrl('AISermonBuilder')}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> Generate a Sermon Outline
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ── Quick links ── */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Quick Access</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Bible Reader',    page: 'BibleReader',     icon: BookOpen,   color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Audio Bible',     page: 'AudioBibleV2',    icon: Headphones, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Sermon Builder',  page: 'AISermonBuilder', icon: Sparkles,   color: 'text-amber-600 bg-amber-50' },
                    { label: 'Download Mgr',    page: 'OfflineLibrary',  icon: Download,   color: 'text-green-600 bg-green-50' },
                  ].map(l => (
                    <Link key={l.page} to={createPageUrl(l.page)}>
                      <div className={`flex flex-col items-center gap-2 p-3 rounded-xl ${l.color} hover:opacity-80 transition-opacity cursor-pointer text-center`}>
                        <l.icon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{l.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}