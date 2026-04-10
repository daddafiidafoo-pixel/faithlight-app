import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, CheckCircle } from 'lucide-react';

export default function ShareStudyPlanModal({ studyPlan, user, onClose }) {
  const [shareDescription, setShareDescription] = useState(studyPlan.description || '');
  const [shareLink, setShareLink] = useState(null);
  const queryClient = useQueryClient();

  const sharePlanMutation = useMutation({
    mutationFn: async () => {
      // Create shared plan entry
      const shared = await base44.entities.SharedStudyPlan.create({
        study_plan_id: studyPlan.id,
        owner_user_id: user.id,
        owner_name: user.full_name,
        title: studyPlan.title,
        description: shareDescription,
        topics: studyPlan.topics || [],
        duration_days: studyPlan.duration_days,
        is_public: true,
        shares_count: 0,
        average_rating: 0,
        share_link: `${window.location.origin}/SharedPlans?id=${studyPlan.id}`
      });

      return shared;
    },
    onSuccess: (shared) => {
      setShareLink(shared.share_link);
      queryClient.invalidateQueries(['shared-plans']);
    }
  });

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{studyPlan.title}</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              <Badge>{studyPlan.duration_days} days</Badge>
              {studyPlan.topics?.map((topic, idx) => (
                <Badge key={idx} variant="outline">{topic}</Badge>
              ))}
            </div>
          </div>

          {!shareLink ? (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Share Description (help others understand this plan)
                </label>
                <Textarea
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="Describe what makes this study plan valuable..."
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">What gets shared:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Study plan structure and topics</li>
                  <li>✓ Duration and recommended resources</li>
                  <li>✓ Your name as the creator</li>
                  <li>✗ Your personal progress and notes</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => sharePlanMutation.mutate()}
                  disabled={sharePlanMutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {sharePlanMutation.isPending ? 'Sharing...' : 'Share Plan'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Plan Shared Successfully!</h3>
                <p className="text-gray-600">Others can now discover and use your study plan</p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Share Link:</label>
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button onClick={copyLink} variant="outline" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}