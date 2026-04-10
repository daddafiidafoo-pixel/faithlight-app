import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Music, Plus, Check } from 'lucide-react';

export default function AddToPlaylistButton({ verse, language = 'en', bookName = '' }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [addedTo, setAddedTo] = useState(new Set());

  // Load current user
  useEffect(() => {
    base44.auth.me()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  // Load user's playlists
  useEffect(() => {
    if (!currentUser?.email || !open) return;
    setLoading(true);
    base44.entities.BiblePlaylist.filter({ user_email: currentUser.email })
      .then(data => {
        setPlaylists(data || []);
        // Mark which playlists already contain this verse
        const verseId = `${verse.book_id}-${verse.chapter}-${verse.verse_number}`;
        const added = new Set();
        data?.forEach(p => {
          if (p.verses?.some(v => v.verse_id === verseId)) {
            added.add(p.id);
          }
        });
        setAddedTo(added);
      })
      .catch(() => setPlaylists([]))
      .finally(() => setLoading(false));
  }, [currentUser?.email, open, verse]);

  const handleAddToPlaylist = async (playlistId) => {
    if (!currentUser?.email) return;
    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      const verseId = `${verse.book_id}-${verse.chapter}-${verse.verse_number}`;
      const verseData = {
        verse_id: verseId,
        book_id: verse.book_id,
        book_name: bookName || verse.book_name,
        chapter: verse.chapter,
        verse_number: verse.verse_number,
        reference: verse.reference_text,
        language: language,
      };

      // Check if verse already exists
      const verseExists = playlist.verses?.some(v => v.verse_id === verseId);
      if (verseExists) return;

      const newVerses = [...(playlist.verses || []), verseData];
      await base44.entities.BiblePlaylist.update(playlistId, { verses: newVerses });
      setAddedTo(prev => new Set([...prev, playlistId]));
    } catch (err) {
      console.error('Error adding to playlist:', err);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!currentUser?.email || !newPlaylistName.trim()) return;
    try {
      setLoading(true);
      const verseId = `${verse.book_id}-${verse.chapter}-${verse.verse_number}`;
      const verseData = {
        verse_id: verseId,
        book_id: verse.book_id,
        book_name: bookName || verse.book_name,
        chapter: verse.chapter,
        verse_number: verse.verse_number,
        reference: verse.reference_text,
        language: language,
      };

      const newPlaylist = await base44.entities.BiblePlaylist.create({
        user_email: currentUser.email,
        name: newPlaylistName.trim(),
        verses: [verseData],
        is_public: false,
      });

      setPlaylists([...playlists, newPlaylist]);
      setAddedTo(prev => new Set([...prev, newPlaylist.id]));
      setNewPlaylistName('');
    } catch (err) {
      console.error('Error creating playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.email) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: open ? '#EDE9FE' : '#F3F4F6',
          color: open ? '#8B5CF6' : '#6B7280',
          minHeight: '32px',
        }}
        title="Add to playlist"
      >
        <Music className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Playlist</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-50 border"
          style={{ borderColor: '#E5E7EB' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-3 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-xs font-bold" style={{ color: '#1F2937' }}>
              Save to Playlist
            </h3>
          </div>

          {loading ? (
            <div className="p-3 text-center text-xs" style={{ color: '#6B7280' }}>
              Loading...
            </div>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto p-2">
                {playlists.length === 0 ? (
                  <p className="text-xs p-2 text-center" style={{ color: '#9CA3AF' }}>
                    No playlists yet
                  </p>
                ) : (
                  playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      disabled={addedTo.has(playlist.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between"
                      style={{
                        backgroundColor: addedTo.has(playlist.id) ? '#ECFDF5' : '#F3F4F6',
                        color: addedTo.has(playlist.id) ? '#059669' : '#1F2937',
                      }}
                    >
                      <span className="truncate">{playlist.name}</span>
                      {addedTo.has(playlist.id) && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>

              <div className="p-3 border-t" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New playlist"
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleCreateAndAdd()}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs border outline-none"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newPlaylistName.trim() || loading}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: '#8B5CF6',
                      color: 'white',
                    }}
                    title="Create playlist"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}