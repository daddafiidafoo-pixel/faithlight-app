import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const AFRICA_COUNTRIES = [
  'NG', 'KE', 'GH', 'ET', 'ZA', 'UG', 'TZ', 'RW', 'CM', 'SN',
  'CI', 'ZM', 'ZW', 'MW', 'SL', 'LR', 'MZ', 'BW', 'NA', 'BF',
  'NE', 'SD', 'SO', 'DJ', 'EG', 'LY', 'TN', 'MA', 'DZ', 'AO'
];

const PRICING = {
  developed: {
    basic: 5,
    premium: 10,
    currency: '$'
  },
  africa: {
    basic: 2,
    premium: 5,
    currency: '$'
  }
};

// Helper function to detect country from IP
async function getCountryFromIP(clientIP) {
  try {
    // Use ip-api.com (free, no auth needed)
    const response = await fetch(`https://ip-api.com/json/${clientIP}?fields=countryCode`);
    const data = await response.json();
    return data.countryCode || null;
  } catch (error) {
    console.error('[getRegionalPricing] IP detection failed:', error.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get client IP from request headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                    req.headers.get('cf-connecting-ip') ||
                    req.headers.get('x-real-ip') ||
                    '1.1.1.1'; // fallback

    // Detect country
    const countryCode = await getCountryFromIP(clientIP);
    const isAfrica = countryCode && AFRICA_COUNTRIES.includes(countryCode);

    const pricingTier = isAfrica ? PRICING.africa : PRICING.developed;

    return Response.json({
      countryCode,
      isAfrica: !!isAfrica,
      pricing: {
        basic: pricingTier.basic,
        premium: pricingTier.premium,
        currency: pricingTier.currency,
      },
    });
  } catch (error) {
    console.error('[getRegionalPricing] Error:', error.message);
    // Fallback to developed world pricing on error
    return Response.json({
      countryCode: null,
      isAfrica: false,
      pricing: PRICING.developed,
      error: error.message,
    });
  }
});