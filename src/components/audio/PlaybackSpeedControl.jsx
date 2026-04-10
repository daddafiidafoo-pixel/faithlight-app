import React from 'react';
import { Button } from '@/components/ui/button';

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

export default function PlaybackSpeedControl({ currentSpeed, onSpeedChange, isDarkMode }) {
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  return (
    <div className="space-y-2">
      <p className="text-xs text-center" style={{ color: mutedColor }}>
        Playback Speed
      </p>
      <div className="flex justify-center gap-2">
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className="px-3 py-1.5 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: currentSpeed === speed ? primaryColor : bgColor,
              color: currentSpeed === speed ? '#FFFFFF' : textColor,
              border: `1px solid ${currentSpeed === speed ? primaryColor : borderColor}`
            }}
            title={`Playback speed ${speed}x`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}