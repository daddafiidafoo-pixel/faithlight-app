import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

export default function ReportPostModal({ open, onOpenChange, postId, postAuthor, onSubmit }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reasons = [
    'spam',
    'harassment',
    'hate_speech',
    'sexual_content',
    'violence',
    'misinformation',
    'other'
  ];

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        postId,
        reason,
        notes: notes.trim(),
        reportedAt: new Date().toISOString(),
      });
      setReason('');
      setNotes('');
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" /> Report Post
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Let us know why this post is inappropriate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Reason
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {reasons.map(r => (
                  <SelectItem key={r} value={r}>
                    {r.replace(/_/g, ' ').charAt(0).toUpperCase() + r.slice(1).replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Additional details (optional)
            </label>
            <Textarea
              placeholder="Provide any additional context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}