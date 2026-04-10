import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flag, Loader2, Check } from 'lucide-react';

export default function ReportUserModal({ 
  isOpen, 
  onOpenChange, 
  reportedUserId, 
  reportedUserName,
  contextType = 'profile',
  contextId = null,
}) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Report.create({
        reported_user_id: reportedUserId,
        context_type: contextType,
        context_id: contextId,
        reason,
        details,
        status: 'open',
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setTimeout(() => {
        setReason('');
        setDetails('');
        setSubmitted(false);
        onOpenChange(false);
      }, 2000);
    },
  });

  const handleSubmit = () => {
    if (!reason || !details.trim()) return;
    reportMutation.mutate();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Report {reportedUserName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Help us keep FaithLight safe. Please describe what happened.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="flex justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Report submitted</p>
            <p className="text-sm text-gray-600">Our moderators will review this shortly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">What happened? *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason" className="mt-2">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment or bullying</SelectItem>
                  <SelectItem value="hate">Hate speech</SelectItem>
                  <SelectItem value="sexual">Sexual content</SelectItem>
                  <SelectItem value="scam">Scam or fraud</SelectItem>
                  <SelectItem value="violence">Violence or threats</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="details">Tell us more *</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what happened (be specific)"
                rows={4}
                className="mt-2"
              />
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                Reports are reviewed by our moderation team. False reports may result in action against your account.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-end pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={handleSubmit}
                disabled={!reason || !details.trim() || reportMutation.isPending}
                className="gap-2"
              >
                {reportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}