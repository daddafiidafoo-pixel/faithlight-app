import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveChatModeration({ messageId, senderName, content, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState('');

  const approveMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.LiveChatMessage.update(messageId, {
        status: 'approved',
        moderated_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Message approved');
      queryClient.invalidateQueries(['pending-messages']);
      onOpenChange(false);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      return base44.entities.LiveChatMessage.update(messageId, {
        status: 'rejected',
        moderated_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      });
    },
    onSuccess: () => {
      toast.success('Message rejected');
      queryClient.invalidateQueries(['pending-messages']);
      setRejectionReason('');
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Message</DialogTitle>
          <DialogDescription>Approve or reject this message for the live chat</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-xs text-gray-600 font-semibold mb-2">{senderName}</p>
            <p className="text-gray-900">{content}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-gray-500">(if rejecting)</span>
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this message is being rejected..."
                className="h-20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}