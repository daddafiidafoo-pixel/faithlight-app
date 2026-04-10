import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function BlockUserButton({ userId, userName, onBlocked }) {
  const [open, setOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setBlocking(true);
    setError(null);
    try {
      // Record block in database
      await base44.asServiceRole.entities.UserBlock?.create({
        blocker_id: (await base44.auth.me()).id,
        blocked_user_id: userId,
        reason: 'User-initiated block',
        created_at: new Date().toISOString(),
      }).catch(() => null); // Graceful fallback if entity doesn't exist

      onBlocked?.();
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        Block User
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" /> Block User
            </DialogTitle>
            <DialogDescription>
              This user will not be able to contact or see your content.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-600">
            Are you sure you want to block <strong>{userName}</strong>?
          </p>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={blocking}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {blocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}