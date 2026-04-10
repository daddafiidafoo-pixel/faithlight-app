/**
 * Creates a Stripe Customer Portal session.
 * Uses stored stripe_customer_id from UserBilling entity.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { return_url } = body;

    const billingRows = await base44.asServiceRole.entities.UserBilling.filter({ user_id: user.id });
    const customerId = billingRows?.[0]?.stripe_customer_id;

    if (!customerId) {
      console.warn(`No Stripe customer for user ${user.id}, redirecting to pricing`);
      return Response.json({ portal_url: null, redirect_to_pricing: true });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || 'https://app.faithlight.com/manage-subscription',
    });

    console.log(`✅ Portal session for user ${user.id}`);
    return Response.json({ portal_url: session.url });
  } catch (err) {
    console.error('❌ createStripePortalSession error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});