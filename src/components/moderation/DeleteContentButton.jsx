import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteContentButton({ 
  contentType, 
  contentId, 
  isAuthor, 
  onDelete 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isAuthor) {
    return null;
  }

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete the content (post/comment)
      if (contentType === 'post') {
        await base44.entities.CommunityPost.delete(contentId);
      } else if (contentType === 'comment') {
        await base44.entities.PostComment.delete(contentId);
      }

      toast.success('Content deleted');
      setOpen(false);
      onDelete?.();
    } catch (error) {
      toast.error('Failed to delete content');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-gray-500 hover:text-red-600 hover:bg-red-50 gap-1"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Delete</span>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {contentType}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The {contentType} will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}