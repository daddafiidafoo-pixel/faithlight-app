import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock } from 'lucide-react';

export default function TimedChatLockPanel({ roomId, room }) {
  const [duration, setDuration] = useState('10');
  const [unit, setUnit] = useState('minutes');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);

  const handleLockChat = async () => {
    if (!duration) return;

    try {
      setLoading(true);
      const durationMs = {
        minutes: parseInt(duration) * 60 * 1000,
        hours: parseInt(duration) * 60 * 60 * 1000,
      }[unit];

      const unlockAt = new Date(Date.now() + durationMs).toISOString();

      await base44.entities.ServiceRoom.update(room.id, {
        chat_locked: true,
        chat_locked_until: unlockAt,
      });

      setIsLocked(true);
      setLockedUntil(unlockAt);
    } catch (e) {
      console.error('Failed to lock chat:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockChat = async () => {
    try {
      setLoading(true);
      await base44.entities.ServiceRoom.update(room.id, {
        chat_locked: false,
        chat_locked_until: null,
      });

      setIsLocked(false);
      setLockedUntil(null);
    } catch (e) {
      console.error('Failed to unlock chat:', e);
    } finally {
      setLoading(false);
    }
  };

  if (isLocked || room?.chat_locked) {
    const timeLeft = lockedUntil
      ? Math.max(0, (new Date(lockedUntil) - new Date()) / 1000 / 60)
      : 'N/A';

    return (
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Chat Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-red-700 mb-3">
            Chat is locked for {Math.ceil(timeLeft)} minutes
          </p>
          <Button
            onClick={handleUnlockChat}
            disabled={loading}
            variant="destructive"
            className="w-full h-8 text-xs"
          >
            Unlock Chat Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Lock Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Duration
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-8 text-xs"
              min="1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Unit
            </label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleLockChat}
          disabled={loading || !duration}
          className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Locking...' : `Lock for ${duration} ${unit}`}
        </Button>
      </CardContent>
    </Card>
  );
}