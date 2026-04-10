import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share2, StopCircle, Monitor } from 'lucide-react';

export default function ScreenShareManager({
  isSharing,
  onStartShare,
  onStopShare,
  error
}) {
  const [showOptions, setShowOptions] = useState(false);

  const handleShare = async (sourceType) => {
    try {
      const constraints = {
        audio: false,
        video: {
          cursor: 'always'
        }
      };

      if (sourceType === 'window') {
        // @ts-ignore - getDisplayMedia is not fully typed
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        onStartShare?.(stream);
      } else if (sourceType === 'tab') {
        // @ts-ignore
        const stream = await navigator.mediaDevices.getDisplayMedia({
          ...constraints,
          audio: true
        });
        onStartShare?.(stream);
      }
      setShowOptions(false);
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  if (isSharing) {
    return (
      <div className="fixed top-4 right-4 bg-red-600 text-white rounded-lg p-3 flex items-center gap-3">
        <Monitor className="w-5 h-5 animate-pulse" />
        <span className="text-sm font-medium">Sharing your screen</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onStopShare}
          className="text-white hover:bg-red-700"
        >
          <StopCircle className="w-4 h-4" />
          Stop
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowOptions(!showOptions)}
        variant="outline"
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share Screen
      </Button>

      {showOptions && (
        <Card className="absolute top-12 right-0 w-48 p-2 space-y-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleShare('window')}
            className="w-full justify-start"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Share Window
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleShare('tab')}
            className="w-full justify-start"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Share Tab
          </Button>
        </Card>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}