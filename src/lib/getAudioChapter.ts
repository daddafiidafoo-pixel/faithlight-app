import type { AudioLanguageCode } from "@/data/audioBibleLanguages";
import { audioBibleManifest } from "@/data/audioBibleManifest";

export function getAudioChapter(
  language: AudioLanguageCode,
  book: string,
  chapter: number
) {
  return audioBibleManifest[language]?.[book]?.[chapter] ?? null;
}