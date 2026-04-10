import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Download, Share2, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AudioPlaylistManager({ userId }) {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, [userId]);

  const fetchPlaylists = async () => {
    try {
      const userPlaylists = await base44.entities.AudioPlaylist.filter(
        { user_id: userId },
        '-updated_date',
        50
      );
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      const playlist = await base44.entities.AudioPlaylist.create({
        user_id: userId,
        title: newPlaylistName,
        description: newPlaylistDesc,
      });
      setPlaylists([playlist, ...playlists]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await base44.entities.AudioPlaylist.delete(playlistId);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const toggleOfflineDownload = async (playlistId, isOffline) => {
    try {
      await base44.entities.AudioPlaylist.update(playlistId, {
        is_offline_available: !isOffline,
      });
      setPlaylists(playlists.map(p =>
        p.id === playlistId ? { ...p, is_offline_available: !isOffline } : p
      ));
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Audio Playlists</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Name
                </label>
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g., Gospel of John Study"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Optional playlist description..."
                  className="min-h-20"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setOpenDialog(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createPlaylist}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={!newPlaylistName.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-gray-500">Loading playlists...</p>
        ) : playlists.length > 0 ? (
          playlists.map(playlist => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{playlist.title}</CardTitle>
                    {playlist.description && (
                      <p className="text-sm text-gray-600 mt-1">{playlist.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Playlist Stats */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{playlist.item_count || 0} tracks</p>
                  <p>{playlist.total_duration_minutes || 0} minutes total</p>
                </div>

                {/* Offline Status */}
                {playlist.is_offline_available && (
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                    ✓ Offline Available
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => toggleOfflineDownload(playlist.id, playlist.is_offline_available)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Download className="w-3 h-3" />
                    {playlist.is_offline_available ? 'Downloaded' : 'Download'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Play
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </Button>
                  <Button
                    onClick={() => deletePlaylist(playlist.id)}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500">No playlists yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}