/**
 * Check Bible Pack Updates
 * Compares installed packs against latest registry versions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await req.json();
    const { installed = [] } = body;

    if (!Array.isArray(installed)) {
      return Response.json(
        { error: 'installed must be an array' },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Get all active packs from registry
    const allPacks = await base44.asServiceRole.entities.BiblePack.filter(
      { status: 'active' },
      '-packVersion',
      500
    );

    // Find latest version for each packId
    const latestByPackId = {};
    allPacks.forEach(pack => {
      if (!latestByPackId[pack.packId] || 
          pack.packVersion > latestByPackId[pack.packId].packVersion) {
        latestByPackId[pack.packId] = pack;
      }
    });

    // Check for updates
    const updates = [];
    installed.forEach(installedPack => {
      const latestPack = latestByPackId[installedPack.packId];
      
      if (latestPack && latestPack.packVersion > installedPack.packVersion) {
        updates.push({
          packId: installedPack.packId,
          current: installedPack.packVersion,
          latest: latestPack.packVersion,
          downloadUrl: latestPack.downloadUrl,
          contentHash: latestPack.contentHash,
          fileSizeBytes: latestPack.fileSizeBytes,
          minAppVersion: latestPack.minAppVersion,
        });
      }
    });

    return Response.json(
      { updates },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Update check error:', error);
    return Response.json(
      { error: 'Failed to check updates' },
      { status: 500 }
    );
  }
});