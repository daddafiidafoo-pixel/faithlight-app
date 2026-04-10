export type AudioFormat = 'mp3' | 'm4a' | 'wav';

export interface AudioBible {
  translation_code: string;
  book: string;
  book_id: number; // 1-66
  chapter: number;
  audio_url: string;
  duration_seconds: number;
  narrator?: string;
  file_size_mb?: number;
  format: AudioFormat;
  language_code: string;
  is_available: boolean;
}