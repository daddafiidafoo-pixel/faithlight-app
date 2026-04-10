import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, RotateCcw, ChevronRight } from 'lucide-react';
import { useI18n } from '../I18nProvider';

/**
 * ContinueAudioCard
 * 
 * Show if user has incomplete AudioListenProgress
 * Display book/chapter + resume button
 */
export default function ContinueAudioCard({ progress, onResume }) {
  const { t } = useI18n();
  const [restarting, setRestarting] = useState(false);

  if (!progress) return null;

  const progressPercent = progress.duration_seconds
    ? Math.round((progress.last_position_seconds / progress.duration_seconds) * 100)
    : 0;

  const handleRestart = async () => {
    setRestarting(true);
    onResume(progress, 0); // Force restart from 0
    setRestarting(false);
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {t('audio.continueTitle', 'Continue Listening')}
          </h3>
          <p className="text-sm text-gray-600">
            {progress.book_name} {progress.chapter}
          </p>
        </div>

        {progress.duration_seconds && (
          <div className="space-y-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">{progressPercent}% complete</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onResume(progress, progress.last_position_seconds)}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            {t('audio.resume', 'Resume')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            onClick={handleRestart}
            disabled={restarting}
            variant="outline"
            size="icon"
            title={t('audio.restart', 'Restart chapter')}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}