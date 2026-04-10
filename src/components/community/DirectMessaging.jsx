import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function DirectMessaging({ user, isDarkMode }) {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  // Fetch friends
  const { data: friends = [] } = useQuery({
    queryKey: ['messagingFriends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await base44.entities.Friend.filter({
          user_id: user.id,
          status: 'accepted'
        }, '-created_date', 50);
      } catch {
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch messages for selected friend
  const { data: messages = [] } = useQuery({
    queryKey: ['directMessages', user?.id, selectedFriend?.id],
    queryFn: async () => {
      if (!user || !selectedFriend) return [];
      try {
        return await base44.entities.DirectMessage.filter({
          $or: [
            { sender_id: user.id, recipient_id: selectedFriend.friend_id },
            { sender_id: selectedFriend.friend_id, recipient_id: user.id }
          ]
        }, 'created_date', 50);
      } catch {
        return [];
      }
    },
    enabled: !!user && !!selectedFriend
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      return base44.entities.DirectMessage.create({
        sender_id: user?.id,
        sender_name: user?.full_name || 'Anonymous',
        recipient_id: selectedFriend.friend_id,
        recipient_name: selectedFriend.friend_name,
        message_text: text,
        is_read: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directMessages', user?.id, selectedFriend?.id] });
      setMessageText('');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsLoading(true);
    sendMessageMutation.mutate(messageText);
    setIsLoading(false);
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Friends List */}
      <Card className="w-1/3 flex flex-col" style={{ backgroundColor: cardColor, borderColor }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg" style={{ color: textColor }}>
            <Users className="w-5 h-5" style={{ color: primaryColor }} />
            Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {friends.length === 0 ? (
            <p style={{ color: mutedColor, fontSize: '14px' }}>No friends yet</p>
          ) : (
            friends.map(friend => (
              <button
                key={friend.id}
                onClick={() => setSelectedFriend(friend)}
                className="w-full p-3 rounded-lg border text-left transition-all"
                style={{
                  backgroundColor: selectedFriend?.id === friend.id ? primaryColor : bgColor,
                  borderColor: selectedFriend?.id === friend.id ? primaryColor : borderColor,
                  color: selectedFriend?.id === friend.id ? '#FFFFFF' : textColor
                }}
              >
                <p className="font-semibold text-sm">{friend.friend_name}</p>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="w-2/3 flex flex-col" style={{ backgroundColor: cardColor, borderColor }}>
        {selectedFriend ? (
          <>
            {/* Header */}
            <CardHeader style={{ borderBottom: `1px solid ${borderColor}` }}>
              <CardTitle style={{ color: textColor }}>{selectedFriend.friend_name}</CardTitle>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2" style={{ color: primaryColor, opacity: 0.5 }} />
                  <p style={{ color: mutedColor }}>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-xs p-3 rounded-lg"
                      style={{
                        backgroundColor: msg.sender_id === user?.id ? primaryColor : bgColor,
                        color: msg.sender_id === user?.id ? '#FFFFFF' : textColor
                      }}
                    >
                      <p className="text-sm">{msg.message_text}</p>
                      <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                        {msg.created_date ? new Date(msg.created_date).toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t flex gap-2" style={{ borderColor }}>
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: textColor
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isLoading}
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor, opacity: 0.5 }} />
              <p style={{ color: mutedColor }}>Select a friend to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}