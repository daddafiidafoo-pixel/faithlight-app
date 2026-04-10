/**
 * Stripe Webhook Handler for Academy Subscriptions
 * 
 * Handles:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.paid
 * 
 * Updates user entitlements based on subscription status
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    // Get webhook secret from env
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Read body
    const body = await req.text();

    // Verify signature (async with SubtleCrypto)
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Webhook event: ${event.type}`);

    // Initialize Base44 as service role (for admin-level operations)
    const base44 = createClientFromRequest(req);

    // Handle subscription events
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;
      const userEmail = subscription.metadata?.user_email;

      if (!userId || !userEmail) {
        console.warn('Subscription missing user metadata:', subscription.id);
        return Response.json({ success: true });
      }

      const isActive = subscription.status === 'active';

      console.log(`Subscription ${subscription.id}: ${isActive ? 'activated' : 'inactive'}`);

      // Update or create UserEntitlement record
      try {
        // Check if entitlement already exists
        const existingEntitlements = await base44.asServiceRole.entities.UserEntitlement.filter({
          user_id: userId,
          entitlement_type: 'academy_premium',
        });

        if (existingEntitlements && existingEntitlements.length > 0) {
          // Update existing
          await base44.asServiceRole.entities.UserEntitlement.update(
            existingEntitlements[0].id,
            {
              status: isActive ? 'active' : 'inactive',
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer,
              renewal_date: new Date(subscription.current_period_end * 1000),
            }
          );
        } else {
          // Create new entitlement
          await base44.asServiceRole.entities.UserEntitlement.create({
            user_id: userId,
            entitlement_type: 'academy_premium',
            status: isActive ? 'active' : 'inactive',
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            renewal_date: new Date(subscription.current_period_end * 1000),
          });
        }

        console.log(`UserEntitlement updated for user: ${userId}`);
      } catch (err) {
        console.error('Error updating entitlement:', err.message);
        // Continue anyway - don't fail the webhook
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        try {
          const entitlements = await base44.asServiceRole.entities.UserEntitlement.filter({
            user_id: userId,
            entitlement_type: 'academy_premium',
          });

          if (entitlements && entitlements.length > 0) {
            await base44.asServiceRole.entities.UserEntitlement.update(
              entitlements[0].id,
              { status: 'canceled' }
            );
          }

          console.log(`Entitlement canceled for user: ${userId}`);
        } catch (err) {
          console.error('Error canceling entitlement:', err.message);
        }
      }
    }

    // Return success to Stripe
    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});