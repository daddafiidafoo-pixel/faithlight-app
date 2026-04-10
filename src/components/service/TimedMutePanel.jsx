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
import { AlertCircle, Clock } from 'lucide-react';

export default function TimedMutePanel({ roomId, participants }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [duration, setDuration] = useState('5');
  const [unit, setUnit] = useState('minutes');
  const [loading, setLoading] = useState(false);

  const speakers = participants.filter(
    (p) => p.role === 'speaker' && !p.left_at && !p.is_muted
  );

  const handleTemporaryMute = async () => {
    if (!selectedUserId || !duration) return;

    try {
      setLoading(true);
      const durationMs = {
        minutes: parseInt(duration) * 60 * 1000,
        hours: parseInt(duration) * 60 * 60 * 1000,
      }[unit];

      const unmuteAt = new Date(Date.now() + durationMs).toISOString();

      const participant = participants.find((p) => p.user_id === selectedUserId);
      if (participant) {
        await base44.entities.ServiceRoomParticipant.update(participant.id, {
          is_muted: true,
          muted_until: unmuteAt,
        });
      }

      setSelectedUserId('');
      setDuration('5');
    } catch (e) {
      console.error('Failed to mute:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-yellow-300 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          Timed Mute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {speakers.length === 0 ? (
          <p className="text-xs text-yellow-700">No active speakers</p>
        ) : (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                User
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {speakers.map((p) => (
                    <SelectItem key={p.id} value={p.user_id}>
                      {p.user_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              onClick={handleTemporaryMute}
              disabled={loading || !selectedUserId}
              className="w-full h-8 text-xs bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Muting...' : `Mute for ${duration} ${unit}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}