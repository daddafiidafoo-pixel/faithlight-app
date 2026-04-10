import React, { useState } from 'react';
import { Moon, Gauge } from 'lucide-react';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [
  { label: 'Off', minutes: null },
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
];

export default function InlineSpeedSleepControls({
  speed, onSpeedChange,
  sleepTimer, sleepTimeRemaining, onSleepTimerChange,
  isDarkMode
}) {
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const bgActive = isDarkMode ? '#2A3A2C' : '#E8F5E9';

  const formatRemaining = () => {
    if (!sleepTimeRemaining) return '';
    const m = Math.floor(sleepTimeRemaining / 60);
    const s = sleepTimeRemaining % 60;
    return ` ${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Speed Row */}
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 flex-shrink-0" style={{ color: mutedColor }} />
        <span className="text-xs w-10 flex-shrink-0" style={{ color: mutedColor }}>Speed</span>
        <div className="flex gap-1 flex-wrap">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
              style={{
                backgroundColor: speed === s ? primaryColor : 'transparent',
                color: speed === s ? '#fff' : textColor,
                border: `1px solid ${speed === s ? primaryColor : borderColor}`,
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Timer Row */}
      <div className="flex items-center gap-2">
        <Moon className="w-4 h-4 flex-shrink-0" style={{ color: sleepTimer ? primaryColor : mutedColor }} />
        <span className="text-xs w-10 flex-shrink-0" style={{ color: mutedColor }}>Sleep</span>
        <div className="flex gap-1 flex-wrap">
          {SLEEP_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => onSleepTimerChange(opt.minutes)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
              style={{
                backgroundColor: sleepTimer === opt.minutes ? primaryColor : 'transparent',
                color: sleepTimer === opt.minutes ? '#fff' : textColor,
                border: `1px solid ${sleepTimer === opt.minutes ? primaryColor : borderColor}`,
              }}
            >
              {opt.label}{sleepTimer === opt.minutes && opt.minutes ? formatRemaining() : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}