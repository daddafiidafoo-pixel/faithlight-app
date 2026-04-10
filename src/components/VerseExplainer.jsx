import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  postProcessForTTS,
  validateExplanation,
  buildRetryPrompt,
  makeToastMessage,
  TTS_LANGUAGE_CODES,
  LANGUAGE_PROMPTS
} from './verseExplainerUtils';

export default function VerseExplainer({
  verse,
  book,
  chapter,
  translation_code = 'WEB',
  translation_name = 'World English Bible',
  verses_text = '',
  onExplanationStart,
  onExplanationEnd,
  isDarkMode = false,
  language_code = 'en'
}) {
  const [isExplaining, setIsExplaining] = useState(false);
  const [errorCode, setErrorCode] = useState(null);
  const synth = useRef(window.speechSynthesis);
  const isSpeakingRef = useRef(false);
  const biblioAudioWasPlayingRef = useRef(false);

  const resumeBibleAudio = () => {
    if (biblioAudioWasPlayingRef.current && onExplanationEnd) {
      onExplanationEnd();
    }
  };

  const generateExplanation = async () => {
    // Prevent double-tap
    if (isExplaining || isSpeakingRef.current) return;
    
    if (!verse?.text && !verses_text) {
      setErrorCode(ERROR_CODES.MISSING_VERSE);
      toast.error(ERROR_MESSAGES[ERROR_CODES.MISSING_VERSE]);
      return;
    }

    setIsExplaining(true);
    setErrorCode(null);
    biblioAudioWasPlayingRef.current = true; // Assume Bible was playing
    onExplanationStart?.();

    let retryCount = 0;
    const MAX_RETRIES = 1;
    let explanation = null;

    try {
      // Determine if single verse or passage
      const isSingleVerse = !verses_text || verses_text.split('\n').length === 1;
      
      // Prepare Bible text
      const bibleText = verses_text || `${verse.verse}. ${verse.text}`;
      
      if (!bibleText || bibleText.trim().length === 0) {
        setErrorCode(ERROR_CODES.MISSING_TEXT);
        toast.error(ERROR_MESSAGES[ERROR_CODES.MISSING_TEXT]);
        setIsExplaining(false);
        resumeBibleAudio();
        return;
      }

      // Build verse range display
      let verseRange = verse.verse.toString();
      if (verses_text && verses_text.includes('\n')) {
        const lines = verses_text.trim().split('\n');
        const firstVerse = lines[0].split('.')[0];
        const lastVerse = lines[lines.length - 1].split('.')[0];
        verseRange = firstVerse === lastVerse ? firstVerse : `${firstVerse}–${lastVerse}`;
      }

      // Get language-specific prompts
       const langPrompts = LANGUAGE_PROMPTS[language_code] || LANGUAGE_PROMPTS.en;

       // Build base prompt
       let userPrompt = isSingleVerse
         ? `Briefly explain the meaning of this verse in a ${langPrompts.tone} way, based only on the given translation.

      Translation: ${translation_name} (${translation_code})
      Book: ${book}
      Chapter: ${chapter}
      Verse: ${verse.verse}

      Bible Text:
      """
      ${bibleText}
      """

      Explanation requirements:
      - Length: 30–60 seconds when spoken (approximately 75-150 words)
      - Use simple, clear language appropriate for ${langPrompts.language} speakers
      - Stay faithful to THIS translation's wording
      - Focus on the core meaning and encouragement
      - Do not add new doctrines or personal opinions
      - Do not quote other Bible verses
      - Do not mention translation history
      - Write in a natural, conversational tone for audio listening
      - Use short sentences
      - End with ONE gentle reflective sentence (not a question)

      Provide ONLY the explanation text, no introduction or preamble.`
         : `Explain the following Bible passage for a ${langPrompts.audience}.

Translation: ${translation_name} (${translation_code})
Book: ${book}
Chapter: ${chapter}
Verses: ${verseRange}

Bible Text:
"""
${bibleText}
"""

Explanation requirements:
- Length: 30–60 seconds when spoken (approximately 75-150 words)
- Use simple, clear language
- Stay faithful to THIS translation's wording
- Focus on the core meaning and encouragement
- Do not add new doctrines or personal opinions
- Do not quote other Bible verses
- Do not mention translation history
- Do not say "this means" repeatedly
- Write in a natural, conversational tone for audio listening
- Use short sentences
- End with ONE gentle reflective sentence (not a question)

Provide ONLY the explanation text, no introduction or preamble.`;

      // AI generation loop with retry
      while (retryCount <= MAX_RETRIES) {
        try {
          explanation = await base44.integrations.Core.InvokeLLM({
            prompt: userPrompt,
            add_context_from_internet: false
          });
        } catch (aiError) {
          setErrorCode(ERROR_CODES.AI_FAILED);
          toast.error(ERROR_MESSAGES[ERROR_CODES.AI_FAILED]);
          setIsExplaining(false);
          resumeBibleAudio();
          return;
        }

        if (!explanation || typeof explanation !== 'string' || explanation.trim().length === 0) {
          setErrorCode(ERROR_CODES.AI_EMPTY);
          toast.error(ERROR_MESSAGES[ERROR_CODES.AI_EMPTY]);
          setIsExplaining(false);
          resumeBibleAudio();
          return;
        }

        // Post-process for TTS
        explanation = postProcessForTTS(explanation);

        // Validate against guardrails
        const validation = validateExplanation(explanation);
        if (!validation.valid) {
          if (retryCount < MAX_RETRIES) {
            // Retry once with stricter prompt
            userPrompt = buildRetryPrompt(userPrompt, validation.issue);
            retryCount++;
            continue;
          } else {
            // Max retries reached
            setErrorCode(ERROR_CODES.VALIDATION_FAILED);
            toast.error(ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED]);
            setIsExplaining(false);
            resumeBibleAudio();
            return;
          }
        }

        // Passed validation, break loop
        break;
      }

      if (!explanation) {
        setErrorCode(ERROR_CODES.AI_EMPTY);
        toast.error(ERROR_MESSAGES[ERROR_CODES.AI_EMPTY]);
        setIsExplaining(false);
        resumeBibleAudio();
        return;
      }

      // Stop current Bible reading
      synth.current.cancel();
      isSpeakingRef.current = true;

      // Play explanation with language-specific TTS
      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.lang = TTS_LANGUAGE_CODES[language_code] || TTS_LANGUAGE_CODES.en;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsExplaining(false);
        resumeBibleAudio();
      };

      utterance.onerror = (error) => {
        isSpeakingRef.current = false;
        setErrorCode(ERROR_CODES.TTS_FAILED);
        toast.error(ERROR_MESSAGES[ERROR_CODES.TTS_FAILED]);
        setIsExplaining(false);
        resumeBibleAudio();
      };

      synth.current.speak(utterance);
    } catch (error) {
      console.error('Error generating explanation:', error);
      setErrorCode(ERROR_CODES.AI_FAILED);
      toast.error(ERROR_MESSAGES[ERROR_CODES.AI_FAILED]);
      setIsExplaining(false);
      resumeBibleAudio();
    }
  };

  const buttonColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const buttonBgHover = isDarkMode ? '#2A2F2C' : '#FAFAF7';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={generateExplanation}
      disabled={!verse || !verse.text || isExplaining}
      title="Get AI explanation of this verse"
      className="h-9 w-9"
      style={{ color: buttonColor }}
    >
      {isExplaining ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Lightbulb className="w-4 h-4" />
      )}
    </Button>
  );
}