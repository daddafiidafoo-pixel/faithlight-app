import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const REACTIONS = ['🙏', '🔥', '❤️', '😭', '🙌', '✝️', '⚡', '💪'];

export default function LiveReactions({ roomId, userId, userName }) {
  const [lastSent, setLastSent] = useState(0);

  const sendReaction = async (emoji) => {
    const now = Date.now();
    if (now - lastSent < 1500) return; // rate-limit 1.5s
    setLastSent(now);
    await base44.entities.LiveRoomChat.create({
      room_id: roomId,
      sender_id: userId,
      sender_name: userName,
      message: emoji,
      message_type: 'reaction',
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {REACTIONS.map(emoji => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className="text-lg px-2 py-1 h-9 hover:scale-110 transition-transform border-gray-200 hover:border-indigo-300"
          onClick={() => sendReaction(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}