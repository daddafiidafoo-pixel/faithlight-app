import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Music, Edit2, Trash2, Play, Pause, Volume2, X, ChevronRight } from 'lucide-react';

export default function BiblePlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playingVerse, setPlayingVerse] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Load current user
  useEffect(() => {
    base44.auth.me()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  // Load playlists
  useEffect(() => {
    if (!currentUser?.email) return;
    setLoading(true);
    base44.entities.BiblePlaylist.filter({ user_email: currentUser.email }, '-created_date', 100)
      .then(data => setPlaylists(data || []))
      .catch(() => setPlaylists([]))
      .finally(() => setLoading(false));
  }, [currentUser?.email]);

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await base44.entities.BiblePlaylist.delete(id);
      setPlaylists(playlists.filter(p => p.id !== id));
      if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  const handleRemoveVerse = async (playlistId, verseId) => {
    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) return;
      const newVerses = playlist.verses.filter(v => v.verse_id !== verseId);
      await base44.entities.BiblePlaylist.update(playlistId, { verses: newVerses });
      const updated = playlists.map(p =>
        p.id === playlistId ? { ...p, verses: newVerses } : p
      );
      setPlaylists(updated);
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist({ ...selectedPlaylist, verses: newVerses });
      }
    } catch (err) {
      console.error('Error removing verse:', err);
    }
  };

  const handleRenamePlaylist = async (id) => {
    if (!editValue.trim()) return;
    try {
      await base44.entities.BiblePlaylist.update(id, { name: editValue.trim() });
      const updated = playlists.map(p =>
        p.id === id ? { ...p, name: editValue.trim() } : p
      );
      setPlaylists(updated);
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist({ ...selectedPlaylist, name: editValue.trim() });
      }
      setEditingName(null);
    } catch (err) {
      console.error('Error renaming playlist:', err);
    }
  };

  if (!currentUser?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F6F1' }}>
        <p style={{ color: '#6B7280' }}>Please log in to manage playlists.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F6F1' }}>
        <div className="animate-spin rounded-full h-8 w-8" style={{ borderTop: '2px solid #8B5CF6', borderRight: '2px solid #8B5CF6', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8" style={{ color: '#8B5CF6' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>Bible Audio Playlists</h1>
          </div>
          <p style={{ color: '#6B7280' }}>Create and manage your favorite verse collections for listening</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Playlists List */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            >
              <div className="p-4 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#F3F4F6' }}>
                <h2 className="font-semibold" style={{ color: '#1F2937' }}>
                  Your Playlists ({playlists.length})
                </h2>
              </div>

              {playlists.length === 0 ? (
                <div className="p-6 text-center">
                  <Music className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                  <p style={{ color: '#9CA3AF' }} className="text-sm">
                    No playlists yet. Create one by adding verses!
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
                  {playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => setSelectedPlaylist(playlist)}
                      className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-start justify-between group"
                      style={{
                        backgroundColor: selectedPlaylist?.id === playlist.id ? '#EDE9FE' : 'transparent',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#1F2937' }}>
                          {playlist.name}
                        </p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                          {playlist.verses?.length || 0} verse{(playlist.verses?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#8B5CF6' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Playlist Details */}
          <div className="lg:col-span-2">
            {selectedPlaylist ? (
              <div
                className="rounded-2xl shadow-sm overflow-hidden"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
              >
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {editingName === selectedPlaylist.id ? (
                        <div className="flex gap-2">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleRenamePlaylist(selectedPlaylist.id)}
                            onKeyPress={e => e.key === 'Enter' && handleRenamePlaylist(selectedPlaylist.id)}
                            className="flex-1 px-3 py-2 rounded-lg border text-sm"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                          <button
                            onClick={() => setEditingName(null)}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: '#F3F4F6' }}
                          >
                            <X className="w-4 h-4" style={{ color: '#6B7280' }} />
                          </button>
                        </div>
                      ) : (
                        <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>
                          {selectedPlaylist.name}
                        </h2>
                      )}
                      {selectedPlaylist.description && (
                        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                          {selectedPlaylist.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {editingName !== selectedPlaylist.id && (
                        <button
                          onClick={() => {
                            setEditingName(selectedPlaylist.id);
                            setEditValue(selectedPlaylist.name);
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verses */}
                <div className="p-6">
                  {!selectedPlaylist.verses || selectedPlaylist.verses.length === 0 ? (
                    <p style={{ color: '#9CA3AF' }} className="text-center py-8">
                      No verses in this playlist yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedPlaylist.verses.map(verse => (
                        <div
                          key={verse.verse_id}
                          className="p-4 rounded-xl border flex items-start justify-between group"
                          style={{ backgroundColor: '#F8F6F1', borderColor: '#E5E7EB' }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: '#8B5CF6' }}>
                              {verse.reference}
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                              {verse.language || 'en'}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setPlayingVerse(playingVerse === verse.verse_id ? null : verse.verse_id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}
                              title="Play audio"
                            >
                              {playingVerse === verse.verse_id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveVerse(selectedPlaylist.id, verse.verse_id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl p-12 text-center shadow-sm"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
              >
                <Volume2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                <p style={{ color: '#9CA3AF' }}>
                  Select a playlist to view and manage verses
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}