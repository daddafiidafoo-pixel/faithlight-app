import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function ContentFlagButton({ contentId, contentType, authorId, authorName, contentPreview }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');

  const flagMutation = useMutation({
    mutationFn: async () => {
      // Create a report
      const report = await base44.entities.Report.create({
        reporter_id: (await base44.auth.me()).id,
        reported_user_id: authorId,
        content_type: contentType,
        content_id: contentId,
        reason: category,
        details: details,
        status: 'open'
      });

      // Trigger content moderation check
      await base44.functions.invoke('contentModerationFilter', {
        content: contentPreview,
        contentType: contentType,
        contentId: contentId,
        authorId: authorId,
        authorName: authorName
      });

      return report;
    },
    onSuccess: () => {
      setOpen(false);
      setCategory('');
      setDetails('');
      alert('Content reported. Our moderation team will review it shortly.');
    },
    onError: () => {
      alert('Failed to report content. Please try again.');
    }
  });

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <Flag className="w-4 h-4 mr-1" />
        Report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
            <DialogDescription>
              Help us keep our community safe and respectful.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Reason</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hate_speech">Hate Speech / Discrimination</SelectItem>
                  <SelectItem value="harassment">Harassment / Threats</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="doctrinal_concern">Doctrinal Concern</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="sexual_content">Sexual Content</SelectItem>
                  <SelectItem value="off_topic">Off-Topic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Details (Optional)</label>
              <Textarea
                placeholder="Tell us more about why you're reporting this..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="h-24"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-xs text-blue-700">
                ✓ Reports are reviewed by our moderation team<br />
                ✓ Your identity remains confidential<br />
                ✓ False reports may impact your account
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => flagMutation.mutate()}
                disabled={!category || flagMutation.isPending}
              >
                {flagMutation.isPending ? 'Reporting...' : 'Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}