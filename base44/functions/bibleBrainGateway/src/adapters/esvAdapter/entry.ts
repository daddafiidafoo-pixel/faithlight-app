/**
 * ESV API Provider Adapter
 * Handles requests to ESV API for premium English translations
 */

import { PassageResponse } from '../types/bible';

export class ESVAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.esv.org/v3';

  constructor() {
    this.apiKey = process.env.ESV_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[ESVAdapter] ESV_API_KEY not set');
    }
  }

  async getPassage(
    translationId: string,
    reference: string,
    includeHeadings: boolean = false,
    includeFootnotes: boolean = false
  ): Promise<PassageResponse | null> {
    try {
      // TODO: Implement ESV passage fetch
      // 1. Parse reference
      // 2. Call ESV API with desired options
      // 3. Normalize to PassageResponse
      // 4. Handle copyright/attribution rules

      console.log(`[ESVAdapter] Fetching ${reference}`);

      // Placeholder
      return null;
    } catch (error) {
      console.error('[ESVAdapter] Error fetching passage:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Token ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`ESV error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export const esvAdapter = new ESVAdapter();