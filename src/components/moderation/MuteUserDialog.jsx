import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MuteUserDialog({
  open,
  onOpenChange,
  sessionId,
  userId,
  userName,
  hostUserId,
  hostName,
}) {
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState('5');
  const [muteType, setMuteType] = useState('audio');
  const [reason, setReason] = useState('');

  const muteUserMutation = useMutation({
    mutationFn: async () => {
      if (!duration || isNaN(duration)) {
        throw new Error('Please enter a valid duration');
      }

      const unmuteTime = new Date();
      unmuteTime.setMinutes(unmuteTime.getMinutes() + parseInt(duration));

      return await base44.entities.ParticipantMute.create({
        session_id: sessionId,
        user_id: userId,
        user_name: userName,
        muted_by_user_id: hostUserId,
        muted_by_name: hostName,
        mute_duration_minutes: parseInt(duration),
        muted_at: new Date().toISOString(),
        unmute_at: unmuteTime.toISOString(),
        reason,
        mute_type: muteType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-mute', sessionId, userId]);
      toast.success(`${userName} muted for ${duration} minutes`);
      setDuration('5');
      setMuteType('audio');
      setReason('');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    muteUserMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mute User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Muting: <strong>{userName}</strong>
            </p>
          </div>

          <div>
            <Label>Mute Type</Label>
            <Select value={muteType} onValueChange={setMuteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audio">Audio Only</SelectItem>
                <SelectItem value="chat">Chat Only</SelectItem>
                <SelectItem value="both">Audio & Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Duration (minutes) *</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="120"
                placeholder="Minutes"
              />
              <div className="flex gap-1">
                {[5, 10, 15, 30].map(mins => (
                  <Button
                    key={mins}
                    onClick={() => setDuration(mins.toString())}
                    variant="outline"
                    size="sm"
                    className={duration === mins.toString() ? 'bg-indigo-100' : ''}
                  >
                    {mins}m
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you muting this user?"
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={muteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={muteUserMutation.isPending || !duration}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mute User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}