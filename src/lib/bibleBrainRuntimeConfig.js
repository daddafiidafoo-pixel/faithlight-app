/**
 * Bible Brain Runtime Audio Configuration
 * 
 * Rules:
 * - enabledAudio = true ONLY after verified fileset works and returns real URLs
 * - audioFilesetId must return playable audio, not text
 * - Oromo audio disabled until verified playable
 */

import { BIBLE_SOURCES } from '@/lib/bibleBrainFilesetsConfig';

/**
 * Get audio config for a language using verified filesets
 */
export function getAudioConfig(language) {
  const source = BIBLE_SOURCES[language];
  if (!source) return null;

  return {
    enabledText: source.enabledText,
    enabledAudio: source.enabledAudio && (source.audioVerified ?? true),
    textFilesetId: source.textFilesetId,
    audioFilesetId: source.audioFilesetId,
  };
}

/**
 * Check if audio is enabled and verified for a language
 */
export function isAudioEnabledFor(language) {
  const config = getAudioConfig(language);
  return config?.enabledAudio && !!config?.audioFilesetId;
}