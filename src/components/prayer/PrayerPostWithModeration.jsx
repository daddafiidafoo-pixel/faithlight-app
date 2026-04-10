import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Flag, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PrayerPostWithModeration({ post, onReport, onBlock }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please select a reason');
      return;
    }

    setIsReporting(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.PrayerPostFlag.create({
        prayer_post_id: post.id,
        reported_by_email: user?.email || 'anonymous',
        reason: reportReason,
        content_preview: post.body.substring(0, 100),
        status: 'pending',
      });

      toast.success('Report submitted. Thank you for helping keep our community safe.');
      setShowReportModal(false);
      setReportReason('');
      onReport?.(post.id);
    } catch (err) {
      toast.error('Failed to submit report');
      console.error(err);
    } finally {
      setIsReporting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm(`Block ${post.authorName}? They won't be able to see your posts.`)) return;

    try {
      const user = await base44.auth.me();
      
      await base44.entities.BlockedUser.create({
        user_email: user?.email,
        blocked_user_email: post.authorEmail,
        reason: 'User initiated block',
      });

      toast.success(`Blocked ${post.authorName}`);
      onBlock?.(post.id);
    } catch (err) {
      toast.error('Failed to block user');
      console.error(err);
    }
  };

  return (
    <>
      <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{post.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {post.isAnonymous ? 'Anonymous' : post.authorName}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            post.category === 'health' ? 'bg-red-100 text-red-700' :
            post.category === 'family' ? 'bg-blue-100 text-blue-700' :
            post.category === 'faith' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {post.category}
          </span>
        </div>

        <p className="text-sm text-gray-700 mb-4">{post.body}</p>

        <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
          <span>{post.prayedCount} prayed for this</span>
          <span>{new Date(post.created_date).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Heart className="w-4 h-4 mr-1" />
            Pray
          </Button>
          
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-1 text-xs text-gray-600 hover:text-red-600 flex items-center gap-1 border border-gray-300 rounded-md hover:border-red-300 transition"
          >
            <Flag className="w-4 h-4" />
            Report
          </button>

          <button
            onClick={handleBlockUser}
            className="px-3 py-1 text-xs text-gray-600 hover:text-red-600 flex items-center gap-1 border border-gray-300 rounded-md hover:border-red-300 transition"
          >
            <Ban className="w-4 h-4" />
            Block
          </button>
        </div>
      </Card>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-4">Report Prayer Request</h3>
            
            <div className="space-y-3 mb-6">
              {['Inappropriate content', 'Harassment', 'Spam', 'Other'].map((reason) => (
                <label key={reason} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowReportModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={isReporting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isReporting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}