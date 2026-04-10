import React from 'react';
import { Button } from '@/components/ui/button';
import { SkipBack, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { useI18n } from '../I18nProvider';

/**
 * PlayerControls
 * 
 * RTL-aware audio player controls
 * - Mirrors button order in RTL (Next | Play | Prev instead of Prev | Play | Next)
 * - Handles playback state and speed control
 */
export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onSpeedChange,
  speed = 1,
  speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2],
  disabled = false,
}) {
  const { isRTL } = useI18n();

  // In RTL: Next should come first, then Play, then Prev
  // In LTR: Prev, Play, Next
  const controls = isRTL
    ? [
        { icon: SkipForward, onClick: onNext, label: 'Next' },
        { icon: isPlaying ? Pause : Play, onClick: onPlayPause, label: isPlaying ? 'Pause' : 'Play' },
        { icon: SkipBack, onClick: onPrevious, label: 'Previous' },
      ]
    : [
        { icon: SkipBack, onClick: onPrevious, label: 'Previous' },
        { icon: isPlaying ? Pause : Play, onClick: onPlayPause, label: isPlaying ? 'Pause' : 'Play' },
        { icon: SkipForward, onClick: onNext, label: 'Next' },
      ];

  return (
    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Control buttons */}
      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {controls.map((ctrl, idx) => (
          <Button
            key={idx}
            size="lg"
            variant="outline"
            onClick={ctrl.onClick}
            disabled={disabled}
            title={ctrl.label}
            className="rounded-full"
          >
            <ctrl.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>

      {/* Speed selector */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Volume2 className="w-4 h-4 text-gray-500" />
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="text-xs px-2 py-1 border border-gray-300 rounded-lg bg-white"
        >
          {speedOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}