import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HardDrive, Trash2, RefreshCw, BookOpen, Download, CheckCircle2, AlertCircle, Loader, Search, SortAsc } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineLibraryManager({ user, isOnline }) {
  const [showNotes, setShowNotes] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState(null);
  const [notes, setNotes] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const queryClient = useQueryClient();

  // Fetch offline library
  const { data: offlineLibrary = [], isLoading } = useQuery({
    queryKey: ['offlineLibrary', user?.id],
    queryFn: () =>
      user?.id
        ? base44.entities.OfflineLibrary.filter(
            { user_id: user.id },
            '-created_date',
            100
          )
        : [],
    enabled: !!user?.id,
    refetchInterval: isOnline ? 10000 : false
  });

  // Sync mutations
  const syncMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.OfflineLibrary.update(id, {
        is_synced: true,
        last_synced_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['offlineLibrary', user?.id]);
      toast.success('Download synced to account');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OfflineLibrary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['offlineLibrary', user?.id]);
      toast.success('Download deleted from library');
    }
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }) =>
      base44.entities.OfflineLibrary.update(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['offlineLibrary', user?.id]);
      toast.success('Notes saved');
      setShowNotes(false);
    }
  });

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && !syncing) {
      const unsynced = offlineLibrary.filter((d) => !d.is_synced);
      if (unsynced.length > 0) {
        setSyncing(true);
        unsynced.forEach((download) => {
          syncMutation.mutate(download.id);
        });
        setTimeout(() => setSyncing(false), 2000);
      }
    }
  }, [isOnline]);

  // Calculate total storage (also count localStorage-based chapters)
  const localKeys = Object.keys(localStorage).filter((k) => k.startsWith('offline_bible_'));
  const localStorageMB = Math.round(localKeys.length * 0.05 * 100) / 100; // ~50KB per chapter estimate

  const totalStorage = offlineLibrary.reduce((sum, d) => sum + (d.storage_size_mb || 0), 0) + localStorageMB;

  // Filter and sort
  const filtered = offlineLibrary
    .filter((d) => {
      if (!search) return true;
      return (
        (d.book || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.translation || '').toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === 'book') return (a.book || '').localeCompare(b.book || '');
      if (sortBy === 'translation') return (a.translation || '').localeCompare(b.translation || '');
      if (sortBy === 'size') return (b.storage_size_mb || 0) - (a.storage_size_mb || 0);
      // date (default)
      return new Date(b.created_date || 0) - new Date(a.created_date || 0);
    });

  const handleEditNotes = (download) => {
    setSelectedDownload(download);
    setNotes(download.notes || '');
    setShowNotes(true);
  };

  const handleSaveNotes = () => {
    if (selectedDownload) {
      updateNotesMutation.mutate({ id: selectedDownload.id, notes });
    }
  };

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    downloading: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    completed: <CheckCircle2 className="w-4 h-4" />,
    downloading: <Download className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Offline Library
            </CardTitle>
            {isOnline && syncing && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Loader className="w-4 h-4 animate-spin" />
                Syncing...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Usage */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-lg font-bold text-gray-900">{Math.round(totalStorage)} MB</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${Math.min((totalStorage / 1000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {offlineLibrary.length} books downloaded • {Math.round(totalStorage)} MB total
            </p>
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search downloads…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="book">By Book</SelectItem>
                <SelectItem value="translation">By Translation</SelectItem>
                <SelectItem value="size">By Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Library List */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : offlineLibrary.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No downloads yet. Start downloading a book for offline access.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">No downloads match your search.</p>
              ) : null}
              {filtered.map((download) => (
                <div key={download.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{download.book}</h4>
                      <p className="text-xs text-gray-600">
                        {download.chapters_downloaded?.length || 0} of {download.total_chapters} chapters •{' '}
                        {download.storage_size_mb} MB • {download.translation}
                      </p>
                    </div>
                    <Badge className={statusColors[download.download_status]}>
                      {statusIcons[download.download_status] && (
                        <span className="mr-1">{statusIcons[download.download_status]}</span>
                      )}
                      {download.download_status}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  {download.download_status !== 'completed' && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{download.download_progress_percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all"
                          style={{ width: `${download.download_progress_percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes Preview */}
                  {download.notes && (
                    <p className="text-xs text-gray-600 italic mb-2">"{download.notes}"</p>
                  )}

                  {/* Sync Status */}
                  {!download.is_synced && isOnline && (
                    <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                      <AlertCircle className="w-3 h-3" />
                      Pending sync
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditNotes(download)}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                    >
                      {download.notes ? 'Edit Notes' : 'Add Notes'}
                    </Button>
                    {!download.is_synced && isOnline && (
                      <Button
                        onClick={() => syncMutation.mutate(download.id)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Sync
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        if (window.confirm('Delete this download?')) {
                          deleteMutation.mutate(download.id);
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Notes - {selectedDownload?.book}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Add personal notes or reminders about this book..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Save Notes
              </Button>
              <Button onClick={() => setShowNotes(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}