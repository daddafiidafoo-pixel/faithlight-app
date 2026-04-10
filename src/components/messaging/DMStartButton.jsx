import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function DMStartButton({ otherUser, currentUser, disabled }) {
  const navigate = useNavigate();

  const startDMMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('dmAccessControl', {
        action: 'getOrCreateDM',
        otherUserId: otherUser.id,
        otherUserName: otherUser.full_name
      });
      return data.conversation;
    },
    onSuccess: (conversation) => {
      navigate(createPageUrl('DirectMessages'), { state: { selectedThreadId: conversation.id } });
    },
    onError: (error) => {
      alert(error.message || 'Cannot start DM with this user');
    }
  });

  return (
    <Button
      onClick={() => startDMMutation.mutate()}
      disabled={disabled || startDMMutation.isPending}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {startDMMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      Message
    </Button>
  );
}