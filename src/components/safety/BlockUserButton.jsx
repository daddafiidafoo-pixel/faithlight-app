import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Ban, Loader2, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BlockUserButton({ userId, userName, scope = 'global', scopeId = null }) {
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };
    getUser();
  }, []);

  const { data: userBlocks = [] } = useQuery({
    queryKey: ['user-blocks', user?.id],
    queryFn: () =>
      base44.entities.UserBlock.filter({
        blocker_id: user.id,
        blocked_id: userId,
      }),
    enabled: !!user,
  });

  useEffect(() => {
    setIsBlocked(userBlocks.length > 0);
  }, [userBlocks]);

  const blockMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.UserBlock.create({
        blocker_id: user.id,
        blocked_id: userId,
        scope,
        scope_id: scopeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocks', user?.id] });
      setShowDialog(false);
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async () => {
      const block = userBlocks[0];
      return await base44.entities.UserBlock.delete(block.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocks', user?.id] });
    },
  });

  if (!user || user.id === userId) {
    return null;
  }

  return (
    <>
      <Button
        variant={isBlocked ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => {
          if (isBlocked) {
            unblockMutation.mutate();
          } else {
            setShowDialog(true);
          }
        }}
        disabled={blockMutation.isPending || unblockMutation.isPending}
        className="gap-2"
      >
        {blockMutation.isPending || unblockMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
          </>
        ) : isBlocked ? (
          <>
            <Check className="w-4 h-4" />
            Blocked
          </>
        ) : (
          <>
            <Ban className="w-4 h-4" />
            Block
          </>
        )}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't see messages from {userName} or receive notifications from them. They won't know they're
              blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blockMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Block User
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}