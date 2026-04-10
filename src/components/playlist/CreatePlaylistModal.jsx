import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function CreatePlaylistModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setCreating(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.BiblePlaylist.create({
        user_email: user.email,
        name: name.trim(),
        description: description.trim()
      });
      onCreated();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Playlist</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Playlist Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Daily Encouragement"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this playlist for?"
            className="w-full px-4 py-2 border rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim() || creating} className="bg-amber-600 hover:bg-amber-700">
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Card>
    </div>
  );
}