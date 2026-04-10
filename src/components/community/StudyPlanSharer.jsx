import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check } from 'lucide-react';

export default function StudyPlanSharer({ studyPlan, currentUser, isDarkMode }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sharePlan = useMutation({
    mutationFn: async () => {
      const shareLink = `plan-${studyPlan.id}-${Math.random().toString(36).substr(2, 9)}`;
      return base44.entities.SharedStudyPlan.create({
        study_plan_id: studyPlan.id,
        owner_user_id: currentUser.id,
        owner_name: currentUser.full_name,
        title: studyPlan.title,
        description: studyPlan.description,
        topics: studyPlan.topics,
        duration_days: studyPlan.duration_days,
        is_public: true,
        share_link: shareLink
      });
    },
    onSuccess: (shared) => {
      queryClient.invalidateQueries({ queryKey: ['sharedStudyPlans'] });
      setIsOpen(true);
    }
  });

  const handleCopyLink = () => {
    if (sharePlan.data?.share_link) {
      navigator.clipboard.writeText(`${window.location.origin}?sharePlan=${sharePlan.data.share_link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => sharePlan.mutate()}
          disabled={sharePlan.isPending}
        >
          <Share2 className="w-4 h-4" />
          Share Plan
        </Button>
      </DialogTrigger>
      <DialogContent style={{
        backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF'
      }}>
        <DialogHeader>
          <DialogTitle>Share Study Plan</DialogTitle>
        </DialogHeader>
        {sharePlan.data && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Share this plan with your community:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}?sharePlan=${sharePlan.data.share_link}`}
                className="flex-1 p-2 border rounded text-sm"
              />
              <Button
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}