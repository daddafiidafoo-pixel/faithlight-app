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

    // Get user subscription
    const userSub = await base44.entities.UserSubscription.filter({ user_id: user.id }, '-created_date', 1).catch(() => []);
    
    if (!userSub.length || !userSub[0].stripe_customer_id) {
      return Response.json({ error: 'No subscription found' }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSub[0].stripe_customer_id,
      return_url: `${Deno.env.get('BASE44_APP_URL') || 'https://faithlight.app'}/billing/manage`
    });

    console.log(`[Stripe] Created portal session for user ${user.id}`);

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error('[Stripe] Portal session error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});