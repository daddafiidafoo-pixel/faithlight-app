import type { AudioBible, AudioFormat } from '@/types/audioBible';

type CreateAudioBibleInput = {
  translation_code: string;
  book: string;
  book_id: number;
  chapter: number;
  audio_url: string;
  duration_seconds: number;
  narrator?: string;
  file_size_mb?: number;
  format?: AudioFormat;
  language_code?: string;
  is_available?: boolean;
};

export function createAudioBible(input: CreateAudioBibleInput): AudioBible {
  return {
    translation_code: input.translation_code,
    book: input.book,
    book_id: input.book_id,
    chapter: input.chapter,
    audio_url: input.audio_url,
    duration_seconds: input.duration_seconds,
    narrator: input.narrator,
    file_size_mb: input.file_size_mb,
    format: input.format ?? 'mp3',
    language_code: input.language_code ?? 'en',
    is_available: input.is_available ?? true,
  };
}