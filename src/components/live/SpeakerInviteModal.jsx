import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Mic } from 'lucide-react';
import { useUITranslation } from '../useUITranslation';

export default function SpeakerInviteModal({ isOpen, onAccept, onDecline, isLoading = false }) {
  const { t } = useUITranslation();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Mic className="w-6 h-6 text-green-500" />
          </div>

          <AlertDialogTitle className="text-center">
            {t('live.invite.received.title', "You're invited to speak")}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            {t('live.invite.received.body', "You'll be heard by everyone in this Live Study.")}
          </AlertDialogDescription>

          <div className="w-full flex flex-col gap-3 pt-2">
            <AlertDialogAction
              onClick={onAccept}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Connecting…' : 'Accept & Speak'}
            </AlertDialogAction>

            <AlertDialogCancel onClick={onDecline} disabled={isLoading} className="border-gray-300">
              {t('live.invite.not_now', 'Not now')}
            </AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}