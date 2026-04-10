import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Creates or retrieves Stripe products and prices for regional pricing
 * Run this once to set up your Stripe catalog
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can initialize products
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const products = [];

    // 1. BASIC - Global ($5/month)
    const basicGlobal = await stripe.products.create({
      name: 'FaithLight Basic - Global',
      description: 'Unlimited reading, audio, and extended AI support',
      metadata: { tier: 'basic', region: 'global' },
    });

    const basicGlobalPrice = await stripe.prices.create({
      product: basicGlobal.id,
      unit_amount: 500, // $5.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'basic', region: 'global' },
    });

    products.push({
      name: 'Basic Global',
      productId: basicGlobal.id,
      priceId: basicGlobalPrice.id,
      amount: 500,
    });

    // 2. BASIC - Africa ($2/month)
    const basicAfrica = await stripe.products.create({
      name: 'FaithLight Basic - Africa',
      description: 'Unlimited reading, audio, and extended AI support',
      metadata: { tier: 'basic', region: 'africa' },
    });

    const basicAfricaPrice = await stripe.prices.create({
      product: basicAfrica.id,
      unit_amount: 200, // $2.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'basic', region: 'africa' },
    });

    products.push({
      name: 'Basic Africa',
      productId: basicAfrica.id,
      priceId: basicAfricaPrice.id,
      amount: 200,
    });

    // 3. PREMIUM - Global ($15/month)
    const premiumGlobal = await stripe.products.create({
      name: 'FaithLight Premium - Global',
      description: 'Everything unlocked: unlimited AI, sermon tools, certificates',
      metadata: { tier: 'premium', region: 'global' },
    });

    const premiumGlobalPrice = await stripe.prices.create({
      product: premiumGlobal.id,
      unit_amount: 1500, // $15.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'premium', region: 'global' },
    });

    products.push({
      name: 'Premium Global',
      productId: premiumGlobal.id,
      priceId: premiumGlobalPrice.id,
      amount: 1500,
    });

    // 4. PREMIUM - Africa ($5/month)
    const premiumAfrica = await stripe.products.create({
      name: 'FaithLight Premium - Africa',
      description: 'Everything unlocked: unlimited AI, sermon tools, certificates',
      metadata: { tier: 'premium', region: 'africa' },
    });

    const premiumAfricaPrice = await stripe.prices.create({
      product: premiumAfrica.id,
      unit_amount: 500, // $5.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'premium', region: 'africa' },
    });

    products.push({
      name: 'Premium Africa',
      productId: premiumAfrica.id,
      priceId: premiumAfricaPrice.id,
      amount: 500,
    });

    console.log('[initializeStripeProducts] Created products:', products);

    return Response.json({
      success: true,
      message: 'Stripe products and prices created successfully',
      products,
      instructions: `
Update your PRICE_IDS in UpgradePremiumPage.jsx:
- price_basic_global_5: ${basicGlobalPrice.id}
- price_basic_africa_2: ${basicAfricaPrice.id}
- price_premium_global_15: ${premiumGlobalPrice.id}
- price_premium_africa_5: ${premiumAfricaPrice.id}
      `,
    });
  } catch (error) {
    console.error('[initializeStripeProducts] Error:', error.message);
    return Response.json({
      error: error.message,
      note: 'If products already exist, they may not be created again. Check your Stripe dashboard.',
    }, { status: 400 });
  }
});