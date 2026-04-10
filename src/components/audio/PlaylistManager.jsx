import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Trash2, List, Lock, Globe, Star, Search, ArrowUpDown, Users, SortAsc } from 'lucide-react';
import { toast } from 'sonner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
  { value: 'starred', label: 'Starred First' },
  { value: 'most_items', label: 'Most Items' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'starred', label: 'Starred' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'collaborative', label: 'Collaborative' },
];

export default function PlaylistManager({ user, onPlaylistSelect }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '', items: [], is_public: false, is_collaborative: false });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  // Starred playlist IDs stored in localStorage
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem('starred_playlists') || '[]'); } catch { return []; }
  });

  const toggleStar = (id) => {
    setStarred(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('starred_playlists', JSON.stringify(next));
      return next;
    });
  };

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['audio-playlists', user?.id],
    queryFn: () => base44.entities.AudioPlaylist.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id
  });

  // Also fetch collaborative playlists where user is a collaborator
  const { data: collabPlaylists = [] } = useQuery({
    queryKey: ['collab-playlists', user?.id],
    queryFn: async () => {
      try {
        const all = await base44.entities.AudioPlaylist.filter({ is_collaborative: true }, '-created_date', 100);
        return all.filter(p => p.user_id !== user.id && (p.collaborator_ids || []).includes(user.id));
      } catch { return []; }
    },
    enabled: !!user?.id
  });

  const createPlaylistMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioPlaylist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['audio-playlists']);
      setIsCreating(false);
      setNewPlaylist({ title: '', description: '', items: [], is_public: false, is_collaborative: false });
      toast.success('Playlist created!');
    }
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: (id) => base44.entities.AudioPlaylist.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['audio-playlists']); toast.success('Playlist deleted'); }
  });

  const togglePublicMutation = useMutation({
    mutationFn: ({ id, is_public }) => base44.entities.AudioPlaylist.update(id, { is_public }),
    onSuccess: () => { queryClient.invalidateQueries(['audio-playlists']); toast.success('Visibility updated'); }
  });

  const handleCreate = () => {
    if (!newPlaylist.title.trim()) { toast.error('Please enter a title'); return; }
    createPlaylistMutation.mutate({
      user_id: user.id,
      creator_name: user.full_name,
      collaborator_ids: newPlaylist.is_collaborative ? [user.id] : [],
      ...newPlaylist,
      items: [],
    });
  };

  const allPlaylists = [...playlists, ...collabPlaylists];

  const displayedPlaylists = useMemo(() => {
    let list = [...allPlaylists];

    // Filter
    if (filter === 'starred') list = list.filter(p => starred.includes(p.id));
    else if (filter === 'public') list = list.filter(p => p.is_public);
    else if (filter === 'private') list = list.filter(p => !p.is_public);
    else if (filter === 'collaborative') list = list.filter(p => p.is_collaborative);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'newest') list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    else if (sort === 'oldest') list.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    else if (sort === 'az') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else if (sort === 'za') list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    else if (sort === 'starred') list.sort((a, b) => (starred.includes(b.id) ? 1 : 0) - (starred.includes(a.id) ? 1 : 0));
    else if (sort === 'most_items') list.sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0));

    return list;
  }, [allPlaylists, filter, search, sort, starred]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <List className="w-5 h-5 text-indigo-600" />
          My Playlists
          <Badge variant="outline" className="text-xs">{playlists.length}</Badge>
        </h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Audio Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  placeholder="e.g., Morning Devotions, Psalms Collection"
                  value={newPlaylist.title}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                <Textarea
                  placeholder="Describe your playlist…"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="h-20"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">Make Public</p>
                    <p className="text-xs text-gray-500">Allow others to discover this playlist</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!newPlaylist.is_public}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, is_public: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Collaborative Playlist
                    </p>
                    <p className="text-xs text-gray-500">Allow other users to add chapters</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!newPlaylist.is_collaborative}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, is_collaborative: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                </label>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={createPlaylistMutation.isPending}>
                {createPlaylistMutation.isPending ? 'Creating…' : 'Create Playlist'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Sort + Filter */}
      {allPlaylists.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search playlists…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SortAsc className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Playlist list */}
      {isLoading ? (
        <p className="text-sm text-gray-500 text-center py-4">Loading playlists…</p>
      ) : displayedPlaylists.length === 0 ? (
        <div className="text-center py-10">
          <List className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">
            {search || filter !== 'all' ? 'No playlists match your search' : 'No playlists yet'}
          </p>
          {!search && filter === 'all' && (
            <Button onClick={() => setIsCreating(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Playlist
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedPlaylists.map(playlist => {
            const isStarred = starred.includes(playlist.id);
            const isOwner = playlist.user_id === user?.id;
            const isCollab = playlist.is_collaborative;

            return (
              <div
                key={playlist.id}
                className="p-4 border rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 truncate">{playlist.title}</h4>
                      {playlist.is_public
                        ? <Globe className="w-3 h-3 text-green-600 flex-shrink-0" title="Public" />
                        : <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" title="Private" />
                      }
                      {isCollab && (
                        <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-300 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Collaborative
                        </Badge>
                      )}
                      {!isOwner && (
                        <Badge variant="secondary" className="text-xs">Shared</Badge>
                      )}
                    </div>
                    {playlist.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{playlist.description}</p>
                    )}
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{playlist.items?.length || 0} items</Badge>
                      {playlist.play_count > 0 && (
                        <Badge variant="outline" className="text-xs">{playlist.play_count} plays</Badge>
                      )}
                      {isCollab && (playlist.collaborator_ids?.length > 0) && (
                        <Badge variant="outline" className="text-xs text-indigo-500">
                          {playlist.collaborator_ids.length} collaborator{playlist.collaborator_ids.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    {/* Star */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 ${isStarred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                      onClick={() => toggleStar(playlist.id)}
                      title={isStarred ? 'Unstar' : 'Star'}
                    >
                      <Star className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} />
                    </Button>
                    {/* Play */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onPlaylistSelect?.(playlist)}
                      className="h-8 w-8 text-indigo-600 hover:text-indigo-800"
                      title="Play"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    {/* Toggle public/private (owner only) */}
                    {isOwner && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePublicMutation.mutate({ id: playlist.id, is_public: !playlist.is_public })}
                        title={playlist.is_public ? 'Make Private' : 'Make Public'}
                      >
                        {playlist.is_public ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </Button>
                    )}
                    {/* Delete (owner only) */}
                    {isOwner && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { if (confirm('Delete this playlist?')) deletePlaylistMutation.mutate(playlist.id); }}
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}