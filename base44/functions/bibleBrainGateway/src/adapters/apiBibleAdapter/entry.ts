/**
 * API.Bible Provider Adapter
 * Handles requests to API.Bible for text-based translations
 */

import { PassageResponse, SearchResult } from '../types/bible';

interface ApiBiblePassageResponse {
  data: {
    id: string;
    reference: string;
    content: string;
  };
}

export class ApiBibleAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.api.bible/v1';

  constructor() {
    this.apiKey = process.env.API_BIBLE_KEY || '';
    if (!this.apiKey) {
      console.warn('[ApiBibleAdapter] API_BIBLE_KEY not set');
    }
  }

  async getPassage(
    translationId: string,
    reference: string,
    format: 'text' | 'html' = 'html'
  ): Promise<PassageResponse | null> {
    try {
      // TODO: Implement API.Bible passage fetch
      // 1. Parse reference (e.g., "Philippians 4:13")
      // 2. Call API.Bible endpoint
      // 3. Normalize to PassageResponse
      // 4. Handle errors and rate limits

      console.log(`[ApiBibleAdapter] Fetching ${reference} from ${translationId}`);

      // Placeholder
      return null;
    } catch (error) {
      console.error('[ApiBibleAdapter] Error fetching passage:', error);
      return null;
    }
  }

  async search(
    translationId: string,
    query: string
  ): Promise<SearchResult[]> {
    try {
      // TODO: Implement API.Bible search
      // 1. Call API.Bible search endpoint
      // 2. Normalize results to SearchResult[]
      // 3. Handle pagination if needed

      console.log(`[ApiBibleAdapter] Searching "${query}" in ${translationId}`);

      // Placeholder
      return [];
    } catch (error) {
      console.error('[ApiBibleAdapter] Error searching:', error);
      return [];
    }
  }

  async getAvailableTranslations(
    languageCode: string
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      // TODO: Implement fetching available translations for language
      // 1. Call API.Bible bibles endpoint
      // 2. Filter by language
      // 3. Return normalized list

      console.log(`[ApiBibleAdapter] Fetching translations for ${languageCode}`);

      // Placeholder
      return [];
    } catch (error) {
      console.error('[ApiBibleAdapter] Error fetching translations:', error);
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

    const response = await fetch(url.toString(), {
      headers: {
        'api-key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`API.Bible error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const apiBibleAdapter = new ApiBibleAdapter();