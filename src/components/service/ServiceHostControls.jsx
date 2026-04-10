import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MicOff, LogOut } from 'lucide-react';

export default function ServiceHostControls({ room, participants, onEndService }) {
  const [loading, setLoading] = useState(false);

  const onStage = participants?.filter((p) => p.is_on_stage) || [];

  const handleEndService = async () => {
    if (!window.confirm('End this service? All participants will be removed.')) return;

    try {
      setLoading(true);
      await base44.entities.ServiceRoom.update(room.id, {
        status: 'ended',
        ended_at: new Date().toISOString(),
      });
      onEndService?.();
    } catch (e) {
      console.error('Failed to end service:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMuteAll = async () => {
    try {
      // Update all audience participants
      const audience = participants.filter((p) => p.role === 'audience');
      for (const person of audience) {
        await base44.entities.ServiceRoomParticipant.update(person.id, {
          is_muted: !person.is_muted,
        });
      }
    } catch (e) {
      console.error('Failed to mute:', e);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Host Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-gray-600">Participants</p>
            <p className="text-lg font-bold text-gray-900">{participants?.length || 0}</p>
          </div>
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-gray-600">On Stage</p>
            <p className="text-lg font-bold text-gray-900">{onStage.length}/6</p>
          </div>
        </div>

        {/* Status */}
        <Badge className="w-full justify-center bg-green-100 text-green-800">
          🔴 LIVE
        </Badge>

        {/* Actions */}
        <Button
          onClick={handleMuteAll}
          variant="outline"
          className="w-full gap-2 text-sm"
          size="sm"
        >
          <MicOff className="w-4 h-4" />
          Mute Audience
        </Button>

        <Button
          onClick={handleEndService}
          disabled={loading}
          variant="destructive"
          className="w-full gap-2 text-sm"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          {loading ? 'Ending...' : 'End Service'}
        </Button>
      </CardContent>
    </Card>
  );
}