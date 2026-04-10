/**
 * BibleBrain Provider Adapter
 * Handles requests to BibleBrain for audio and rare languages
 */

import { PassageResponse, AudioResponse } from '../types/bible';

// Language code map: app codes → Bible Brain ISO codes
const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: "eng",
  om: "gaz",           // legacy → West Central Oromo
  hae: "hae",          // Eastern Oromo (Afaan Oromoo Bahaa)
  gaz: "gaz",          // West Central Oromo (Afaan Oromoo Lixaa Giddugaleessa)
  om_eastern: "hae",
  om_west_central: "gaz",
  am: "amh",
  sw: "swh",
  fr: "fra",
  ar: "ara",
  ti: "tir",
};

function resolveLanguageCode(appCode: string): string {
  return LANGUAGE_CODE_MAP[appCode] || appCode;
}

export class BibleBrainAdapter {
  private apiKey: string;
  private baseUrl = 'https://4.dbt.io/api';

  constructor() {
    this.apiKey = process.env.BIBLEBRAIN_API_KEY || process.env.BIBLE_BRAIN_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[BibleBrainAdapter] BIBLE_BRAIN_API_KEY not set');
    }
  }

  async getPassage(
    bibleId: string,
    reference: string,
    format: 'text' | 'html' = 'html'
  ): Promise<PassageResponse | null> {
    try {
      // TODO: Implement BibleBrain passage fetch
      // 1. Parse reference to extract book, chapter, verse
      // 2. Call BibleBrain bibles endpoint
      // 3. Handle DBP v4 FilesetId
      // 4. Normalize to PassageResponse
      // 5. Support both HTML and plain text formats

      console.log(`[BibleBrainAdapter] Fetching ${reference} from ${bibleId}`);

      // Placeholder
      return null;
    } catch (error) {
      console.error('[BibleBrainAdapter] Error fetching passage:', error);
      return null;
    }
  }

  async getAudio(
    bibleId: string,
    reference: string,
    language?: string
  ): Promise<AudioResponse> {
    try {
      // TODO: Implement BibleBrain audio fetch
      // 1. Use filesetId to identify audio variant
      // 2. Call BibleBrain audio endpoint
      // 3. Support HLS and MP3 formats
      // 4. Return stream URL with metadata

      console.log(`[BibleBrainAdapter] Fetching audio for ${reference} in ${bibleId}`);

      // Placeholder - return no audio available
      return {
        provider: 'biblebrain',
        reference,
        language: language || 'unknown',
        translationName: bibleId,
        audioUrl: null,
        audioAvailable: false
      };
    } catch (error) {
      console.error('[BibleBrainAdapter] Error fetching audio:', error);
      return {
        provider: 'biblebrain',
        reference,
        language: language || 'unknown',
        translationName: bibleId,
        audioUrl: null,
        audioAvailable: false
      };
    }
  }

  async getAvailableTranslations(
    languageCode: string
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      // Resolve app code (e.g. 'om', 'om_eastern') to Bible Brain ISO code (e.g. 'hae', 'gaz')
      const resolvedCode = resolveLanguageCode(languageCode);
      const url = `${this.baseUrl}/bibles?language_code=${resolvedCode}&key=${this.apiKey}&v=4`;

      console.log(`[BibleBrainAdapter] Fetching translations for ${languageCode} (resolved: ${resolvedCode})`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`BibleBrain error: ${response.status}`);
      }

      const data: any = await response.json();
      return (data?.data || []).map((b: any) => ({
        id: b.abbr,
        name: b.name,
        filesetId: b.filesets?.[0]?.id || null,
      }));
    } catch (error) {
      console.error('[BibleBrainAdapter] Error fetching translations:', error);
      return [];
    }
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    url.searchParams.append('key', this.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`BibleBrain error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const bibleBrainAdapter = new BibleBrainAdapter();