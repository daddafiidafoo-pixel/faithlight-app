import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Create a Stripe Customer Portal session
 * Allows users to manage their subscription (cancel, update payment, view invoices)
 */
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

    if (!user.stripe_customer_id) {
      return Response.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${Deno.env.get('APP_URL')}/UserProfile`,
    });

    console.log(`[stripePortalSession] Created portal for ${user.email}`);

    return Response.json({
      success: true,
      portalUrl: portalSession.url,
    });
  } catch (error) {
    console.error('[stripePortalSession] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});