import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or scam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'sexual_content', label: 'Sexual or adult content' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'self_harm', label: 'Self-harm or suicide' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
];

export default function ReportContentModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetOwnerUserId,
  defaultReason,
  onSubmitted,
}) {
  const [reason, setReason] = useState(defaultReason || '');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.CommunityReport.create({
        reporter_user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        target_owner_user_id: targetOwnerUserId,
        reason,
        details: details.trim() || null,
        status: 'open',
        action_taken: 'none',
      });

      setSubmitted(true);
      if (onSubmitted) onSubmitted();
      
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('');
        setDetails('');
      }, 2000);
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us keep FaithLight safe and respectful for everyone.
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide more context to help our moderation team..."
                className="h-24"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !reason}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">
              Thank you for your report
            </p>
            <p className="text-sm text-gray-600">
              Our moderation team will review this content shortly.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}