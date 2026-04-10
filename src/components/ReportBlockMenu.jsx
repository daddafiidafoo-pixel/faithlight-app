import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Ban, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ReportModal from './moderation/ReportModal';
import { toast } from 'sonner';

export default function ReportBlockMenu({ targetUserId, currentUserId }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [isBlockingLoading, setIsBlockingLoading] = useState(false);

  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return null;

  const handleBlock = async () => {
    setIsBlockingLoading(true);
    try {
      await base44.entities.UserBlock.create({
        blocker_id: currentUserId,
        blocked_id: targetUserId,
      });
      toast.success('User blocked');
    } catch (error) {
      toast.error('Failed to block user');
    } finally {
      setIsBlockingLoading(false);
    }
  };

  return (
    <>
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={targetUserId}
        contentType="profile"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setShowReportModal(true)}
            className="text-orange-600 cursor-pointer"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleBlock}
            disabled={isBlockingLoading}
            className="text-red-600 cursor-pointer"
          >
            <Ban className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}