import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderOpen, BookOpen, StickyNote, Highlighter, Heart, Search } from 'lucide-react';
import CollectionCard from '../components/collections/CollectionCard';
import CollectionDetailModal from '../components/collections/CollectionDetailModal';
import CreateCollectionModal from '../components/collections/CreateCollectionModal';

const PRESET_COLLECTIONS = [
  { name: 'Guidance', icon: '🧭', color: '#F59E0B', description: 'Verses and notes about direction and wisdom' },
  { name: 'Forgiveness', icon: '🕊️', color: '#10B981', description: 'Scripture on grace, mercy and forgiveness' },
  { name: 'Relationships', icon: '❤️', color: '#EC4899', description: 'Guidance on love, family and community' },
  { name: 'Strength', icon: '💪', color: '#6366F1', description: 'Verses for courage and perseverance' },
  { name: 'Gratitude', icon: '🙏', color: '#F97316', description: 'Thankfulness and praise' },
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          const data = await base44.entities.Collection.filter({ user_id: u.id }, '-created_date');
          setCollections(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreate = async (collectionData) => {
    const created = await base44.entities.Collection.create({ ...collectionData, user_id: user.id, items: [], item_count: 0 });
    setCollections(prev => [created, ...prev]);
    setShowCreate(false);
  };

  const handleSeedPresets = async () => {
    for (const preset of PRESET_COLLECTIONS) {
      const existing = collections.find(c => c.name === preset.name);
      if (!existing) {
        const created = await base44.entities.Collection.create({ ...preset, user_id: user.id, items: [], item_count: 0 });
        setCollections(prev => [created, ...prev]);
      }
    }
  };

  const handleUpdate = async (id, data) => {
    const updated = await base44.entities.Collection.update(id, data);
    setCollections(prev => prev.map(c => c.id === id ? updated : c));
    if (selectedCollection?.id === id) setSelectedCollection(updated);
  };

  const handleDelete = async (id) => {
    await base44.entities.Collection.delete(id);
    setCollections(prev => prev.filter(c => c.id !== id));
    if (selectedCollection?.id === id) setSelectedCollection(null);
  };

  const filtered = collections.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <FolderOpen className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Collections</h2>
          <p className="text-gray-500 mb-4">Sign in to organize your study materials</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-700 hover:bg-indigo-800">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-indigo-600" /> Collections
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Organize your verses, notes &amp; highlights</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-indigo-700 hover:bg-indigo-800 gap-1.5">
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 mb-5 text-sm">
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-gray-800">{collections.length}</span>
            <span className="text-gray-500">Collections</span>
          </div>
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-gray-800">{collections.reduce((a, c) => a + (c.item_count || 0), 0)}</span>
            <span className="text-gray-500">Items</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search collections..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Preset suggestion (if no collections) */}
        {!loading && collections.length === 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-5">
            <p className="font-semibold text-indigo-800 mb-1">Get started with presets</p>
            <p className="text-indigo-600 text-sm mb-3">Create themed collections like Guidance, Forgiveness, and Relationships</p>
            <Button onClick={handleSeedPresets} variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 text-sm">
              Create Preset Collections
            </Button>
          </div>
        )}

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No collections found</p>
            <p className="text-sm mt-1">Create one to organize your Bible study</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(col => (
              <CollectionCard
                key={col.id}
                collection={col}
                onClick={() => setSelectedCollection(col)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateCollectionModal onCreate={handleCreate} onClose={() => setShowCreate(false)} />
      )}

      {selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setSelectedCollection(null)}
        />
      )}
    </div>
  );
}