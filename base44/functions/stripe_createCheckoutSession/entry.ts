import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return Response.json({ error: 'priceId required' }, { status: 400 });
    }

    // Create or get Stripe customer
    let customerId;
    const existingSub = await base44.entities.UserSubscription.filter({ user_id: user.id }, '-created_date', 1).catch(() => []);
    
    if (existingSub.length > 0 && existingSub[0].stripe_customer_id) {
      customerId = existingSub[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${Deno.env.get('BASE44_APP_URL') || 'https://faithlight.app'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('BASE44_APP_URL') || 'https://faithlight.app'}/pricing?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id
      }
    });

    console.log(`[Stripe] Created checkout session ${session.id} for user ${user.id}`);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe] Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});