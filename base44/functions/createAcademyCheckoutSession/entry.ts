import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.25.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Product/Price mapping (Stripe IDs must be set up in Stripe dashboard)
const PLAN_PRICING = {
  academy_monthly: {
    priceId: 'price_academy_monthly', // SET IN STRIPE DASHBOARD
    amount: 999, // $9.99
    interval: 'month',
  },
  academy_yearly: {
    priceId: 'price_academy_yearly', // SET IN STRIPE DASHBOARD
    amount: 7999, // $79.99
    interval: 'year',
  },
};

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

    const { plan, userId, userEmail } = await req.json();

    // Validate plan
    if (!PLAN_PRICING[plan]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const pricing = PLAN_PRICING[plan];

    // Get or create Stripe customer
    let stripeCustomer = null;
    const existingSubs = await base44.entities.UserSubscription.filter({
      user_id: userId,
    });

    if (existingSubs.length > 0 && existingSubs[0].stripe_subscription_id) {
      // Use existing Stripe customer ID if available
      const subscription = await stripe.subscriptions.retrieve(
        existingSubs[0].stripe_subscription_id
      );
      stripeCustomer = { id: subscription.customer };
    } else {
      // Create new Stripe customer
      stripeCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          base44_user_id: userId,
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      mode: 'subscription',
      line_items: [
        {
          price: pricing.priceId,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get('BASE44_APP_URL')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('BASE44_APP_URL')}/subscription-cancelled`,
      metadata: {
        base44_user_id: userId,
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
      },
      subscription_data: {
        metadata: {
          base44_user_id: userId,
          plan,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json(
      { error: `Failed to create checkout session: ${error.message}` },
      { status: 500 }
    );
  }
});