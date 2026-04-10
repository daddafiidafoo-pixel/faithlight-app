import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Seeds the CountryPricingTier entity with regional pricing data
 * Run once to populate the database
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const pricingData = [
      // TIER 1 - AFRICA (Developing)
      { country_code: 'ET', country_name: 'Ethiopia', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'KE', country_name: 'Kenya', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'UG', country_name: 'Uganda', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'TZ', country_name: 'Tanzania', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'RW', country_name: 'Rwanda', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'NG', country_name: 'Nigeria', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'GH', country_name: 'Ghana', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'CD', country_name: 'Democratic Republic of Congo', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'CM', country_name: 'Cameroon', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },
      { country_code: 'ZA', country_name: 'South Africa', tier: 'tier_1', monthly_price_cents: 199, yearly_price_cents: 1499, currency: 'USD', region: 'africa' },

      // TIER 2 - ASIA & MIDDLE EAST (Mixed Economies)
      { country_code: 'IN', country_name: 'India', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'PH', country_name: 'Philippines', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'ID', country_name: 'Indonesia', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'PK', country_name: 'Pakistan', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'BD', country_name: 'Bangladesh', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'EG', country_name: 'Egypt', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'JO', country_name: 'Jordan', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'LB', country_name: 'Lebanon', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'VN', country_name: 'Vietnam', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },
      { country_code: 'TH', country_name: 'Thailand', tier: 'tier_2', monthly_price_cents: 399, yearly_price_cents: 2999, currency: 'USD', region: 'asia_middle_east' },

      // TIER 3 - EUROPE, NORTH AMERICA, DEVELOPED REGIONS
      { country_code: 'US', country_name: 'United States', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'USD', region: 'europe_north_america_oceania' },
      { country_code: 'CA', country_name: 'Canada', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'USD', region: 'europe_north_america_oceania' },
      { country_code: 'GB', country_name: 'United Kingdom', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'GBP', region: 'europe_north_america_oceania' },
      { country_code: 'DE', country_name: 'Germany', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'EUR', region: 'europe_north_america_oceania' },
      { country_code: 'FR', country_name: 'France', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'EUR', region: 'europe_north_america_oceania' },
      { country_code: 'NL', country_name: 'Netherlands', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'EUR', region: 'europe_north_america_oceania' },
      { country_code: 'AU', country_name: 'Australia', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'USD', region: 'europe_north_america_oceania' },
      { country_code: 'NZ', country_name: 'New Zealand', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'USD', region: 'europe_north_america_oceania' },
      { country_code: 'JP', country_name: 'Japan', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'USD', region: 'europe_north_america_oceania' },
      { country_code: 'SG', country_name: 'Singapore', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'USD', region: 'europe_north_america_oceania' },
      { country_code: 'KR', country_name: 'South Korea', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'USD', region: 'europe_north_america_oceania' },
      { country_code: 'CH', country_name: 'Switzerland', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'CHF', region: 'europe_north_america_oceania' },
      { country_code: 'SE', country_name: 'Sweden', tier: 'tier_3', monthly_price_cents: 699, yearly_price_cents: 5999, currency: 'SEK', region: 'europe_north_america_oceania' },
    ];

    // Bulk create pricing data
    try {
      await base44.asServiceRole.entities.CountryPricingTier.bulkCreate(pricingData);
      return Response.json({
        success: true,
        message: `Seeded ${pricingData.length} country pricing tiers`,
        dataSeeded: pricingData.length
      });
    } catch (err) {
      // If bulk create fails, try individual creates
      let successCount = 0;
      for (const data of pricingData) {
        try {
          await base44.asServiceRole.entities.CountryPricingTier.create(data);
          successCount++;
        } catch (e) {
          console.warn(`Failed to create pricing for ${data.country_code}:`, e.message);
        }
      }
      return Response.json({
        success: true,
        message: `Seeded ${successCount} out of ${pricingData.length} country pricing tiers`,
        dataSeeded: successCount
      });
    }

  } catch (error) {
    console.error('Seeding Error:', error);
    return Response.json(
      { error: 'Seeding failed', details: error.message },
      { status: 500 }
    );
  }
});