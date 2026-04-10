/**
 * ChapterSummarizer
 * Handles AI generation, validation, retry logic, and TTS for chapter summaries
 * Reusable across FloatingAudioBar, BibleReader, DrivingMode, etc.
 */

import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  buildChapterSummaryPrompt,
  formatSummaryForTTS,
  validateChapterSummary,
  buildChapterRetryPrompt,
  TTS_LANGUAGE_CODES
} from './chapterSummarizerUtils';
import { ERROR_CODES, ERROR_MESSAGES } from './verseExplainerUtils';

const ChapterSummarizer = React.forwardRef((props, ref) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const synth = useRef(window.speechSynthesis);
  const isSpeakingRef = useRef(false);

  // Expose method for parent to call
  React.useImperativeHandle(ref, () => ({
    playSummary: async (request) => {
      return playSummary(request);
    }
  }));

  const resumePlayback = (onResume) => {
    if (onResume) {
      onResume();
    }
  };

  const playSummary = async ({
    book,
    chapter,
    translation_code = 'WEB',
    translation_name = 'World English Bible',
    chapter_text,
    onSummaryStart,
    onSummaryEnd,
    onError,
    speed = 1.0,
    isDarkMode = false,
    language_code = 'en'
  }) => {
    // Prevent double-tap
    if (isSummarizing || isSpeakingRef.current) return;

    // Validate input
    if (!chapter_text || chapter_text.trim().length === 0) {
      toast.error(ERROR_MESSAGES[ERROR_CODES.MISSING_TEXT]);
      onError?.(ERROR_CODES.MISSING_TEXT);
      return;
    }

    setIsSummarizing(true);
    onSummaryStart?.();

    let retryCount = 0;
     const MAX_RETRIES = 1;
     let summary = null;
     let prompt = buildChapterSummaryPrompt({
       translation_name,
       translation_code,
       book_name: book,
       chapter,
       chapter_text,
       language_code
     });

    try {
      // AI generation loop with retry
      while (retryCount <= MAX_RETRIES) {
        try {
          summary = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false
          });
        } catch (aiError) {
          toast.error(ERROR_MESSAGES[ERROR_CODES.AI_FAILED]);
          onError?.(ERROR_CODES.AI_FAILED);
          setIsSummarizing(false);
          return;
        }

        if (!summary || typeof summary !== 'string' || summary.trim().length === 0) {
          toast.error(ERROR_MESSAGES[ERROR_CODES.AI_EMPTY]);
          onError?.(ERROR_CODES.AI_EMPTY);
          setIsSummarizing(false);
          return;
        }

        // Format for TTS (add line breaks for pacing)
        summary = formatSummaryForTTS(summary);

        // Validate against guardrails
        const validation = validateChapterSummary(summary);
        if (!validation.valid) {
          if (retryCount < MAX_RETRIES) {
            // Retry once with stricter prompt
            prompt = buildChapterRetryPrompt(prompt, validation.issue);
            retryCount++;
            continue;
          } else {
            // Max retries reached
            toast.error(ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED]);
            onError?.(ERROR_CODES.VALIDATION_FAILED);
            setIsSummarizing(false);
            return;
          }
        }

        // Passed validation, break loop
        break;
      }

      if (!summary) {
        toast.error(ERROR_MESSAGES[ERROR_CODES.AI_EMPTY]);
        onError?.(ERROR_CODES.AI_EMPTY);
        setIsSummarizing(false);
        return;
      }

      // Stop any current audio
      synth.current.cancel();
      isSpeakingRef.current = true;

      // Play summary with language-specific TTS
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.lang = TTS_LANGUAGE_CODES[language_code] || TTS_LANGUAGE_CODES.en;
      utterance.rate = speed;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSummarizing(false);
        onSummaryEnd?.();
      };

      utterance.onerror = (error) => {
        isSpeakingRef.current = false;
        toast.error(ERROR_MESSAGES[ERROR_CODES.TTS_FAILED]);
        onError?.(ERROR_CODES.TTS_FAILED);
        setIsSummarizing(false);
        onSummaryEnd?.();
      };

      synth.current.speak(utterance);
    } catch (error) {
      console.error('Error in ChapterSummarizer:', error);
      toast.error(ERROR_MESSAGES[ERROR_CODES.AI_FAILED]);
      onError?.(ERROR_CODES.AI_FAILED);
      setIsSummarizing(false);
      onSummaryEnd?.();
    }
  };

  // This is a logic-only component; it doesn't render anything
  return null;
});

ChapterSummarizer.displayName = 'ChapterSummarizer';

export default ChapterSummarizer;