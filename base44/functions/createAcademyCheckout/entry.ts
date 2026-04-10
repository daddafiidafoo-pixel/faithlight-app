/**
 * Create Stripe Checkout Session for Academy Subscription
 * Called from frontend when user clicks "Start Subscription"
 * 
 * Supports both web (Stripe Checkout) and potential IAP handling
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    // Verify user is authenticated
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { priceId, userEmail } = body;

    if (!priceId || !userEmail) {
      return Response.json(
        { error: 'Missing required fields: priceId, userEmail' },
        { status: 400 }
      );
    }

    // Log the checkout attempt (for debugging)
    console.log(`Checkout initiated: user=${user.id}, email=${userEmail}, priceId=${priceId}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get('APP_URL')}/academy-subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/AcademySubscription`,
      // Metadata for transaction tracking (Base44)
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id,
        user_email: userEmail,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_email: userEmail,
        },
      },
    });

    console.log(`Checkout session created: ${session.id}`);

    return Response.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});