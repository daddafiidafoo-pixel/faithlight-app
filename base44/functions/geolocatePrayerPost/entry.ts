import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Anonymize coordinates to ~100km radius (roughly 1 degree)
function anonymizeCoordinates(lat, lng) {
  const offset = Math.floor(Math.random() * 100) / 100;
  return {
    latitude: parseFloat((lat + offset).toFixed(2)),
    longitude: parseFloat((lng + offset).toFixed(2))
  };
}

// Reverse geocode to get region name (simplified - uses coordinate ranges)
function getRegionName(lat, lng) {
  // Simplified region mapping - in production, use a real geocoding API
  if (lat > 50) return 'Northern Europe/North America';
  if (lat > 40) return 'Central Europe/North America';
  if (lat > 30) return 'Mediterranean/Middle East';
  if (lat > 0) return 'Africa/South Asia';
  if (lat > -30) return 'Southern Africa/South America';
  return 'Antarctica/Southern Regions';
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prayer_post_id, latitude, longitude } = await req.json();

    if (!prayer_post_id || latitude === undefined || longitude === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Anonymize coordinates
    const anonCoords = anonymizeCoordinates(latitude, longitude);
    const region = getRegionName(latitude, longitude);

    // Create prayer location record
    const location = await base44.entities.PrayerLocation.create({
      prayer_post_id,
      latitude: anonCoords.latitude,
      longitude: anonCoords.longitude,
      region,
      user_email: user.email
    });

    console.log(`Prayer location created for user ${user.email}`);
    return Response.json({ success: true, location });
  } catch (error) {
    console.error('Error creating prayer location:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});