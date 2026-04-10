/**
 * Normalized Bible Gateway response types
 * All providers transform into these shapes
 */

export interface Language {
  code: string;
  name: string;
  locale: string;
  isActive: boolean;
}

export interface Translation {
  translationId: string;
  provider: 'api_bible' | 'biblebrain' | 'esv';
  name: string;
  languageCode: string;
  abbreviation: string;
  hasText: boolean;
  hasAudio: boolean;
  hasSearch: boolean;
  isActive: boolean;
}

export interface Book {
  bookId: string;
  name: string;
  abbreviation: string;
  translationId: string;
  sortOrder: number;
}

export interface Chapter {
  translationId: string;
  bookId: string;
  chapterNumber: number;
  verseCount?: number;
}

export interface PassageResponse {
  provider: string;
  language: string;
  translationId: string;
  translationName: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  reference: string;
  text: string;
  html?: string;
  audioUrl: string | null;
  audioAvailable: boolean;
  copyright?: string;
  attribution?: string;
}

export interface AudioResponse {
  provider: string;
  reference: string;
  language: string;
  translationName: string;
  audioUrl: string | null;
  streamType?: 'hls' | 'mp3' | 'aac';
  durationSec?: number;
  audioAvailable: boolean;
}

export interface SearchResult {
  reference: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  language: string;
  translationName: string;
}

export interface DailyVerse {
  dateKey: string;
  reference: string;
  verseText: string;
  explanation: string;
  audioUrl?: string;
  language: string;
  translationId: string;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: Date;
}