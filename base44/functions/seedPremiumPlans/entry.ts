import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * seedPremiumPlans - Create Premium subscription products in Stripe
 * Run once to set up the products/prices for checkout
 * Returns product and price IDs to use in frontend
 */
Deno.serve(async (req) => {
  try {
    console.log('Creating Premium Monthly product and price...');

    // Create product
    const product = await stripe.products.create({
      name: 'FaithLight Premium',
      description: 'Unlimited Bible reading, AI tools, offline access, and more',
      type: 'service',
      metadata: { plan_type: 'premium' }
    });

    // Create price (monthly, $9.99)
    const price = await stripe.prices.create({
      product: product.id,
      type: 'recurring',
      recurring: { interval: 'month', interval_count: 1 },
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      metadata: { plan_name: 'Premium Monthly' }
    });

    const result = {
      success: true,
      product_id: product.id,
      price_id: price.id,
      plan_name: 'Premium Monthly',
      amount_usd: 9.99,
      message: 'Save these IDs for your frontend! Use price_id in checkout.'
    };

    console.log('✓ Premium plans created:', result);
    return Response.json(result);
  } catch (error) {
    console.error('Error creating plans:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});