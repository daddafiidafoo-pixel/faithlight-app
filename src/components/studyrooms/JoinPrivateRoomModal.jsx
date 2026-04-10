import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

export default function JoinPrivateRoomModal({ room, user, onClose, onJoined }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) return;

    if (code.trim().toUpperCase() !== (room.inviteCode || '').toUpperCase()) {
      setError('Invalid invite code. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.StudyRoomMember.create({
        roomId: room.id,
        userId: user.id,
        role: 'member',
        status: 'active',
        joinedAt: new Date().toISOString()
      });
      await base44.entities.StudyRoom.update(room.id, {
        memberCount: (room.memberCount || 1) + 1
      });
      onJoined(room);
    } catch (err) {
      setError('Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Private Room</h3>
            <p className="text-sm text-gray-500">Enter the invite code to join</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 font-medium">{room.name}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter invite code"
            className="font-mono tracking-widest text-center uppercase"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Joining…' : 'Join Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}