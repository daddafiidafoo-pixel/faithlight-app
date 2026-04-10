import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')
      );
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Event type: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const customerId = session.customer;

      if (userId && customerId && session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Find or create subscription record
          const existing = await base44.entities.UserSubscription.filter({ user_id: userId }).catch(() => []);
          
          if (existing.length > 0) {
            await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              plan_name: 'Premium Monthly'
            });
          } else {
            await base44.asServiceRole.entities.UserSubscription.create({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              plan_name: 'Premium Monthly'
            });
          }
          console.log(`[Stripe] Subscription created for user ${userId}`);
        } catch (err) {
          console.error('[Stripe] Error processing subscription:', err.message);
        }
      }
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      try {
        // Find user by Stripe customer ID
        const userSubs = await base44.asServiceRole.entities.UserSubscription.filter({ stripe_customer_id: customerId }).catch(() => []);
        
        if (userSubs.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(userSubs[0].id, {
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null
          });
          console.log(`[Stripe] Subscription updated: ${subscription.id}`);
        }
      } catch (err) {
        console.error('[Stripe] Error updating subscription:', err.message);
      }
    }

    // Handle subscription deletion
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      try {
        const userSubs = await base44.asServiceRole.entities.UserSubscription.filter({ stripe_customer_id: customerId }).catch(() => []);
        
        if (userSubs.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(userSubs[0].id, {
            status: 'canceled',
            canceled_at: new Date().toISOString()
          });
          console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
        }
      } catch (err) {
        console.error('[Stripe] Error handling subscription cancellation:', err.message);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});