import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportUserModal({
  open,
  onOpenChange,
  sessionId,
  reportedUserId,
  reportedUserName,
  reporterUserId,
  reporterName,
  messageId,
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reportUserMutation = useMutation({
    mutationFn: async () => {
      if (!reason || !description.trim()) {
        throw new Error('Please provide a reason and description');
      }

      return await base44.entities.UserReport.create({
        session_id: sessionId,
        reported_user_id: reportedUserId,
        reported_user_name: reportedUserName,
        reporter_user_id: reporterUserId,
        reporter_name: reporterName,
        reason,
        description,
        message_id: messageId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-reports', sessionId]);
      toast.success('Report submitted. Hosts will review shortly.');
      setReason('');
      setDescription('');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    reportUserMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Report User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Reporting: <strong>{reportedUserName}</strong>
            </p>
            <p className="text-xs text-red-600 mt-1">
              Your report will be reviewed by session hosts.
            </p>
          </div>

          <div>
            <Label>Reason for Report *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate_language">
                  Inappropriate Language
                </SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened and why you're reporting this user..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={reportUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                reportUserMutation.isPending ||
                !reason ||
                !description.trim()
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}