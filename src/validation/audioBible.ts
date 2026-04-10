import type { AudioBible, AudioFormat } from '@/types/audioBible';

const AUDIO_FORMATS: AudioFormat[] = ['mp3', 'm4a', 'wav'];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidBookId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 66;
}

function isValidChapter(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isAudioFormat(value: unknown): value is AudioFormat {
  return typeof value === 'string' && AUDIO_FORMATS.includes(value as AudioFormat);
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export function validateAudioBible(input: unknown): ValidationResult<AudioBible> {
  const errors: string[] = [];

  if (!isObject(input)) {
    return { success: false, errors: ['Input must be an object.'] };
  }

  if (!isNonEmptyString(input.translation_code)) errors.push('translation_code is required and must be a non-empty string.');
  if (!isNonEmptyString(input.book)) errors.push('book is required and must be a non-empty string.');
  if (!isValidBookId(input.book_id)) errors.push('book_id is required and must be an integer between 1 and 66.');
  if (!isValidChapter(input.chapter)) errors.push('chapter is required and must be an integer greater than or equal to 1.');
  if (!isValidUrl(input.audio_url)) errors.push('audio_url is required and must be a valid http/https URL.');
  if (!isPositiveNumber(input.duration_seconds)) errors.push('duration_seconds is required and must be a positive number.');

  if (input.narrator !== undefined && typeof input.narrator !== 'string') errors.push('narrator must be a string if provided.');

  if (input.file_size_mb !== undefined && !(typeof input.file_size_mb === 'number' && Number.isFinite(input.file_size_mb) && input.file_size_mb >= 0)) {
    errors.push('file_size_mb must be a non-negative number if provided.');
  }

  if (input.format !== undefined && !isAudioFormat(input.format)) errors.push(`format must be one of: ${AUDIO_FORMATS.join(', ')}.`);
  if (input.language_code !== undefined && !isNonEmptyString(input.language_code)) errors.push('language_code must be a non-empty string if provided.');
  if (input.is_available !== undefined && typeof input.is_available !== 'boolean') errors.push('is_available must be a boolean if provided.');

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      translation_code: input.translation_code as string,
      book: input.book as string,
      book_id: input.book_id as number,
      chapter: input.chapter as number,
      audio_url: input.audio_url as string,
      duration_seconds: input.duration_seconds as number,
      narrator: typeof input.narrator === 'string' ? input.narrator : undefined,
      file_size_mb: typeof input.file_size_mb === 'number' ? input.file_size_mb : undefined,
      format: isAudioFormat(input.format) ? input.format : 'mp3',
      language_code: typeof input.language_code === 'string' ? input.language_code : 'en',
      is_available: typeof input.is_available === 'boolean' ? input.is_available : true,
    },
  };
}