/**
 * Creates a Stripe Checkout session for web payments.
 * Stores/reuses Stripe customer ID in UserBilling entity.
 * Adds base44_app_id + userId + planKey in metadata.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { price_id, plan_key, success_url, cancel_url } = body;

    if (!price_id || !success_url || !cancel_url) {
      return Response.json({ error: 'Missing required fields: price_id, success_url, cancel_url' }, { status: 400 });
    }

    const db = base44.asServiceRole;
    const appId = Deno.env.get('BASE44_APP_ID');
    const normalizedPlan = String(plan_key || 'PREMIUM').toUpperCase();

    // Reuse existing Stripe customer if available
    const billingRows = await db.entities.UserBilling.filter({ user_id: user.id });
    let billing = billingRows?.[0];
    let customerId = billing?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id, base44_app_id: appId },
      });
      customerId = customer.id;

      const now = new Date().toISOString();
      if (billing?.id) {
        await db.entities.UserBilling.update(billing.id, { stripe_customer_id: customerId, updated_at: now });
      } else {
        billing = await db.entities.UserBilling.create({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan_key: 'FREE',
          status: 'none',
          updated_at: now,
        });
      }
    }

    console.log(`Creating checkout for user=${user.id} plan=${normalizedPlan} price=${price_id}`);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: price_id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url,
      cancel_url,
      metadata: {
        base44_app_id: appId,
        userId: user.id,
        planKey: normalizedPlan,
      },
      subscription_data: {
        metadata: {
          base44_app_id: appId,
          userId: user.id,
          planKey: normalizedPlan,
        },
      },
    });

    console.log(`✅ Checkout session created: ${session.id}`);
    return Response.json({ session_url: session.url, session_id: session.id });
  } catch (err) {
    console.error('❌ createCheckoutSession error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});