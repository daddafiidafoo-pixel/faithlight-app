import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Volume2, VolumeX } from 'lucide-react';

export default function ChatModeration({ eventId, sessionId, isHost, isCohost, message }) {
  const [loading, setLoading] = useState(false);
  
  const canModerate = isHost || isCohost;
  
  const handleDeleteMessage = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('moderateChat', {
        action: 'delete_message',
        event_id: eventId,
        session_id: sessionId,
        message_id: message.id
      });
      // UI update will happen through subscription
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMuteUser = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('moderateChat', {
        action: 'mute_user',
        event_id: eventId,
        session_id: sessionId,
        target_user_id: message.user_id
      });
    } catch (error) {
      console.error('Error muting user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canModerate || message.is_deleted) {
    return null;
  }

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:text-red-700"
            disabled={loading}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Message?</AlertDialogTitle>
          <AlertDialogDescription>
            This message will be removed from the chat.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-red-500">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-orange-500 hover:text-orange-700"
            disabled={loading}
          >
            <VolumeX className="w-3 h-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Mute User?</AlertDialogTitle>
          <AlertDialogDescription>
            {message.user_name} will not be able to send messages in this session.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMuteUser} className="bg-orange-500">
              Mute
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}