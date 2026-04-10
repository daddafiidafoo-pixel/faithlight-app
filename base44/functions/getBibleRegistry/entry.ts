/**
 * Get Bible Pack Registry
 * Returns available offline packs for download
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const languageCode = url.searchParams.get('lang');
    const type = url.searchParams.get('type') || 'text';

    const base44 = createClientFromRequest(req);

    // Build query filter
    const query = {
      status: 'active',
    };
    
    if (languageCode) {
      query.languageCode = languageCode;
    }
    
    if (type) {
      query.type = type;
    }

    // Fetch packs from database
    const packs = await base44.asServiceRole.entities.BiblePack.filter(
      query,
      '-packVersion',
      100
    );

    // Group by packId and get latest version for each
    const latestPacks = {};
    packs.forEach(pack => {
      if (!latestPacks[pack.packId] || 
          pack.packVersion > latestPacks[pack.packId].packVersion) {
        latestPacks[pack.packId] = pack;
      }
    });

    const response = {
      packs: Object.values(latestPacks),
      timestamp: new Date().toISOString(),
    };

    return Response.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Registry fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch registry' },
      { status: 500 }
    );
  }
});