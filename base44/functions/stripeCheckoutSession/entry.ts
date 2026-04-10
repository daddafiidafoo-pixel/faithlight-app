import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

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

    const { plan } = await req.json();

    if (!['monthly', 'yearly'].includes(plan)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Price IDs from Stripe setup ($4.99/mo, $29.99/yr)
    const priceMap = {
      monthly: 'price_1TG7JgCbIJ45iaAT8oBYyQQJ',
      yearly: 'price_1TG7JgCbIJ45iaATfz2wLCYB',
    };

    const priceId = priceMap[plan];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get('APP_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/billing/cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan,
      },
    });

    console.log(`[stripeCheckoutSession] Created session ${session.id} for ${user.email} plan: ${plan}`);

    return Response.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('[stripeCheckoutSession] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});