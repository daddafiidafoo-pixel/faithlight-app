import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('[stripeWebhookHandler] Signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    console.log(`[stripeWebhookHandler] Processing event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(base44, session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(base44, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(base44, subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`[stripeWebhookHandler] Payment failed for subscription ${invoice.subscription}`);
        break;
      }

      default:
        console.log(`[stripeWebhookHandler] Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('[stripeWebhookHandler] Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleCheckoutCompleted(base44, session) {
  try {
    const userEmail = session.metadata?.user_email || session.customer_email;
    const plan = session.metadata?.plan;

    if (!userEmail) {
      console.error('[stripeWebhookHandler] No user email in session');
      return;
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    // Update user subscription data
    await base44.auth.updateMe({
      stripe_customer_id: session.customer,
      stripe_subscription_id: subscription.id,
      subscription_status: 'active',
      subscription_plan: plan,
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    });

    console.log(`[stripeWebhookHandler] Activated premium for ${userEmail}`);
  } catch (error) {
    console.error('[stripeWebhookHandler] Error handling checkout completed:', error);
  }
}

async function handleSubscriptionUpdated(base44, subscription) {
  try {
    const userEmail = subscription.metadata?.user_email;
    const plan = subscription.metadata?.plan;

    if (!userEmail) {
      console.error('[stripeWebhookHandler] No user email in subscription');
      return;
    }

    await base44.auth.updateMe({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_plan: plan,
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    });

    console.log(`[stripeWebhookHandler] Updated subscription for ${userEmail}`);
  } catch (error) {
    console.error('[stripeWebhookHandler] Error handling subscription updated:', error);
  }
}

async function handleSubscriptionCanceled(base44, subscription) {
  try {
    const userEmail = subscription.metadata?.user_email;

    if (!userEmail) {
      console.error('[stripeWebhookHandler] No user email in subscription');
      return;
    }

    await base44.auth.updateMe({
      subscription_status: 'canceled',
      subscription_expires_at: null,
    });

    console.log(`[stripeWebhookHandler] Canceled subscription for ${userEmail}`);
  } catch (error) {
    console.error('[stripeWebhookHandler] Error handling subscription canceled:', error);
  }
}