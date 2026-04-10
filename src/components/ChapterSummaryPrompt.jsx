/**
 * ChapterSummaryPrompt
 * Non-blocking inline UI: appears in FloatingAudioBar after chapter completion
 * Auto-dismisses after 8–12 seconds if no user action
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';

export default function ChapterSummaryPrompt({
  book,
  chapter,
  onSummary,
  onSkip,
  isDarkMode = false,
  autoHideDuration = 10000 // 10 seconds
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onSkip?.();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [isVisible, autoHideDuration, onSkip]);

  if (!isVisible) return null;

  const bgColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        border: `1px solid ${borderColor}`
      }}
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
        <p className="text-sm font-medium" style={{ color: textColor }}>
          Chapter {chapter} finished. Summary?
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            setIsVisible(false);
            onSummary?.();
          }}
          className="h-8 px-3 text-xs font-semibold"
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
        >
          Summary
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsVisible(false);
            onSkip?.();
          }}
          className="h-8 px-2"
          style={{ color: mutedColor }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}