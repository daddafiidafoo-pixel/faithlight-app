import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'sexual_content', label: 'Sexual Content' },
  { value: 'violence', label: 'Violence or Threats' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({ open, onClose, contentType, contentId, contentTitle }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.functions.invoke('submitReport', {
        content_type: contentType,
        content_id: contentId,
        reason,
        details: details || null,
      });

      if (result.data.success) {
        toast.success('Thanks — we\'ll review this.');
        setReason('');
        setDetails('');
        onClose();
      } else {
        toast.error(result.data.error);
      }
    } catch (error) {
      toast.error('Failed to submit report');
      console.error('Report error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Report content
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe. We'll review reports promptly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {contentTitle && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-600">Reporting:</p>
              <p className="font-medium text-gray-900 truncate">{contentTitle}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <Textarea
              placeholder="Tell us more about why you're reporting this..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">{details.length} / 500</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}