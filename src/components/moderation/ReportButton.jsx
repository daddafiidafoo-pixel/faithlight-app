import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import ReportModal from './ReportModal';

export default function ReportButton({ contentType, contentId, contentTitle }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="text-gray-500 hover:text-red-600 hover:bg-red-50 gap-1"
      >
        <Flag className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Report</span>
      </Button>

      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        contentType={contentType}
        contentId={contentId}
        contentTitle={contentTitle}
      />
    </>
  );
}