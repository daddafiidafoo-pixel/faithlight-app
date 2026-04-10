import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Detects user's country and returns pricing tier
 * Uses IP geolocation as fallback, prefers billing country
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload = {};
    try {
      payload = await req.json();
    } catch {
      // No JSON body is fine
    }

    // Priority 1: User-provided country override
    let countryCode = payload.countryCode;

    // Priority 2: Get from user profile if saved
    if (!countryCode && user.country_code) {
      countryCode = user.country_code;
    }

    // Priority 3: Detect via IP geolocation
    if (!countryCode) {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') ||
                       'unknown';
      
      if (clientIp !== 'unknown') {
        try {
          // Free IP geolocation API
          const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
          const geoData = await geoResponse.json();
          countryCode = geoData.country_code;
        } catch (err) {
          console.warn('IP geolocation failed:', err.message);
        }
      }
    }

    // If still no country, default to Tier 3 (conservative)
    if (!countryCode) {
      countryCode = 'US';
    }

    // Fetch pricing tier for country
    const pricingTiers = await base44.entities.CountryPricingTier.filter(
      { country_code: countryCode.toUpperCase(), is_active: true },
      '-created_date',
      1
    );

    if (pricingTiers?.length === 0) {
      // Country not in database, return Tier 3 as default
      return Response.json({
        countryCode: countryCode.toUpperCase(),
        countryName: 'Unknown Country',
        tier: 'tier_3',
        monthlyPriceCents: 699,
        yearlyPriceCents: 5999,
        currency: 'USD',
        region: 'europe_north_america_oceania',
        isDefault: true
      });
    }

    const pricing = pricingTiers[0];
    return Response.json({
      countryCode: pricing.country_code,
      countryName: pricing.country_name,
      tier: pricing.tier,
      monthlyPriceCents: pricing.monthly_price_cents,
      yearlyPriceCents: pricing.yearly_price_cents,
      currency: pricing.currency,
      region: pricing.region,
      isDefault: false
    });

  } catch (error) {
    console.error('Country Pricing Tier Error:', error);
    return Response.json(
      { error: 'Failed to determine pricing tier', details: error.message },
      { status: 500 }
    );
  }
});